'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  gymId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User & { token: string }) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token and user on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Invalid user data in local storage', e);
      }
    } else if (storedToken) {
      // Token exists but no user data, keep token but user will be null
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User & { token: string }) => {
    localStorage.setItem('token', userData.token);
    
    const userObj = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      gymId: userData.gymId
    };
    
    localStorage.setItem('user', JSON.stringify(userObj));
    setToken(userData.token);
    setUser(userObj);
    
    router.push('/dashboard');
  };

  const logout = async () => {
    if (token) {
      try {
        await api.post('/users/logout');
      } catch (err) {
        console.error('Logout API failed', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
