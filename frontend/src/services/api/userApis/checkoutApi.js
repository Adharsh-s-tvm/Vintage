import { privateAPI } from '../api';

export const checkoutAddressApi = (data) => privateAPI.post('/user/profile/address', data);
export const fetchCheckoutAddressApi = () => privateAPI.get('/user/profile/address');
export const fetchCheckoutCouponsApi = () => privateAPI.get('/user/coupons/available');
export const fetchCheckoutWalletBalanceApi = () => privateAPI.get('/user/profile/wallet');
export const orderResponseApi = (data) => privateAPI.post(`/user/orders`, data)
export const paymentResponseApi = (data) => privateAPI.post(`/payments/create-order`, data)
export const verifyResponseApi = (data) => privateAPI.post('/payments/verify', data )
export const applyCouponApi = (data) => privateAPI.post('/user/coupons/apply', data)
export const calculateCouponApi = (data) => privateAPI.post('/user/coupons/calculate-price', data)
