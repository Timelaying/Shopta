'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/app/services/authService';
import { parseJwt } from '@/app/utils/jwt';

interface AuthContextType {
  user: any;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = parseJwt(token);
      setUser(payload);
    }
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    const accessToken = res.data.accessToken;
    localStorage.setItem('accessToken', accessToken);
    const payload = parseJwt(accessToken);
    setUser(payload);
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};