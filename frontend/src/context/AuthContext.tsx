import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPharmacist: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (details: { email: string; password: string; full_name: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pillcheck_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pillcheck_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('pillcheck_token');
      if (storedToken) {
        try {
          const freshUser = await api.getMe();
          setUser(freshUser);
          localStorage.setItem('pillcheck_user', JSON.stringify(freshUser));
        } catch (error) {
          console.error("Session verification failed", error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('pillcheck_token');
          localStorage.removeItem('pillcheck_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    setUser(res.user);
    setToken(res.access_token);
  };

  const register = async (details: { email: string; password: string; full_name: string; role?: string }) => {
    const res = await api.register(details);
    setUser(res.user);
    setToken(res.access_token);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const freshUser = await api.getMe();
    setUser(freshUser);
    localStorage.setItem('pillcheck_user', JSON.stringify(freshUser));
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isPharmacist = user?.role === 'pharmacist' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isPharmacist,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
