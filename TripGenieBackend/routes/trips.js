const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// Add a new trip
router.post('/', async (req, res) => {
  try {
    const { userId, destination, startDate, endDate, guests, budget, tripType, aiResponse } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'Destination and dates are required' });
    }

    const trip = await Trip.create({
      userId,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      guests: guests || 1,
      budget: budget || 'mid-range',
      tripType: tripType || 'leisure',
      aiResponse: aiResponse || '',
    });

    res.status(201).json({ message: 'Trip saved successfully', trip });
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: 'Failed to save trip' });
  }
});

// Get all trips for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Delete a trip
router.delete('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByIdAndDelete(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.status(200).json({ message: 'Trip removed successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

module.exports = router;