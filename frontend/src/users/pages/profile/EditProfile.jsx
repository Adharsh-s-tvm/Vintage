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

function EditProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(userInfo?.image || null);

    const [formData, setFormData] = useState({
        firstname: userInfo?.firstname || '',
        lastname: userInfo?.lastname || '',
        email: userInfo?.email || '',
        username: userInfo?.username || '',
        mobile: userInfo?.mobile || '',
        image: userInfo?.image || '',
    });

    const handleProfileUpdate = async () => {
        try {
            const response = await axios.put('/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
            });

            // Update both Redux state and localStorage
            const updatedUserInfo = { ...userInfo, ...response.data };
            dispatch(setUserInfo(updatedUserInfo));
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            toast.success('Profile updated successfully');
            navigate('/profile'); // Navigate back to profile page
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                setLoading(true);
                const response = await axios.post('/api/users/upload-image', formData, {
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
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
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
        </Layout>
    );
}

export default EditProfile; 