import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login_Page from './UI_Pages/Login_Page.jsx';
import Landing_Page from './UI_Pages/Landing_Page.jsx';
import Chat_UI from './UI_Pages/Chat_UI.jsx';
import WatchlistPage from './UI_Pages/WatchList.jsx';
import ProtectedRoute from './ProtectedRoutes.jsx';
import Response from './UI_Pages/Response.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        {/* 1. Redirect root to /home so users land there first */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* 2. Home must be public so users can see the "Sign In" button */}
        <Route path="/home" element={<Landing_Page />} />
        
        <Route path="/login" element={<Login_Page/>} />
        <Route path="/auth" element={<Login_Page />} />

        {/* --- Protected Routes --- */}
        {/* Only pages that require a user to be logged in go here */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat_UI />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/watchlist" 
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: Redirect unknown paths to Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

