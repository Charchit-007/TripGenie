// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const { sendFlightTicketEmail } = require('../services/emailService');
const crypto = require('crypto');

// Utility to generate a realistic looking 6-character PNR
const generatePNR = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// POST: Create a new flight booking
router.post('/', async (req, res) => {
  try {
    const { userId, tripId, flightDetails, passengers, totalPaid, currency, userEmail } = req.body;

    if (!userId || !tripId || !flightDetails) {
      return res.status(400).json({ error: 'Missing required booking details.' });
    }

    const bookingReference = `TG-${generatePNR()}`;

    const newBooking = await Booking.create({
      userId,
      tripId,
      bookingReference,
      flightDetails,
      passengers,
      totalPaid,
      currency
    });

    // Mark the trip as having a booked flight so the frontend hides the "Book Flights" button
    await Trip.findByIdAndUpdate(tripId, { hasBookedFlight: true });

    // Fire off the ticket email asynchronously
    if (userEmail) {
      // Using the first part of the email as a fallback name if one isn't provided
      const userNameFallback = userEmail.split('@')[0]; 
      sendFlightTicketEmail(userEmail, userNameFallback, newBooking).catch(err => 
        console.error('Non-blocking error sending ticket email:', err)
      );
    }

    res.status(201).json({ message: 'Booking confirmed', booking: newBooking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to process booking' });
  }
});

// GET: Fetch all bookings for a user (for the BookingsPage)
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
                                  .populate('tripId', 'destination startDate endDate')
                                  .sort({ bookingDate: -1 });
    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET: Fetch a specific ticket (for the BookingTicketPage)
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('tripId');
    if (!booking) return res.status(404).json({ error: 'Ticket not found' });
    
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

module.exports = router;