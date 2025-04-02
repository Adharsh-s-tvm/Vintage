import { privateAPI } from '../api';

export const fetchReturnsApi = (params) => privateAPI.get(`/admin/orders/returns?${params}`);
export const updateReturnApi = (orderId, itemId, data) => 
  privateAPI.put(`/admin/orders/${orderId}/items/${itemId}/return`, { 
    action: data.returnStatus === 'accept' ? 'accept' : 'reject' 
  });
