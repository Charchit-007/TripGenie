const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');

// All routes below are protected

// Get all users (non-admin users)
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Find users who don't have 'admin' in their roles
    const users = await User.find({ role: { $ne: 'admin' } })
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

// Get all admins
router.get('/admins', adminAuth, async (req, res) => {
  try {
    // Find users who have 'admin' in their roles (handles both string and array role types)
    const admins = await User.find({ role: { $in: ['admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get trip count per admin
    const adminsWithTripCount = await Promise.all(
      admins.map(async (admin) => {
        const tripCount = await Trip.countDocuments({ userId: admin._id });
        return { ...admin.toObject(), totalTrips: tripCount };
      })
    );

    res.status(200).json({ admins: adminsWithTripCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Delete a user and their trips (bookings marked as cancelled)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    // Mark all bookings as cancelled instead of deleting
    await Booking.updateMany({ userId }, { status: 'CANCELLED' });
    // Delete trips
    await Trip.deleteMany({ userId });
    // Delete user
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User and their trips deleted successfully. Bookings marked as cancelled.' });
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
    // Count non-admin users
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
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

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email')
      .populate('tripId', 'destination startDate endDate')
      .sort({ bookingDate: -1 });
    
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status
router.patch('/bookings/:bookingId', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['CONFIRMED', 'CANCELLED', 'FLIGHT_CHANGED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status },
      { new: true }
    ).populate('userId', 'name email').populate('tripId', 'destination');
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Update user roles
router.patch('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { roles } = req.body;
    
    // Validate roles
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Roles must be a non-empty array' });
    }
    
    const validRoles = ['user', 'admin'];
    const invalidRoles = roles.filter(r => !validRoles.includes(r));
    
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: roles },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json({ message: 'User roles updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user roles' });
  }
});

module.exports = router;