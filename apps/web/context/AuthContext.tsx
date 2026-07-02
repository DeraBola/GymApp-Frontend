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
  login: (token: string) => void;
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
    // Check for token on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        // Decode JWT payload without a library
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        
        // C# JWT puts sub/email in specific claims
        const emailClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email;
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
        
        setUser({
          id: payload.sub || '',
          email: emailClaim || '',
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          role: roleClaim || 'SuperAdmin',
          gymId: payload.gymId || undefined
        });
      } catch (e) {
        console.error('Invalid token payload', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
        const payload = JSON.parse(atob(newToken.split('.')[1]));
        const emailClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email;
        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
        
        setUser({
          id: payload.sub || '',
          email: emailClaim || '',
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          role: roleClaim || 'SuperAdmin',
          gymId: payload.gymId || undefined
        });
    } catch (e) {
        console.error('Invalid token payload', e);
    }
    router.push('/dashboard');
  };

  const logout = async () => {
    if (token) {
      try {
        await api.post('/users/logout');
        toast.success('Logged out successfully! 👋');
      } catch (err) {
        console.error('Logout API failed', err);
      }
    }
    localStorage.removeItem('token');
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
