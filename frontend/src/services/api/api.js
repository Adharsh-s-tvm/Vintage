import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api';

// Public API (No Authorization Header)
export const API = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);


API.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('jwt');
          // You might want to redirect to login page here
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
    }
    return Promise.reject(error);
  }
);

// Private API (Requires Authorization)
// export const API = axios.create({
//   baseURL: API_BASE_URL,
// });

// Function to set Authorization token dynamically
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Load token from localStorage on startup
const token = localStorage.getItem('jwt');
if (token) {
  setAuthToken(token);
}
