import { API } from '../api';

export const fetchReturnsApi = (params) => API.get(`/admin/orders/returns?${params}`);
export const updateReturnApi = (orderId, itemId, data) =>
  API.put(`/admin/orders/${orderId}/items/${itemId}/return`, {
    action: data.returnStatus === 'accept' ? 'accept' : 'reject'
  });
