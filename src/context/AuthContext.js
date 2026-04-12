import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const token = localStorage.getItem('ssp_token');
    const savedUser = localStorage.getItem('ssp_user');
    const savedTheme = localStorage.getItem('ssp_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        verifyToken();
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('ssp_user', JSON.stringify(data.user));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('ssp_token', data.token);
    localStorage.setItem('ssp_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('ssp_token', data.token);
    localStorage.setItem('ssp_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Account created! Welcome, ${data.user.name}! 🎉`);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ssp_token');
    localStorage.removeItem('ssp_user');
    setUser(null);
    setLoading(false);
  }, []);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ssp_user', JSON.stringify(updatedUser));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('ssp_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
