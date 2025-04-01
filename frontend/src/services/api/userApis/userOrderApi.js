import { privateAPI } from '../api';

export const fetchOrderDetailsApi = (orderId) => privateAPI.get(`/user/orders/${orderId}`)
export const downloadInvoiceApi = (orderId) => privateAPI.get(`/user/orders/${orderId}/invoice`, {
    responseType: 'blob'
})
export const retryPaymentResponseApi = (data) => privateAPI.post('/payments/create-order', data)
export const verifyFailedPaymentAPi = (data) => privateAPI.post('/payments/verify', data)