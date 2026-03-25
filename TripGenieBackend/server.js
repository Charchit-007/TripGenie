const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Your existing DB config
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/AuthRoutes'));
app.use('/api/trips', require('./routes/trips')); // Updated to use trips.js for watchlist functionality
app.use('/api/notifications', require('./routes/notifications'));
//Admin routes
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/admin'));

//bookings
app.use('/api/bookings', require('./routes/bookings'));

const { startScheduler } = require('./services/notificationScheduler');
startScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));