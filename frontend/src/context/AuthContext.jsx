import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Check authentication status using protected GET /api/auth/me
  const checkAuth = useCallback(async () => {
    try {
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async ({ email, password, rememberMe }) => {
    const data = await authService.login({ email, password, rememberMe });
    if (data?.success) {
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('auth_token', data.token);
        } else {
          sessionStorage.setItem('auth_token', data.token);
          localStorage.removeItem('auth_token');
        }
        setToken(data.token);
      }
      setUser(data.user);
      return data;
    }
    throw new Error(data?.message || 'Login failed');
  };

  // Register handler
  const register = async ({ name, email, password }) => {
    const data = await authService.register({ name, email, password });
    return data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

