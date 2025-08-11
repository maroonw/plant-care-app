import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ehp_token'); // easyhouseplant token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
