import { api } from '../../lib/api';
import axios from 'axios';

const API_URL = `${api}/admin`;

export const loginAdmin = async (email, password) => {
    try {
        const response = await axios.post(
            `${API_URL}/login`,
            { email, password },
            { withCredentials: true }
        );
        if (response.data && !response.data.token) {
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
            if (tokenCookie) {
                const token = tokenCookie.split('=')[1];
                response.data.token = token;
            }
        }

        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logoutAdmin = async () => {
    try {
        const response = await axios.post(
            `${API_URL}/logout`,
            {},
            { withCredentials: true }
        );
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('jwt');

        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const getDashboard = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/dashboard`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Dashboard fetch error:', error);
        throw error;
    }
};


