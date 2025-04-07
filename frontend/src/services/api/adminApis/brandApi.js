import { API } from '../api';

export const fetchBrandsApi = (params) => API.get(`/admin/products/brands?${params}`);
export const updateBrandApi = (id, data) => API.put(`/admin/products/brand/${id}`, data);
export const addBrandApi = (data) => API.post(`/admin/products/brand/add`, data);
export const changeStatusApi = (id, data) => API.put(`/admin/products/brand/${id}/status`, data);
export const fetchAllBrandsApi = () => API.get(`/admin/products/brands/all`);
