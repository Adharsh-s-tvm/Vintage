import { useState, useEffect } from "react";
import { toast } from "sonner";
import { resendOtpApi } from "../../services/api/userApis/userAuthApi";

const OtpModal = ({ formData, showOtpModal, setShowOtpModal, verifyOtpAndSignup }) => {
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (showOtpModal && timer > 0) {
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
    }, [showOtpModal, timer]);

    const handleResendOtp = async () => {
        try {
            const response = resendOtpApi( {
                email: formData.email.toLowerCase()
            });

            if (response.data) {
                toast.success("OTP resent successfully!", { position: "top-center" });
                setTimer(60);
                setCanResend(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error resending OTP";
            toast.error(errorMessage, { position: "top-center" });
        }
    };

    if (!showOtpModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Please enter the OTP sent to {formData?.email}
                </p>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mb-4 p-2 border rounded w-full"
                />
                <div className="text-sm text-gray-600 mb-4">
                    {timer > 0 ? (
                        <p>Resend OTP in {timer} seconds</p>
                    ) : (
                        <button
                            onClick={handleResendOtp}
                            className="text-blue-500 hover:text-blue-700"
                            disabled={!canResend}
                        >
                            Resend OTP
                        </button>
                    )}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => verifyOtpAndSignup(otp)}
                        className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        Verify OTP
                    </button>
                    <button
                        onClick={() => setShowOtpModal(false)}
                        className="flex-1 border border-gray-300 p-2 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpModal;
