import React, { useState } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { changePasswordApi, checkEmailApi } from '../../../services/api/userApis/profileApi';
import { resetPasswordApi, sendOtpApi, verifyOtpApi } from '../../../services/api/userApis/userAuthApi';

function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await changePasswordApi(
                {
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Password changed successfully');
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            navigate('/profile');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            setIsResetting(true);
            // Check if email exists
            const checkEmailResponse = await checkEmailApi ({ email: resetEmail });

            if (!checkEmailResponse.data.exists) {
                toast.error('Email not found in our records');
                return;
            }

            // If email exists, send OTP
            const response = await sendOtpApi ({ email: resetEmail });
            toast.success('OTP sent to your email!');
            setIsModalOpen(false);
            setOtpModalOpen(true);
        } catch (error) {
            toast.error('Failed to send OTP: ' + error.response?.data?.message || error.message);
        } finally {
            setIsResetting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await verifyOtpApi ({
                email: resetEmail,
                otp: otp
            });

            if (response.data.success) {
                toast.success('OTP verified successfully!');
                setOtpModalOpen(false);
                setNewPasswordModalOpen(true);
            }
        } catch (error) {
            toast.error('Invalid OTP');
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (resetNewPassword !== resetConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const response = await resetPasswordApi ({
                email: resetEmail,
                password: resetNewPassword
            });

            toast.success('Password reset successfully!');
            setNewPasswordModalOpen(false);
            navigate('/profile');
        } catch (error) {
            toast.error('Failed to reset password');
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Lock className="h-5 w-5 text-gray-600" />
                        <h1 className="text-xl font-bold">Change Password</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type={showPasswords.oldPassword ? "text" : "password"}
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('oldPassword')}
                                >
                                    {showPasswords.oldPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPasswords.newPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('newPassword')}
                                >
                                    {showPasswords.newPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPasswords.confirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => togglePasswordVisibility('confirmPassword')}
                                >
                                    {showPasswords.confirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </Button>

                            <Button
                                type="button"
                                variant="link"
                                onClick={() => setIsModalOpen(true)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Forgot Password?
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-10"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1" disabled={isResetting}>
                                    {isResetting ? 'Sending...' : 'Send OTP'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            {otpModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP sent to your email</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">Verify OTP</Button>
                                <Button type="button" variant="outline" onClick={() => setOtpModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Password Modal */}
            {newPasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={resetNewPassword}
                                    onChange={(e) => setResetNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={resetConfirmPassword}
                                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1">Save New Password</Button>
                                <Button type="button" variant="outline" onClick={() => setNewPasswordModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

export default ChangePassword;