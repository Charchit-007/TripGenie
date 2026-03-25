// models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
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
  aiResponse:         { type: String },
  previousAIResponse: { type: String },
  isReplanned:        { type: Boolean, default: false },
  
  // NEW FIELD: Store the selected flight
  flightDetails:      { type: Object, default: null },
  hasBookedFlight: { type: Boolean, default: false },
  
}, { timestamps: true });

// Fast lookup: all trips for a user, newest first
tripSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);