import { privateAPI } from "../api";

export const fetchWalletDetailsApi = (page = 1) => 
  privateAPI.get('/user/profile/wallet', { 
    params: { page }
  });
export const changePasswordApi = (data) => privateAPI.put('/user/profile/change-password', data)
export const checkEmailApi = (data) => privateAPI.post('/check-email', data)

export const fetchUserDetailsApi = () => privateAPI.get('/user/profile/details')
export const updateUserDetailsApi = (data) => privateAPI.put('/user/profile/details', data)
export const uploadProfileImageApi = (data) => privateAPI.post('/user/profile/upload-image', data)

export const fetchAddressesApi = () => privateAPI.get('/user/profile/address')
export const addAddressApi = (data) => privateAPI.post('/user/profile/address', data)
export const updateAddressApi = (id, data) => privateAPI.put(`/user/profile/address/${id}`, data)
export const deleteAddressApi = (id) => privateAPI.delete(`/user/profile/address/${id}`)
export const setDefaultAddressApi = (id) => privateAPI.put(`/user/profile/address/${id}`, { isDefault: true })
