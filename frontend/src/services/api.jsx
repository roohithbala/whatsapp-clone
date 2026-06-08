import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE || 'http://localhost:5000') + '/api',
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track if we're already handling an auth error to prevent loops
let isHandlingAuthError = false;

// Auto-handle token expiry: try refresh, then logout only on truly protected routes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth error handling for login/register/refresh-token endpoints
    const isAuthEndpoint = 
      originalRequest?.url?.includes('/users/login') ||
      originalRequest?.url?.includes('/users/register') ||
      originalRequest?.url?.includes('/users/forgot-password') ||
      originalRequest?.url?.includes('/users/reset-password') ||
      originalRequest?.url?.includes('/users/refresh-token');

    if (error.response?.status === 401 && !isAuthEndpoint && !isHandlingAuthError && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          isHandlingAuthError = true;
          const res = await axios.post(((import.meta.env.VITE_API_BASE || 'http://localhost:5000') + '/api/users/refresh-token'), { refreshToken });
          const newToken = res.data.token;
          localStorage.setItem('authToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isHandlingAuthError = false;
          return api(originalRequest); // retry with new token
        } catch (refreshError) {
          isHandlingAuthError = false;
          // Refresh also failed — clear storage and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token — user needs to re-login
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
