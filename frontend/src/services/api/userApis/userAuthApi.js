import { API } from "../api";

export const responseGoogleApi = (code) => API.post(`/google`, code)
export const checkEmailApi = (email) => API.post(`/check-email`, email)
export const sendOtpApi = (email) => API.post(`/user/otp/send`, email)
export const verifyOtpApi = (email, otp) => API.post(`/user/otp/verify`, { email, otp })
export const resetPasswordApi = (email, password) => API.post(`/reset-password`, { email, password })

export const userSignupOtpApi = (data) => API.post(`/user/otp/send`, data)
export const userVerifyOtpApi = (data) => API.post(`/user/otp/verify`, data)
export const userSignupApi = (data) => API.post(`/signup`, data)
export const resendOtpApi = (data) => API.post(`/user/otp/resend`, data)
