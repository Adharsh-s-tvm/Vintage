import { privateAPI } from '../api';

export const wishlistCountApi = () => privateAPI.get('/user/wishlist');
export const fetchWishlistApi = () => privateAPI.get('/user/wishlist');
export const removeWishlistApi = (id) => privateAPI.delete(`/user/wishlist/${id}`);
export const moveToCartApi = (data) => privateAPI.post('/user/cart/add', data);
