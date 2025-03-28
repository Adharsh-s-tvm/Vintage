import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser } from '../../redux/api/userApi';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../../redux/slices/authSlice';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../utils/apiGoogle';
import axios from 'axios';
import { api } from '../../lib/api';

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPasswordModalOpen, setNewPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Move responseGoogle function before it's used
  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const result = await axios.post('http://localhost:7000/api/google', {
          code: authResult.code
        });

        console.log("Authentication result:", result);

        if (result.data.token) {
          // Store token
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('jwt', result.data.token);

          // Store user info in localStorage and Redux
          localStorage.setItem('userInfo', JSON.stringify(result.data.user));
          dispatch(setUserInfo(result.data.user));

          toast.success('Successfully signed in with Google!');
          navigate('/');
        }
      }
    } catch (error) {
      console.error("Error during Google login:", error.response?.data || error.message);
      toast.error('Google login failed: ' + error.response?.data?.message || error.message);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code'
  });

  useEffect(() => {
    // Check for both JWT token and userInfo
    const token = localStorage.getItem('jwt');
    const userInfo = localStorage.getItem('userInfo');

    if (token && userInfo) {
      navigate('/');
      toast.info('You are already logged in');
    } else {
      setIsAuthenticated(false);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await loginUser(email, password);
      console.log('Login Data:', data);

      if (data) {
        dispatch(setUserInfo(data));
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (data.token) {
          localStorage.setItem('jwt', data.token);
        }

        toast.success('Successfully signed in!');
        navigate('/');
      } else {
        throw new Error('Login failed: No data received');
      }
    } catch (error) {
      toast.error('Login failed: ' + error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setIsResetting(true);
      // First check if email exists
      const checkEmailResponse = await axios.post(`${api}/check-email`, { email: resetEmail });

      if (!checkEmailResponse.data.exists) {
        toast.error('Email not found in our records');
        return;
      }

      // If email exists, send OTP
      const response = await axios.post(`${api}/user/otp/send`, { email: resetEmail });
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
    console.log('called verify frontend');

    e.preventDefault();
    try {
      const response = await axios.post(`${api}/user/otp/verify`, {
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
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${api}/reset-password`, {
        email: resetEmail,
        password: newPassword
      });

      toast.success('Password reset successfully!');
      setNewPasswordModalOpen(false);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  // Modify the early return to check for both token and userInfo
  const token = localStorage.getItem('jwt');
  const userInfo = localStorage.getItem('userInfo');

  if (token && userInfo) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome User</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-100"></div>
          <span className="text-xs font-medium text-gray-500">OR CONTINUE WITH</span>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <div className="mt-6 grid grid-cols- gap-4">
          <Button variant="outline" className="w-full" onClick={googleLogin} >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_17_40)">
                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Google
          </Button>
          {/* <Button variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </Button> */}
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  {/* <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isResetting}
                >
                  {isResetting ? 'Sending...' : 'Send Otp'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
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
                <Button type="submit" className="flex-1">
                  Verify OTP
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOtpModalOpen(false)}
                >
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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Save New Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 