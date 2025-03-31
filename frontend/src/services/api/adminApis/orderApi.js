import { privateAPI } from '../api';

export const fetchOrdersApi = (params) => privateAPI.get(`/admin/orders?${params}`);
export const updateOrderStatusApi = (orderId, status) => privateAPI.patch(`/admin/orders/${orderId}/status`, { status });
