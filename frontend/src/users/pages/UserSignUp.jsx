import React, { useCallback, useState } from 'react'
import { Label } from '../../ui/Label';
import { ArrowRight, Mail, Lock, User, EyeOff, Eye } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Link, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { setUserInfo } from '../../redux/slices/authSlice';
import { api } from '../../lib/api';
import OtpModal from './otpModal';

function UserSignUp() {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();


    // const [name, setName] = useState('');
    // const [email, setEmail] = useState('');
    // const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(60);
    const [email, setEmail] = useState(formData.email)



    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email, password, confirmPassword } = formData;

        // Check for empty or whitespace-only names
        if (!firstName?.trim() || !lastName?.trim()) {
            toast.error("First name and last name cannot be empty", { position: "top-center" });
            return;
        }

        // Check for minimum length after trimming whitespace
        if (firstName.trim().length < 2) {
            toast.error("First name must be at least 2 characters long", { position: "top-center" });
            return;
        }

        if (lastName.trim().length < 1) {
            toast.error("Last name must be at least 1 character long", { position: "top-center" });
            return;
        }

        if (!validateEmail(email)) {
            toast.error("Please enter a valid email address", { position: "top-center" });
            return;
        }

        if (!validatePassword(password)) {
            toast.error(
                "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters",
                { position: "top-center" }
            );
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", { position: "top-center" });
            return;
        }

        try {
            // First send OTP
            const otpResponse = await axios.post("http://localhost:7000/api/user/otp/send", {
                email: email.toLowerCase()
            });

            if (otpResponse.data) {
                toast.success("OTP sent to your email!", { position: "top-center" });
                setShowOtpModal(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error sending OTP";
            toast.error(errorMessage, { position: "top-center" });
        }
    };

    const verifyOtpAndSignup = async (otp) => {
        console.log("Thisd is the otp bu yusser", otp);

        try {
            // First verify OTP
            const verifyResponse = await axios.post("http://localhost:7000/api/user/otp/verify", {
                email: formData.email.toLowerCase(),
                otp,
            });

            if (verifyResponse.data.success) {
                // If OTP is verified, proceed with signup
                const signupData = {
                    firstname: formData.firstName.trim(),
                    lastname: formData.lastName.trim(),
                    email: formData.email.toLowerCase(),
                    password: formData.password
                };

                const response = await axios.post("http://localhost:7000/api/signup", signupData, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (response.data) {
                    const userData = {
                        name: `${response.data.firstname} ${response.data.lastname}`,
                        email: response.data.email,
                    };

                    dispatch(setUserInfo(userData));
                    localStorage.setItem('userInfo', JSON.stringify(userData));
                    toast.success("Signup successful!", { position: "top-center" });

                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Invalid OTP";
            setOtpError(errorMessage);
            toast.error(errorMessage, { position: "top-center" });
        }
    };

    // const sendOtp = async () => {
    //     try {
    //         const { data } = await axios.post(`${api}/user/otp/send`, { email });
    //         setOtpSent(true);
    //         setMessage(data.message);
    //         startTimer();
    //     } catch (error) {
    //         setMessage(error.response?.data?.message || "Error sending OTP");
    //     }
    // };

    // const verifyOtp = async () => {
    //     try {
    //         const { data } = await axios.post(`${api}/user/otp/verify`, { email, otp });
    //         setMessage(data.message);
    //     } catch (error) {
    //         setMessage(error.response?.data?.message || "Error verifying OTP");
    //     }
    // };

    const startTimer = () => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev === 1) clearInterval(interval);
                return prev - 1;
            });
        }, 1000);
    };

    const handleOtp = useCallback(() => {
        console.log();

    })

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <ToastContainer />
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 w-full max-w-md animate-fade-in">
                <div className="text-center ">
                    <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
                    <p className="text-gray-500">Sign up to get started with our platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-1">
                    <div className="space-y-2">
                        <Label htmlFor="name">First Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="First Name"
                                className="pl-10"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Last Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Last Name"
                                className="pl-10"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.password}
                                onChange={handleChange}
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
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters long
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="pl-10"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters long
                        </p>
                    </div>

                    <Button type="submit" className="w-full">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        Already have an account?{' '}
                        <Link to="/signin" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="mt-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <span className="text-xs font-medium text-gray-500">OR CONTINUE WITH</span>
                    <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
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
                    <Button variant="outline" className="w-full">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        GitHub
                    </Button>
                </div>
            </div>
            <OtpModal
                formData={formData}
                showOtpModal={showOtpModal}
                setShowOtpModal={setShowOtpModal}
                verifyOtpAndSignup={verifyOtpAndSignup}
            />
        </div>
    )
}

export default UserSignUp