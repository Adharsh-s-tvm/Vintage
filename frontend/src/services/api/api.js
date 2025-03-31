import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api';

// Create an Axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
    'Content-Type': 'application/json',
  },
});

export default API;
