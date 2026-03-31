// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, required: true },
    message:  { type: String, required: true, trim: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null if guest
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('Feedback', feedbackSchema);