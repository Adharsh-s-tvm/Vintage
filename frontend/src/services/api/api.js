import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api';

// Public API (No Authorization Header)
export const publicAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Private API (Requires Authorization)
export const privateAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Function to set Authorization token dynamically
export const setAuthToken = (token) => {
  if (token) {
    privateAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete privateAPI.defaults.headers.common['Authorization'];
  }
};

// Load token from localStorage on startup
const token = localStorage.getItem('jwt');
if (token) {
  setAuthToken(token);
}
