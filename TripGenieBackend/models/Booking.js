// models/Booking.js
const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passportNumber: { type: String }, // Optional for mock purposes
});

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  bookingReference: {
    type: String, // e.g., "TG-8X9P2L"
    required: true,
    unique: true,
  },
  flightDetails: {
    type: Object, // Stores the exact outbound/inbound object from your FlightSearchTool
    required: true,
  },
  passengers: [passengerSchema],
  totalPaid: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED', 'FLIGHT_CHANGED'],
    default: 'CONFIRMED',
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

bookingSchema.index({ userId: 1, bookingDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema);