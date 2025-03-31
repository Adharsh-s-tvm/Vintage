import { privateAPI } from './api';

export const fetchBrandsApi = (params) => privateAPI.get(`/admin/products/brands?${params}`);
export const UpdateBandApi = (id, data) => privateAPI.put(`/admin/products/brands/${id}`, data);

