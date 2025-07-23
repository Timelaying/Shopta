import axios from 'axios';
import { isTokenExpired } from '@/app/utils/jwt';
import { authService } from './authService';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken');
  if (token && isTokenExpired(token)) {
    const res = await authService.refresh();
    token = res.data.accessToken;
    localStorage.setItem('accessToken', token!);
  }
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;