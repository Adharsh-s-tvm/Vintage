import { API } from '../api';

export const fetchCategoriesApi = (params) => API.get(`/admin/products/categories?${params}`);
export const updateCategoryApi = (id, data) => API.put(`/admin/products/category/${id}`, data);
export const addCategoryApi = (data) => API.post(`/admin/products/category/add`, data);
export const changeStatusApi = (id, data) => API.put(`/admin/products/category/${id}/status`, data);
export const fetchAllCategoriesApi = () => API.get(`/admin/products/categories/all`);
