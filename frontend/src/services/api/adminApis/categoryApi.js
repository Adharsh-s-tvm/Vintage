import { privateAPI } from '../api';

export const fetchCategoriesApi = (params) => privateAPI.get(`/admin/products/categories?${params}`);
export const updateCategoryApi = (id, data) => privateAPI.put(`/admin/products/category/${id}`, data);
export const addCategoryApi = (data) => privateAPI.post(`/admin/products/category/add`, data);
export const changeStatusApi = (id, data) => privateAPI.put(`/admin/products/category/${id}/status`, data);
