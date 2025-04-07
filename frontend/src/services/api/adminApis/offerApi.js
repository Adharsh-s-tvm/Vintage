import { API } from '../api';

export const offerFetchProductsApi = () => API.get(`/admin/products/`);
export const offerFetchCategoriesApi = () => API.get(`/admin/products/categories`);

export const fetchOffersApi = (params) => API.get(`/admin/offers?${params}`);
export const addOfferApi = (data) => API.post(`/admin/offers`, data);
export const updateOfferApi = (id, data) => API.put(`/admin/offers/${id}`, data);
export const toggleOfferStatusApi = (id) => API.patch(`/admin/offers/${id}/toggle-status`);
export const fetchAffectedProductsApi = (id) => API.get(`/admin/offers/${id}/affected-products`);
export const fetchAffectedCategoriesApi = (id) => API.get(`/admin/offers/${id}/affected-categories`);

export const fetchAllProductsForOfferApi = () => API.get('/admin/offers/products/all')
export const fetchAllCategoriesForOfferApi = () => API.get('/admin/offers/categories/all')
