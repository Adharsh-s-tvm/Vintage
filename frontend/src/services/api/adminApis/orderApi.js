import { API } from '../api';

export const fetchOrdersApi = (params) => API.get(`/admin/orders?${params}`);
export const updateOrderStatusApi = (orderId, status) => API.patch(`/admin/orders/${orderId}/status`, { status });
