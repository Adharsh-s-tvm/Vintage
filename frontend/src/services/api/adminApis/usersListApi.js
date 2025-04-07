import { API } from '../api';

export const fetchUsersApi = (params) => API.get(`/admin/users?${params}`);
export const deleteUserApi = (userId) => API.delete(`/admin/users/${userId}`);
export const updateUserStatusApi = (userId, data) => API.put(`/admin/users/${userId}/status`, data);
