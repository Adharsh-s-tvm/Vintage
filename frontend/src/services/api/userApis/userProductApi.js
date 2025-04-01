import { publicAPI } from '../api';

export const fetchProductDetailApi = (id) => publicAPI.get(`/products/${id}`)
export const fetchRelatedProductsApi = (data) => publicAPI.get(`/products`, data)
export const addToCartApi = (data) => publicAPI.post(`/user/cart/add`, data)
export const addToWishlistApi = (data) => publicAPI.post(`/user/wishlist`, data)

export const productsListHandleSearch = (search) => publicAPI.get(`/api/products/search?keyword=${search}`)
export const productsListfetchProducts = (params) => publicAPI.get(`/products?${params}`)
export const productsListfetchCategories = () => publicAPI.get(`/products/categories`)
export const productsListfetchBrands = () => publicAPI.get(`/products/brands`)

export const globalSearchApi = (searchTerm) => publicAPI.get(`/products/search?keyword=${searchTerm}`)