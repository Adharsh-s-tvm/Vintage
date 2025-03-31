import { privateAPI } from './api';

export const fetchBrandsApi = (params) => privateAPI.get(`/admin/products/brands?${params}`);
export const updateBrandApi = (id, data) => privateAPI.put(`/admin/products/brand/${id}`, data);
export const addBrandApi = (data) => privateAPI.post(`/admin/products/brand/add`, data);
export const changeStatusApi = (id, data) => privateAPI.put(`/admin/products/brand/${id}/status`, data);
