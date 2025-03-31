import { privateAPI } from '../api';

export const fetchUsersApi = (params) => privateAPI.get(`/admin/users?${params}`);
export const deleteUserApi = (userId) => privateAPI.delete(`/admin/users/${userId}`);
export const updateUserStatusApi = (userId, data) => privateAPI.put(`/admin/users/${userId}/status`, data);
