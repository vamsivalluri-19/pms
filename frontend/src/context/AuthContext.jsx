import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initialize session state from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Re-fetch profile to ensure it is up-to-date
          let res;
          if (parsedUser.role === 'STUDENT') {
            res = await api.get(`/students/me`);
            setProfile(res.data.student || null);
          } else if (parsedUser.role === 'COMPANY') {
            res = await api.get(`/companies/me`);
            setProfile(res.data.company || null);
          } else {
            // Placement Manager / Admin profile
            setProfile({ name: parsedUser.role === 'ADMIN' ? 'Administrator' : 'Placement Coordinator' });
          }
        } catch (err) {
          console.error('Error recovering session:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setProfile(data.profile);
        setLoading(false);
        return { success: true, role: data.user.role };
      }
      setLoading(false);
      return { success: false, message: 'Login failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const register = async (email, password, role, profileData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, role, profileData });
      
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
        setProfile(data.profile);
        setLoading(false);
        return { success: true, role: data.user.role };
      }
      setLoading(false);
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  const updateProfile = async (updates) => {
    try {
      if (!profile?._id) return { success: false, message: 'No active profile found' };
      
      let res;
      if (user.role === 'STUDENT') {
        res = await api.put(`/students/${profile._id}`, updates);
      } else if (user.role === 'COMPANY') {
        res = await api.put(`/companies/${profile._id}`, updates);
      }
      
      if (res?.data?.success) {
        setProfile(res.data.student || res.data.company);
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating profile'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updateProfile, setProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};
