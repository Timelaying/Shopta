import axios from 'axios';
import { isTokenExpired } from '@/app/utils/jwt';
import { getAccessToken, setAccessToken } from './tokenService';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config) => {
  let token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    try {
      const res = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
      token = res.data.accessToken;
      setAccessToken(token);
    } catch {
      token = null;
      setAccessToken(null);
    }
  }
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
