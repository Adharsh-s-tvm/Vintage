import { publicAPI } from "../api";

export const responseGoogleApi = (code) => publicAPI.post(`/google`, code)
export const checkEmailApi = (email) => publicAPI.post(`/check-email`, email) 
export const sendOtpApi = (email) => publicAPI.post(`/user/otp/send`, email)
export const verifyOtpApi = (email, otp) => publicAPI.post(`/user/otp/verify`, { email, otp })
export const resetPasswordApi = (email, password) => publicAPI.post(`/reset-password`, { email, password })

export const userSignupOtpApi = (data) => publicAPI.post(`/user/otp/send`, data)
export const userVerifyOtpApi = (data) => publicAPI.post(`/user/otp/verify`, data)
export const userSignupApi = (data) => publicAPI.post(`/signup`, data)
export const resendOtpApi = (data) => publicAPI.post(`/user/otp/resend`, data)
