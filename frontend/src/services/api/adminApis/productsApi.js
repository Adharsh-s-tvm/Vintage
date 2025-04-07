import { API } from '../api';

export const fetchProductCategoriesApi = () => API.get(`/admin/products/categories`);
export const fetchProductBrandsApi = () => API.get(`/admin/products/brands`);
export const fetchProductApi = (params) => API.get(`/admin/products?${params}`);
export const addProductApi = (data) => API.post(`/admin/products/add`, data);
export const addProductVariantApi = (data) => API.post(`/admin/products/variant/add`, data);
export const updateProductApi = (productId, data) => API.put(`/admin/products/${productId}`, data);
export const updateProductVariantApi = (variantId, data) => API.put(`/admin/products/variant/${variantId}`, data);
export const blockProductApi = (productId, data) => API.put(`/admin/products/product/${productId}/block`, data);
export const blockProductVariantApi = (variantId, data) => API.put(`/admin/products/variant/${variantId}/block`, data);
export const toggleProductStatusApi = (productId, data) => API.put(`/admin/products/${productId}/status`, data);
