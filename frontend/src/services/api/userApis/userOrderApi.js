import { privateAPI } from '../api';

export const fetchOrderDetailsApi = (orderId) => privateAPI.get(`/user/orders/${orderId}`)
export const downloadInvoiceApi = (orderId) => privateAPI.get(`/user/orders/${orderId}/invoice`, {
    responseType: 'blob'
})


export const retryPaymentResponseApi = (data) => privateAPI.post('/payments/create-order', data)
export const verifyFailedPaymentAPi = (data) => privateAPI.post('/payments/verify', data)

export const userfetchOrdersApi = (params) => privateAPI.get(`/user/orders?${params}`)
export const userCancelOrderApi = (orderId, reason) => privateAPI.put(`/user/orders/${orderId}/cancel`, { reason })
export const userReturnOrderApi = (orderId, data) => privateAPI.post(`/user/orders/${orderId}/return`, data)
