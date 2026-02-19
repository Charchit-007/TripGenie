// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET all notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.params.userId 
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET unread count (for bell badge)
router.get('/:userId/unread/count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.params.userId, 
      isRead: false 
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(
      req.params.notificationId, 
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark all as read
router.patch('/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;