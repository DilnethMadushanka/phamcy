import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pharmacy_token');
      if (token) {
        try {
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 10000)
          );
          const res = await Promise.race([api.getMe(), timeout]);
          setUser(res.user);
        } catch (err) {
          console.error('Token validation failed:', err);
          localStorage.removeItem('pharmacy_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('pharmacy_token', data.token);
    setUser(data.user);
    setShowAuthModal(false);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('pharmacy_token', data.token);
    setUser(data.user);
    setShowAuthModal(false);
    return data;
  };

  const googleAuth = async (googleData) => {
    const data = await api.googleAuth(googleData);
    localStorage.setItem('pharmacy_token', data.token);
    setUser(data.user);
    setShowAuthModal(false);
    return data;
  };

  // Logout goes to /store, not /login
  const logout = () => {
    localStorage.removeItem('pharmacy_token');
    setUser(null);
    window.location.href = '/store';
  };

  // Call this whenever a protected action is attempted by a guest
  const requireAuth = (mode = 'login') => {
    if (!user) {
      setAuthModalMode(mode);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const isAdmin = user?.role === 'Admin';
  const isPharmacist = user?.role === 'Pharmacist' || isAdmin;
  const isCashier = user?.role === 'Cashier' || isPharmacist;
  const isCustomer = user?.role === 'Customer';

  const forgotPassword = async (email, newPassword) => {
    return await api.forgotPassword(email, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await api.changePassword(currentPassword, newPassword);
  };

  const sendOtp = async (email, type) => {
    return await api.sendOtp(email, type);
  };

  const verifyOtpRegister = async (data) => {
    const res = await api.verifyOtpRegister(data);
    localStorage.setItem('pharmacy_token', res.token);
    setUser(res.user);
    setShowAuthModal(false);
    return res;
  };

  const verifyOtpResetPassword = async (data) => {
    return await api.verifyOtpResetPassword(data);
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.token) {
      localStorage.setItem('pharmacy_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleAuth,
        forgotPassword,
        changePassword,
        sendOtp,
        verifyOtpRegister,
        verifyOtpResetPassword,
        updateProfile,
        logout,
        requireAuth,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        isAdmin,
        isPharmacist,
        isCashier,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
