// Load environment variables from .env file
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000; 
const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB();

// --- Simple Route for Testing ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// --- Define Routes ---
const authRoutes = require('./routes/AuthRoutes');
app.use('/api/auth', authRoutes);

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // BUG FIXED HERE
});
