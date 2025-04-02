import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminInfo } from '../../redux/slices/adminSlice';
import { loginAdmin } from '../../redux/api/adminApi';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const admin = useSelector(state => state.admin.data);

    // Check if already logged in
    useEffect(() => {
        const adminInfo = localStorage.getItem('adminInfo');
        if (adminInfo && admin) {
            navigate('/admin');
        }
    }, [admin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const data = await loginAdmin(email, password);
            console.log('Login Data:', data);

            if (data) {
                // Store admin info in Redux
                dispatch(setAdminInfo(data));
                
                // Store admin info in localStorage
                localStorage.setItem('adminInfo', JSON.stringify(data));
                
                // Store token in localStorage
                if (data.token) {
                    localStorage.setItem('jwt', data.token);
                }

                toast.success('Successfully signed in!');
                navigate('/admin');
            } else {
                throw new Error('Login failed: No data received');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            {/* <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <a href="#" className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            {/* <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </form>

                {/* Rest of the component remains the same */}
                {/* <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div> */}

                {/* <div className="mt-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <span className="text-xs font-medium text-gray-500">OR CONTINUE WITH</span>
                    <div className="h-px flex-1 bg-gray-100"></div>
                </div> */}

               

                
            </div>
        </div>
    );
}