const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Add item to watchlist
router.post('/add', async (req, res) => {
  try {
    const { userId, destination, startDate, endDate, guests, budget, tripType, aiResponse } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'Destination and dates are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const watchlistItem = {
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      guests: guests || 1,
      budget: budget || 'mid-range',
      tripType: tripType || 'leisure',
      aiResponse: aiResponse || '',
      addedAt: new Date(),
    };

    user.watchlist.push(watchlistItem);
    await user.save();

    res.status(200).json({ 
      message: 'Added to watchlist successfully', 
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Get user's watchlist
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ watchlist: user.watchlist });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Remove item from watchlist
router.delete('/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.watchlist = user.watchlist.filter(item => item._id.toString() !== itemId);
    await user.save();

    res.status(200).json({ 
      message: 'Removed from watchlist successfully', 
      watchlist: user.watchlist 
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

module.exports = router;