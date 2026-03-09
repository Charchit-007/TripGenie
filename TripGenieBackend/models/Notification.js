const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // ← was String
    ref: 'User',
    required: true,
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,  // ← was String
    ref: 'Trip',
    required: true,
  },
  destination: { type: String },
  replannedItinerary: { type: String },    // ← fixed typo "Iternary"
  message:   { type: String, required: true },
  emailSent: { type: Boolean, default: false },
  severity:  { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
  type:      { type: String, enum: ['weather', 'advisory', 'replan', 'festival'] },
  isRead:    { type: Boolean, default: false },
}, { timestamps: true });                  // ← replaces manual createdAt

// Add indexes for fast queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ tripId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);