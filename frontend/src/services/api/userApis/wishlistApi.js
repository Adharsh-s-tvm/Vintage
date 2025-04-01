import { privateAPI } from '../api';

export const wishlistCountApi = () => privateAPI.get('/user/wishlist');
