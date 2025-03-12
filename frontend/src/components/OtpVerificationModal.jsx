import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const OtpVerificationModal = ({ isOpen, onClose, onVerify, email, onResend }) => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(60); // 1 minute in seconds
    const [error, setError] = useState('');
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }

        if (timer === 0) {
            setIsResendDisabled(false);
        }

        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const handleResend = async () => {
        try {
            await onResend();
            setTimer(60);
            setIsResendDisabled(true);
            setOtp('');
            setError('');
        } catch (error) {
            setError('Failed to resend OTP');
        }
    };

    const handleSubmit = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        try {
            await onVerify(otp);
        } catch (error) {
            setError('Invalid OTP. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
                <p className="text-gray-600 mb-6">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold">{email}</span>
                </p>

                <div className="space-y-4">
                    <Input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setOtp(value);
                            setError('');
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="text-center text-lg tracking-wider"
                    />

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Time remaining: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </span>
                        <button
                            onClick={handleResend}
                            disabled={isResendDisabled}
                            className={`text-sm ${isResendDisabled
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-800'}`}
                        >
                            Resend Code
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            onClick={handleSubmit}
                            className="w-full"
                        >
                            Verify
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationModal; 