// src/user-panel/pages/Signup_page.jsx - UPDATED WITH WINDOW LOADER

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WindowLoader from '../components/WindowLoader';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [windowLoader, setWindowLoader] = useState({
    isVisible: false,
    message: 'Creating your account...',
    success: false,
    successMessage: 'Account created successfully!'
  });
  
  const { register, loading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when form data changes (not on every render)
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password, formData.name]); // Only depend on key form fields

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Show window loader
    setWindowLoader({
      isVisible: true,
      message: 'Creating your account...',
      success: false,
      successMessage: 'Account created successfully!'
    });

    // Remove confirmPassword from submission data
    const { confirmPassword, ...submitData } = formData;
    
    const result = await register(submitData);
    
    if (result.success) {
      // Show success state
      setWindowLoader(prev => ({
        ...prev,
        success: true,
        message: 'Account created successfully! Redirecting to login...'
      }));

      // Wait a bit to show success, then navigate
      setTimeout(() => {
        setWindowLoader(prev => ({ ...prev, isVisible: false }));
        navigate('/login');
      }, 2000);
    } else {
      // Hide loader on error
      setWindowLoader(prev => ({ ...prev, isVisible: false }));
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join us and start shopping today
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Global Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Registration failed</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Full Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Enter your full name"
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Enter your email"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                      validationErrors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600">Password strength:</div>
                    <div className="flex space-x-1">
                      <div className={`h-1 w-full rounded ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 w-full rounded ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 w-full rounded ${/(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full pl-10 pr-12 py-3 border ${
                      validationErrors.confirmPassword 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Role Selection (Hidden for regular users) */}
              <input type="hidden" name="role" value={formData.role} />

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-500 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || windowLoader.isVisible}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading || windowLoader.isVisible ? 'Creating account...' : 'Create account'}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Sign in instead
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-purple-600 hover:text-purple-500">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-purple-600 hover:text-purple-500">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>

      {/* Window Loader */}
      <WindowLoader 
        isVisible={windowLoader.isVisible}
        message={windowLoader.message}
        success={windowLoader.success}
        successMessage={windowLoader.successMessage}
      />
    </>
  );
};

export default SignupPage;