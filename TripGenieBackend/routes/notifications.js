// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

const { checkAndNotifyAllTrips } = require('../services/notificationScheduler');


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
// DELETE a single notification
router.delete('/:notificationId', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// TEMP — remove in production
router.post('/test/trigger', async (req, res) => {
  try {
    await checkAndNotifyAllTrips();
    res.json({ success: true, message: 'Scheduler triggered manually' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//for flight bookings
// Test trigger for Flight Monitoring Agent
router.post('/test/flight-alert', async (req, res) => {
  try {
    const { userId, tripId, destination, type } = req.body; 
    // type could be 'PRICE_DROP' or 'DISRUPTION'

    const messages = {
      PRICE_DROP: `📉 Great news! The price for your flight to ${destination} just dropped by $50. Check the booking page for upgrade options!`,
      DISRUPTION: `⚠️ Schedule Change: Your flight to ${destination} has a 2-hour delay. TripGenie is currently checking if your airport transfer needs to be rescheduled.`
    };

    const notification = await Notification.create({
      userId,
      tripId,
      destination,
      message: messages[type] || messages.PRICE_DROP,
      severity: 'warning',
      type: 'flight', // Your enum should support this
      isRead: false
    });

    // Optionally send the email immediately for testing
    // await sendFlightAlertEmail(userEmail, notification);

    res.status(200).json({ message: 'Flight notification triggered', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;