// routes/feedbackRoutes.js
const express  = require('express');
const router   = express.Router();
const Feedback = require('../models/Feedback');

// GET /api/feedback
// Retrieve all feedback
router.get('/', async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    return res.status(200).json(feedbackList);
  } catch (err) {
    console.error('Failed to fetch feedback:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// POST /api/feedback
// Accepts: { name, email, category, message, userId (optional) }
router.post('/', async (req, res) => {
  try {
    const { name, email, category, message, userId } = req.body;

    // Basic server-side validation
    if (!name || !email || !category || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const feedback = new Feedback({
      name,
      email,
      category,
      message,
      userId: userId || null,
    });

    await feedback.save();

    return res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

module.exports = router;