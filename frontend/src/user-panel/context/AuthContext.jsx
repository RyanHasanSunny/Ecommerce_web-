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
        loading: false
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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const userData = await apiService.getUserProfile();
          
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: userData } 
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Actions - wrapped with useCallback to prevent infinite loops
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await apiService.login(email, password);
      
      // Store token
      localStorage.setItem('token', response.token);
      
      // Get user profile
      const userData = await apiService.getUserProfile();
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: userData } 
      });
      
      return { success: true, data: response };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
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
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
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

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated
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