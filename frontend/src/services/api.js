import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const normalizedApiUrl = (rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/'))
  ? (rawApiUrl.replace(/\/$/, '') + '/api')
  : rawApiUrl;

const api = axios.create({
  baseURL: normalizedApiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const backendBase = normalizedApiUrl.replace('/api', '');
  return `${backendBase}${path}`;
};

// Intercept requests to inject bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle token refresh automatically on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${normalizedApiUrl}/auth/refresh`, { refreshToken });
          if (data.success) {
            localStorage.setItem('accessToken', data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh token is expired, wipe credentials and force logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
