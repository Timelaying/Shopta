'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/app/services/authService';
import { getAccessToken } from '@/app/services/tokenService';
import { parseJwt, JwtPayload } from '@/app/utils/jwt';

export interface User extends JwtPayload {
  id: number;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await authService.refresh();
        const token = getAccessToken();
        if (token) {
          const payload = parseJwt(token) as User | null;
          setUser(payload);
        }
      } catch {
        setUser(null);
      }
    };
    init();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    await authService.login(data);
    const token = getAccessToken();
    if (token) {
      const payload = parseJwt(token) as User | null;
      setUser(payload);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
