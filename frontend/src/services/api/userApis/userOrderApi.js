import { API } from '../api';

export const fetchOrderDetailsApi = (orderId) => API.get(`/user/orders/${orderId}`)
export const downloadInvoiceApi = (orderId) => API.get(`/user/orders/${orderId}/invoice`, {
  responseType: 'blob'
})


export const retryPaymentResponseApi = (data) => API.post('/payments/create-order', data)
export const verifyFailedPaymentAPi = (data) => API.post('/payments/verify', data)

export const userfetchOrdersApi = (params) => API.get(`/user/orders?${params}`)
export const userCancelOrderApi = (orderId, reason) => API.put(`/user/orders/${orderId}/cancel`, { reason })
export const userReturnOrderApi = (orderId, data) => API.post(`/user/orders/${orderId}/return`, data)
export const userReturnOrderItemApi = (orderId, itemId, data) =>
  API.post(`/user/orders/${orderId}/items/${itemId}/return`, data);
