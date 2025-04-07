import { API } from '../api';

export const fetchCouponsApi = (params) => API.get(`/admin/coupons?${params}`);
export const addCouponApi = (data) => API.post(`/admin/coupons`, data);
export const updateCouponApi = (id, data) => API.put(`/admin/coupons/${id}`, data);
export const toggleCouponStatusApi = (id) => API.patch(`/admin/coupons/${id}/toggle-status`);
