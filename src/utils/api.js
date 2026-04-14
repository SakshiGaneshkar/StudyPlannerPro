import axios from 'axios';

const API = axios.create({
  baseURL: 'https://study-planer-backend.vercel.app/api',
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ssp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ssp_token');
      localStorage.removeItem('ssp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;