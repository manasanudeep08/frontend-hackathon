import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/apiBase.js';

const AuthContext = createContext({
  user: null,
  csrfToken: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setCsrfToken(data.csrfToken || null);
          return data.user;
        }
      }
      setUser(null);
      setCsrfToken(null);
      return null;
    } catch {
      setUser(null);
      setCsrfToken(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username, password) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
    } catch {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend server is running on port 5050.'
      );
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          'Backend server is unavailable. Please ensure the backend server is running on port 5050.'
        );
      }
      const errorMsg = data?.error?.message || data?.message || 'Login failed. Please check credentials.';
      throw new Error(errorMsg);
    }

    if (data.success && data.user) {
      setUser(data.user);
      setCsrfToken(data.csrfToken || null);
      return data;
    }

    throw new Error('Unexpected response during login.');
  };

  const register = async (username, password, fullName) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ username, password, fullName })
      });
    } catch {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend server is running on port 5050.'
      );
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('This username is already taken. Please choose another username.');
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          'Backend server is unavailable. Please ensure the backend server is running on port 5050.'
        );
      }
      const errorMsg = data?.error?.message || data?.message || 'Registration failed.';
      throw new Error(errorMsg);
    }

    if (data.success && data.user) {
      setUser(data.user);
      setCsrfToken(data.csrfToken || null);
      return data;
    }

    throw new Error('Unexpected response during registration.');
  };

  const logout = async () => {
    try {
      const headers = { Accept: 'application/json' };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers
      });
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        csrfToken,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
