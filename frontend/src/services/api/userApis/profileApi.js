import { API } from "../api";

export const fetchWalletDetailsApi = (page = 1) =>
  API.get('/user/profile/wallet', {
    params: { page }
  });
export const changePasswordApi = (data) => API.put('/user/profile/change-password', data)
export const checkEmailApi = (data) => API.post('/check-email', data)

export const fetchUserDetailsApi = () => API.get('/user/profile/details')
export const updateUserDetailsApi = (data) => API.put('/user/profile/details', data)
export const uploadProfileImageApi = (data) => API.post('/user/profile/upload-image', data)

export const fetchAddressesApi = () => API.get('/user/profile/address')
export const addAddressApi = (data) => API.post('/user/profile/address', data)
export const updateAddressApi = (id, data) => API.put(`/user/profile/address/${id}`, data)
export const deleteAddressApi = (id) => API.delete(`/user/profile/address/${id}`)
export const setDefaultAddressApi = (id) => API.put(`/user/profile/address/${id}`, { isDefault: true })
