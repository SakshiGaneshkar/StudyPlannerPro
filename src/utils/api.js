import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://study-planer-backend-fb3a.vercel.app/api',
  timeout: 20000,
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