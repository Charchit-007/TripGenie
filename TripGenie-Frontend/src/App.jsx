import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login_Page from './UI_Pages/Login_Page.jsx';
import Landing_Page from './UI_Pages/Landing_Page.jsx';
import Chat_UI from './UI_Pages/Chat_UI.jsx';
import WatchlistPage from './UI_Pages/WatchList.jsx';
import Admin from './Admin/AdminPanel.jsx';
import AdminLogin from './Admin/AdminLogin.jsx';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
import ProtectedRoute from './ProtectedRoutes.jsx';
import Response from './UI_Pages/Response.jsx';

// --- New Flight Booking Imports ---
import FlightsPage from './FlightBooking/FlightsPage.jsx';
import BookingCheckoutPage from './FlightBooking/BookingCheckoutPage.jsx';
import BookingTicketPage from './FlightBooking/BookingTicketPage.jsx';
import BookingsPage from './FlightBooking/BookingsPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Landing_Page />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <Admin />
            </AdminProtectedRoute>
          } 
        />
  
        <Route path="/login" element={<Login_Page/>} />
        <Route path="/auth" element={<Login_Page />} />
        <Route path="/response" element={<Response />} />

        {/* --- Protected Routes --- */}
        <Route 
          path="/chat" 
          element={<ProtectedRoute><Chat_UI /></ProtectedRoute>} 
        />
        <Route 
          path="/watchlist" 
          element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} 
        />

        {/* --- Flight Booking Routes --- */}
        <Route 
          path="/flights" 
          element={<ProtectedRoute><FlightsPage /></ProtectedRoute>} 
        />
        <Route 
          path="/booking-checkout" 
          element={<ProtectedRoute><BookingCheckoutPage /></ProtectedRoute>} 
        />
        <Route 
          path="/ticket/:bookingId" 
          element={<ProtectedRoute><BookingTicketPage /></ProtectedRoute>} 
        />
        <Route 
          path="/bookings" 
          element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} 
        />

        {/* Catch-all: Redirect unknown paths to Home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;