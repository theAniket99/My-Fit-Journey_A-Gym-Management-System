// src/services/api.ts
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080', // your backend server URL
});

// Add a request interceptor to attach JWT token to every request if available
api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('jwtToken'); // Or use another storage/context solution
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
