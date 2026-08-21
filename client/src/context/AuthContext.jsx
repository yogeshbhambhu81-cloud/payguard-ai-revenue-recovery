import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('payguard_token') || null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Auto-login session expired:', err);
          await autoDemoLogin();
        }
      } else {
        await autoDemoLogin();
      }
      setLoading(false);
    };

    const autoDemoLogin = async () => {
      try {
        const res = await api.post('/auth/login', {
          email: 'demo@payguard.ai',
          password: 'demo123'
        });
        if (res.data.success) {
          localStorage.setItem('payguard_token', res.data.token);
          setToken(res.data.token);
          setUser(res.data.user);
        }
      } catch (err) {
        setUser({
          name: 'Demo Merchant',
          email: 'demo@payguard.ai',
          businessName: 'Apex Fashion & Tech India'
        });
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('payguard_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('payguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, demoMode, setDemoMode, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
