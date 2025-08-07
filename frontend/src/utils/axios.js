import axios from 'axios';


export const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // or your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);