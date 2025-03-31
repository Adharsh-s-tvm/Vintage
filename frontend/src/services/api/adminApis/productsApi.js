import { privateAPI } from '../api';

export const fetchProductCategoriesApi = () => privateAPI.get(`/admin/products/categories`);
export const fetchProductBrandsApi = () => privateAPI.get(`/admin/products/brands`);
export const fetchProductApi = (params) => privateAPI.get(`/admin/products?${params}`);
export const addProductApi = (data) => privateAPI.post(`/admin/products/add`, data);
export const addProductVariantApi = (data) => privateAPI.post(`/admin/products/variant/add`, data);
export const updateProductApi = (productId, data) => privateAPI.put(`/admin/products/${productId}`, data);
export const updateProductVariantApi = (variantId, data) => privateAPI.put(`/admin/products/variant/${variantId}`, data);
export const blockProductApi = (productId, data) => privateAPI.put(`/admin/products/product/${productId}/block`, data);
export const blockProductVariantApi = (variantId, data) => privateAPI.put(`/admin/products/variant/${variantId}/block`, data);
export const toggleProductStatusApi = (productId, data) => privateAPI.put(`/admin/products/${productId}/status`, data);
