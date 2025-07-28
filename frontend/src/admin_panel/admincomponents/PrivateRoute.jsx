import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');  // Check for JWT token in localStorage

  if (!token) {
    return <Navigate to="/adminlogin" />;  // Redirect to login page if no token found
  }

  return children;  // Return the children (admin pages) if authenticated
};

export default PrivateRoute;
