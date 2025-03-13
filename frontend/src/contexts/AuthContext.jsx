import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await auth.checkAuth();
        if (response.data && response.data.authenticated) {
          setCurrentUser(response.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      setAuthError(null);
      const response = await auth.register(userData);
      
      // Make sure we have a valid response
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      setCurrentUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different types of errors more specifically
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = err.response.data?.message || 'Registration failed. Please try again.';
        
        if (err.response.status === 409) {
          if (errorMessage.includes('username')) {
            throw new Error('Username already exists. Please choose another one.');
          }
          if (errorMessage.includes('email')) {
            throw new Error('Email already registered. Please use another email or try to recover your password.');
          }
        }
        
        throw new Error(errorMessage);
      } else if (err.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(err.message || 'An unexpected error occurred. Please try again later.');
      }
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      setAuthError(null);
      const response = await auth.login({ username, password });
      
      // Make sure we have a valid response
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      setCurrentUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response) {
        // The server responded with an error status
        if (err.response.status === 401) {
          throw new Error('Invalid username or password. Please try again.');
        }
        throw new Error(err.response.data?.message || 'Login failed. Please try again.');
      } else if (err.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request
        throw new Error(err.message || 'An unexpected error occurred. Please try again later.');
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await auth.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails on the server, we clear the user on the client
      setCurrentUser(null);
      throw new Error('Failed to logout properly. Your session may still be active on the server.');
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}