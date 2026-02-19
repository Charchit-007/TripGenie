const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId:     { type: String, required: true },
  tripId:     { type: String, required: true },
  destination:{ type: String },
  replannedIternary: { type: String },
  message:    { type: String, required: true },
  emailSent: { type: Boolean, default: false }, 
  severity:   { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
  type:       { type: String, enum: ['weather', 'advisory', 'replan', 'festival'] },
  isRead:     { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);