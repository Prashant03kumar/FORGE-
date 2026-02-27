// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Note the /api/v1 prefix
  withCredentials: true, // This is mandatory for your JWT cookies
});

// Add Authorization header with JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors and token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 (unauthorized), token might be expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
