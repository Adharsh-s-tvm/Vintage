import { api } from '../../lib/api';
import axios from 'axios';

const API_URL = `${api}`;

export const loginUser = async (email, password) => {
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



export const logoutUser = async () => {
    try {
        const response = await axios.post(
            `${API_URL}/logout`,
            {},
            { withCredentials: true }
        );
        localStorage.removeItem('userInfo');
        localStorage.removeItem('jwt');

        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};