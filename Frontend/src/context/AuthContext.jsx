import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('satya_token');
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (error) {
          console.error("Session check failed:", error);
          localStorage.removeItem('satya_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.token) {
      localStorage.setItem('satya_token', res.token);
    }
    setUser(res.data);
    return res;
  };

  const register = async (name, email, phone, password, role = 'patient') => {
    const res = await api.register({ name, email, phone, password, role });
    if (res.token) {
      localStorage.setItem('satya_token', res.token);
    }
    setUser(res.data);
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    localStorage.removeItem('satya_token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.updateProfile(profileData);
    setUser(res.data);
    return res;
  };

  const changePassword = async (passwordData) => {
    return await api.changePassword(passwordData);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('satya_token');
    if (token) {
      try {
        const res = await api.getMe();
        setUser(res.data);
        return res.data;
      } catch (error) {
        console.error("Session refresh failed:", error);
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
