import { privateAPI } from '../api';

export const fetchCartApi = () => privateAPI.get('/user/cart');
export const updateQuantityApi = (variantId, quantity) => privateAPI.put(`/user/cart/update`, { variantId, quantity });
export const confirmRemoveApi = (variantId) => privateAPI.delete(`/user/cart/remove/${variantId}`, { variantId });
