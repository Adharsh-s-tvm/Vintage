import { API } from '../api';

export const checkoutAddressApi = (data) => API.post('/user/profile/address', data);
export const fetchCheckoutAddressApi = () => API.get('/user/profile/address');
export const fetchCheckoutCouponsApi = () => API.get('/user/coupons/available');
export const fetchCheckoutWalletBalanceApi = () => API.get('/user/profile/wallet');
export const orderResponseApi = (data) => API.post(`/user/orders`, data)
export const paymentResponseApi = (data) => API.post(`/payments/create-order`, data)
export const verifyResponseApi = (data) => API.post('/payments/verify', data)
export const applyCouponApi = (data) => API.post('/user/coupons/apply', data)
export const calculateCouponApi = (data) => API.post('/user/coupons/calculate-price', data)
