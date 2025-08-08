import axios from 'axios';
import apiClient from './apiClient';
import { setAccessToken } from './tokenService';

interface LoginData { email: string; password: string; }
interface RegisterData { username: string; email: string; password: string; }

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const authService = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login: async (data: LoginData) => {
    const res = await apiClient.post('/auth/login', data);
    setAccessToken(res.data.accessToken);
    return res;
  },
  refresh: async () => {
    const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
    setAccessToken(res.data.accessToken);
    return res;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
    setAccessToken(null);
  },
};