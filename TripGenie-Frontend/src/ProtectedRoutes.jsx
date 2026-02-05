// ProtectedRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {

  const isAuthenticated = localStorage.getItem('token'); 

  if (!isAuthenticated) {
    // 2. If not logged in, redirect to Login
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in, render the protected component (Chat, Watchlist, etc.)
  return children;
};

export default ProtectedRoute;