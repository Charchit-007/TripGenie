import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if a token exists in localStorage
  const token = localStorage.getItem('token');

  // If no token, redirect to the login page ("/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, show the requested page (children)
  return children;
};

export default ProtectedRoute;