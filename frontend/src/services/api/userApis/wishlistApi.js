import { API } from '../api';

export const wishlistCountApi = () => API.get('/user/wishlist');
export const fetchWishlistApi = () => API.get('/user/wishlist');
export const removeWishlistApi = (id) => API.delete(`/user/wishlist/${id}`);
export const moveToCartApi = (data) => API.post('/user/cart/add', data);
