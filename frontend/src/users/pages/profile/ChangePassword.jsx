import React, { useState } from 'react';
import { Layout } from '../../layout/Layout';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Label } from '../../../ui/Label';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { api } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';

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
            const response = await axios.put(
                `${api}/user/profile/change-password`,
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

    const handleForgotPassword = async () => {
        const email = prompt('Please enter your email address');
        if (!email) return;

        try {
            setLoading(true);
            await axios.post(`${api}/user/forgot-password`, { email });
            toast.success('Password reset link sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
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
                                onClick={handleForgotPassword}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Forgot Password?
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default ChangePassword;