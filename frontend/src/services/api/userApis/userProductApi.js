import { API } from '../api';

export const fetchProductDetailApi = (id) => API.get(`/products/${id}`)
export const fetchRelatedProductsApi = (data) => API.get(`/products`, data)
export const addToCartApi = (data) => API.post(`/user/cart/add`, data)
export const addToWishlistApi = (data) => API.post(`/user/wishlist`, data)

export const productsListHandleSearch = (search) => API.get(`/api/products/search?keyword=${search}`)
export const productsListfetchProducts = (params) => API.get(`/products?${params}`)
export const productsListfetchCategories = () => API.get(`/products/categories`)
export const productsListfetchBrands = () => API.get(`/products/brands`)

export const globalSearchApi = (searchTerm) => API.get(`/products/search?keyword=${searchTerm}`)