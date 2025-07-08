import apiClient from './apiClient';

interface LoginData { email: string; password: string; }
interface RegisterData { username: string; email: string; password: string; }

export const authService = {
  register: (data: RegisterData) => apiClient.post('/auth/register', data),
  login:    (data: LoginData)    => apiClient.post('/auth/login', data),
  refresh:  ()                   => apiClient.post('/auth/refresh'),
  logout:   ()                   => apiClient.post('/auth/logout'),
};