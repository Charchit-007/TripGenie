const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Trip = require('../models/Trip');
const adminAuth = require('../middleware/adminAuth');

// All routes below are protected

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get trip count per user
    const usersWithTripCount = await Promise.all(
      users.map(async (user) => {
        const tripCount = await Trip.countDocuments({ userId: user._id });
        return { ...user.toObject(), totalTrips: tripCount };
      })
    );

    res.status(200).json({ users: usersWithTripCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user and their trips
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await Trip.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User and their trips deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all trips
router.get('/trips', adminAuth, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ trips });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Delete a trip
router.delete('/trips/:tripId', adminAuth, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.tripId);
    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTrips = await Trip.countDocuments();
    const replanCount = await Trip.countDocuments({ isReplanned: true });

    // Trips grouped by tripType
    const tripsByType = await Trip.aggregate([
      { $group: { _id: '$tripType', count: { $sum: 1 } } }
    ]);

    // Trips per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const tripsByMonth = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({ totalUsers, totalTrips, replanCount, tripsByType, tripsByMonth });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;