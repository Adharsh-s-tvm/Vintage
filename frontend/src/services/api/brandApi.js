import { privateAPI } from './api';

export const fetchBrandsApi = (params) => privateAPI.get(`/admin/products/brands?${params}`);
export const updateBrandApi = (id, data) => privateAPI.put(`/admin/products/brand/${id}`, data);


