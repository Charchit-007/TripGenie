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

router.patch('/:tripId/flight', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { flightDetails, newAiResponse } = req.body;

    if (!flightDetails || !newAiResponse) {
      return res.status(400).json({ error: 'Flight details and the synced itinerary are required' });
    }

    // Find the trip first so we can move the current aiResponse to previousAIResponse
    const existingTrip = await Trip.findById(tripId);
    
    if (!existingTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Update the trip
    existingTrip.previousAIResponse = existingTrip.aiResponse; // Backup the old plan
    existingTrip.aiResponse = newAiResponse;                   // Save the new synced plan
    existingTrip.flightDetails = flightDetails;                // Save the flight
    existingTrip.isReplanned = true;                           // Mark it as modified

    await existingTrip.save();

    res.status(200).json({ 
      message: 'Flight added and itinerary synced successfully', 
      trip: existingTrip 
    });

  } catch (error) {
    console.error('Error updating trip with flight:', error);
    res.status(500).json({ error: 'Failed to update trip with flight data' });
  }
});

module.exports = router;