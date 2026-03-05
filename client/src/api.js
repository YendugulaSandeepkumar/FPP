import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fpp-backend-1.onrender.com//api', // Update if backend port changes
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
