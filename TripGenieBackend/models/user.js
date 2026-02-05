//This file defines what a “User” looks like in your database and defines the User table (collection) and its rules. 

const mongoose = require('mongoose');

const WatchlistItemSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  budget: {
    type: String,
    enum: ['affordable', 'mid-range', 'luxury'],
    required: true,
  },
  tripType: {
    type: String,
    enum: ['leisure', 'adventure', 'cultural', 'family', 'romantic', 'business'],
    required: true,
  },
  aiResponse: {
    type: String, // Store the AI-generated travel plan
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  watchlist: [WatchlistItemSchema],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


// Creates a MongoDB collection called users
module.exports = mongoose.model('User', UserSchema);
