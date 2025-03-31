import { privateAPI } from '../api';

export const offerFetchProductsApi = () => privateAPI.get(`/admin/products/`);
export const offerFetchCategoriesApi = () => privateAPI.get(`/admin/products/categories`);

export const fetchOffersApi = (params) => privateAPI.get(`/admin/offers?${params}`);
export const addOfferApi = (data) => privateAPI.post(`/admin/offers`, data);
export const updateOfferApi = (id, data) => privateAPI.put(`/admin/offers/${id}`, data);
export const toggleOfferStatusApi = (id) => privateAPI.patch(`/admin/offers/${id}/toggle-status`);
export const fetchAffectedProductsApi = (id) => privateAPI.get(`/admin/offers/${id}/affected-products`);
export const fetchAffectedCategoriesApi = (id) => privateAPI.get(`/admin/offers/${id}/affected-categories`);
