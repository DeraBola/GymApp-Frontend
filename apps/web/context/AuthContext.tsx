'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { getTokenPermissions, isSuperAdminRole } from '../lib/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  /** The gym (tenant) this user belongs to; Super Admins have none */
  gymId?: string | null;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User & { token: string }) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  /** Permission names carried in the JWT */
  permissions: string[];
  /** True for Super Admin, who the backend lets through every permission check across all gyms */
  isAdmin: boolean;
  /** Whether the current user may perform actions guarded by this permission */
  can: (permission: string) => boolean;
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
    // Each sign-in starts without a gym selected; Super Admins choose one.
    localStorage.removeItem('selectedGymId');
    
    const userObj = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      gymId: userData.gymId,
      isSuperAdmin: userData.isSuperAdmin
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
    localStorage.removeItem('selectedGymId');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const permissions = useMemo(() => getTokenPermissions(token), [token]);
  const isAdmin = !!user?.isSuperAdmin || isSuperAdminRole(user?.role);
  const can = useCallback(
    (permission: string) => isAdmin || permissions.includes(permission),
    [isAdmin, permissions]
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, permissions, isAdmin, can }}>
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
