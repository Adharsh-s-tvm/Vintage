import API from './api';

export const fetchCartApi = () => API.get('/user/cart');
export const updateQuantityApi = (variantId, quantity) => API.put(`/user/cart/update`, { variantId, quantity });
export const confirmRemoveApi = (variantId) => API.delete(`/user/cart/remove/${variantId}`, { variantId });
