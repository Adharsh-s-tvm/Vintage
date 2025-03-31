import { privateAPI } from '../api';

export const fetchCouponsApi = (params) => privateAPI.get(`/admin/coupons?${params}`);
export const addCouponApi = (data) => privateAPI.post(`/admin/coupons`, data);
export const updateCouponApi = (id, data) => privateAPI.put(`/admin/coupons/${id}`, data);
export const toggleCouponStatusApi = (id) => privateAPI.patch(`/admin/coupons/${id}/toggle-status`);
