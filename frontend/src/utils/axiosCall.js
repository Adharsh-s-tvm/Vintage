import axios from "axios";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api", // Use env variable
  withCredentials: true, // Ensures cookies are sent in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error attaching token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Unauthorized (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token"); // Remove expired token
        window.location.href = "/admin/login"; // Redirect admin to login page
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
