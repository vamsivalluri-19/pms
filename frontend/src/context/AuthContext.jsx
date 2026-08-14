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
      const storedProfile = localStorage.getItem('profile');
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
          } else if (storedProfile) {
            // Manager and admin profiles are returned at login; retain the real identity on refresh.
            setProfile(JSON.parse(storedProfile));
          } else {
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
        localStorage.setItem('profile', JSON.stringify(data.profile || {}));
        
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
        isVerified: error.response?.data?.isVerified === false ? false : undefined,
        message: error.response?.data?.message || 'Invalid credentials',
        debugOtp: error.response?.data?.debugOtp
      };
    }
  };

  const register = async (email, password, role, profileData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, role, profileData });
      
      if (data.success) {
        if (data.isVerified === false) {
          setLoading(false);
          return { success: true, isVerified: false, email: data.email, message: data.message, debugOtp: data.debugOtp };
        }
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile || {}));
        
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

  const googleAuthLogin = async (credential) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { credential });
      if (data.success) {
        if (data.isNewUser) {
          setLoading(false);
          return { success: true, isNewUser: true, email: data.email, name: data.name };
        }
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile || {}));
        
        setUser(data.user);
        setProfile(data.profile);
        setLoading(false);
        return { success: true, isNewUser: false, role: data.user.role };
      }
      setLoading(false);
      return { success: false, message: 'Google authentication failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Google authentication failed'
      };
    }
  };

  const googleAuthRegister = async (credential, role, profileData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/register', { credential, role, profileData });
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile || {}));
        
        setUser(data.user);
        setProfile(data.profile);
        setLoading(false);
        return { success: true, role: data.user.role };
      }
      setLoading(false);
      return { success: false, message: 'Google registration failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Google registration failed'
      };
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile || {}));
        
        setUser(data.user);
        setProfile(data.profile);
        setLoading(false);
        return { success: true, role: data.user.role };
      }
      setLoading(false);
      return { success: false, message: data.message || 'Verification failed' };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed'
      };
    }
  };

  const resendOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      return { success: true, message: data.message, debugOtp: data.debugOtp };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification code'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
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
        localStorage.setItem('profile', JSON.stringify(res.data.student || res.data.company || {}));
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
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, updateProfile, setProfile, theme, toggleTheme, verifyOTP, resendOTP, googleAuthLogin, googleAuthRegister }}>
      {children}
    </AuthContext.Provider>
  );
};
