
// src/user-panel/context/AuthContext.jsx - FIXED VERSION

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../api/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        user: action.payload.user, 
        isAuthenticated: true,
        error: null,
        loading: false
      };
    
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to clear tokens - no longer needed with cookies
  const clearTokens = useCallback(() => {
    // Cookies are cleared server-side
  }, []);

  // Initialize auth state by checking if user is authenticated
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Check if user is authenticated by trying to get user profile
        // Cookies will be sent automatically with credentials: 'include'
        const userData = await apiService.getUserProfile();

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: userData }
        });
      } catch (error) {
        console.error('Auth initialization failed:', error);

        // For 401 errors (unauthorized), just set as not authenticated
        // Don't show error message or redirect - user can access public pages
        if (error.status === 401) {
          dispatch({ type: 'LOGOUT' });
        } else {
          // For other errors, show error message
          dispatch({ type: 'SET_ERROR', payload: 'Authentication failed. Please login again.' });
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    initializeAuth();
  }, []);

  // Actions - wrapped with useCallback to prevent infinite loops
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiService.login(email, password, rememberMe);

      // Cookie is set server-side, no need to store locally
      // Get user profile to confirm authentication
      const userData = await apiService.getUserProfile();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData }
      });

      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await apiService.register(userData);
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' });
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isAuthenticated = useCallback(() => {
    return state.isAuthenticated;
  }, [state.isAuthenticated]);

  // Function to check if token exists and is potentially valid
  const hasToken = useCallback(() => {
    return !!localStorage.getItem('token');
  }, []);

  const value = {
    user: state.user,
    isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasToken
  };

  return (
    <AuthContext.Provider value={value}>
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