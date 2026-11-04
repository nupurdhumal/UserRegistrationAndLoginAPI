import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor: Attach Bearer token if stored in memory/storage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Normalize error messages across both JSON and proxy errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    const status = error.response?.status || (error.code === 'ECONNABORTED' ? 408 : 500);

    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        // Handle non-JSON string errors (e.g. Vite proxy error or raw HTML)
        message = error.response.data.includes('<html')
          ? `Server error (${status}). Please check backend service logs.`
          : error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    } else if (error.request) {
      message = 'Unable to connect to authentication server. Please ensure backend is running on port 5000.';
    } else if (error.message) {
      message = error.message;
    }

    const customError = {
      status,
      message
    };

    return Promise.reject(customError);
  }
);

export default api;
