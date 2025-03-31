import React, { useState, useEffect } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../../../redux/slices/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/apiCall';

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(userInfo?.image || null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        username: '',
        phone: '',
        image: ''
    });

    // Timer for OTP resend
    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        setCanResend(true);
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    // Updated fetchUserData function with better error handling
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    toast.error('Authentication token not found');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${api}/user/profile/details`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data) {
                    // Pre-fill the form with current user data
                    setFormData({
                        firstname: response.data.firstname || '',
                        lastname: response.data.lastname || '',
                        email: response.data.email || '',
                        username: response.data.username || '',
                        phone: response.data.phone || '',
                        image: response.data.image || ''
                    });
                    setProfileImage(response.data.image || null);
                } else {
                    throw new Error('No data received from server');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
                const errorMessage = error.response?.data?.message || 
                                   error.message || 
                                   'Failed to fetch user details';
                toast.error(errorMessage);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleProfileUpdate = async () => {
        try {
            const response = await axios.put(
                `${api}/user/profile/details`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`
                    }
                }
            );

            // Update both Redux state and localStorage
            dispatch(setUserInfo(response.data));
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                setLoading(true);
                const response = await axios.post(`${api}/user/profile/upload-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`
                    }
                });

                setProfileImage(response.data.imageUrl);
                setFormData(prev => ({ ...prev, image: response.data.imageUrl }));
                toast.success('Profile image updated successfully');
            } catch (error) {
                toast.error('Failed to upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSendOtp = async () => {
        if (!newEmail) {
            toast.error('Please enter a new email address');
            return;
        }

        try {
            setOtpLoading(true);
            const response = await axios.post(
                `${api}/user/otp/send`,
                { email: newEmail }
            );
            
            setOtpSent(true);
            setTimer(60);
            setCanResend(false);
            toast.success('OTP sent to your new email address');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        try {
            setOtpLoading(true);
            // First verify OTP
            const response = await axios.post(
                `${api}/user/otp/verify`,
                { email: newEmail, otp }
            );
            
            if (response.data.success) {
                setOtpVerified(true);
                toast.success('Email verified successfully');
                
                // Update email in the database
                try {
                    const token = localStorage.getItem('jwt');
                    const updateResponse = await axios.put(
                        `${api}/user/profile/details`,  // Using existing profile update endpoint
                        { ...formData, email: newEmail },  // Send all form data with new email
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    // Update form data with new email
                    setFormData(prev => ({ ...prev, email: newEmail }));
                    
                    // Update Redux state
                    dispatch(setUserInfo({
                        ...userInfo,
                        email: newEmail
                    }));
                    
                    // Close modal after a short delay
                    setTimeout(() => {
                        setShowEmailModal(false);
                        setOtpSent(false);
                        setOtpVerified(false);
                        setOtp('');
                        setNewEmail('');
                    }, 1500);

                    toast.success('Email updated successfully');
                } catch (updateError) {
                    console.error('Error updating email:', updateError);
                    toast.error(updateError.response?.data?.message || 'Failed to update email');
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setOtpLoading(true);
            const response = await axios.post(
                `${api}/user/otp/send`,
                { email: newEmail }
            );
            
            setTimer(60);
            setCanResend(false);
            toast.success('OTP resent to your new email address');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold">Edit Profile</h1>
                        <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                            Cancel
                        </Button>
                    </div>

                    {/* Profile Image Section */}
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Camera className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer">
                                <Camera className="h-4 w-4" />
                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                            </label>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstname">First Name</Label>
                            <Input
                                id="firstname"
                                value={formData.firstname}
                                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input
                                id="lastname"
                                value={formData.lastname}
                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="flex items-center mt-1 space-x-2">
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowEmailModal(true)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="phone">Mobile Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Button onClick={handleProfileUpdate} disabled={loading}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Email Change Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Change Email Address</h2>
                        
                        {!otpSent ? (
                            <>
                                <div className="mb-4">
                                    <Label htmlFor="newEmail">New Email Address</Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter your new email address"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowEmailModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSendOtp}
                                        disabled={otpLoading}
                                    >
                                        {otpLoading ? 'Sending...' : 'Send OTP'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-2">
                                        We've sent a verification code to <strong>{newEmail}</strong>
                                    </p>
                                    <Label htmlFor="otp">Enter OTP</Label>
                                    <Input
                                        id="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter the 6-digit code"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    {timer > 0 ? (
                                        <p className="text-sm text-gray-600">Resend OTP in {timer} seconds</p>
                                    ) : (
                                        <button 
                                            className="text-sm text-primary hover:underline"
                                            onClick={handleResendOtp}
                                            disabled={otpLoading || !canResend}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowEmailModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleVerifyOtp}
                                        disabled={otpLoading || otpVerified}
                                    >
                                        {otpLoading ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default EditProfile; 