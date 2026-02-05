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
app.use('/api/watchlist', require('./routes/watchlist')); // ✅ ADD THIS LINE

// Your existing /query route for AI trip planning
// app.post('/query', async (req, res) => { ... });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));