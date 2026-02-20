// services/notificationScheduler.js
const cron = require('node-cron');
const User = require('../models/user');
const Notification = require('../models/Notification');
const { getWeatherForecast, assessWeatherSeverity } = require('./weatherService');
const { sendWeatherAlert } = require('./emailService');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// ✅ Rules Engine
function applySeverityRules(alert, tripStartDate) {
  const today = new Date();
  const daysUntilTrip = (new Date(tripStartDate) - today) / (1000 * 60 * 60 * 24);

  if (alert.severity === 'critical') return true;
  if (alert.severity === 'warning' && daysUntilTrip <= 7) return true;
  if (alert.severity === 'info') return false;
  return false;
}

// ✅ LLM Alert Message Generator
async function generateAlertMessage(destination, weatherData) {
  try {
    const prompt = `You are TripGenie. Write a short, friendly travel alert (max 3 sentences) for a user who has a trip planned to ${destination}. 
    Weather alert: ${JSON.stringify(weatherData)}. 
    Include: what the issue is, how it might affect their trip, and one practical tip. Be warm and helpful, not alarming.`;

    const res = await axios.post(`${FASTAPI_URL}/query`, { question: prompt });
    return res.data.answer;
  } catch (err) {
    return `⚠️ Weather alert for ${destination}: ${weatherData.condition} expected. Wind speeds of ${weatherData.windSpeed}m/s. Consider checking your bookings.`;
  }
}

// ✅ Call FastAPI /replan for critical alerts
async function callReplanAgent(trip, user, alert) {
  try {
    const res = await axios.post(`${FASTAPI_URL}/replan`, {
      userId: user._id.toString(),
      tripId: trip._id.toString(),
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      guests: trip.guests,
      budget: trip.budget,
      tripType: trip.tripType,
      aiResponse: trip.aiResponse || '',
      alert: alert
    });

    return res.data.replannedItinerary || null;
  } catch (err) {
    console.error(`❌ Replan agent failed for ${trip.destination}:`, err.message);
    return null;
  }
}

// ✅ Update watchlist item with replanned itinerary
async function updateWatchlistWithReplan(userId, tripId, replannedItinerary) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const trip = user.watchlist.id(tripId);
    if (!trip) return;

    trip.previousAIResponse = trip.aiResponse;
    trip.aiResponse = replannedItinerary;
    trip.isReplanned = true;

    await user.save();
    console.log(`📝 Watchlist updated with replan for trip ${tripId}`);
  } catch (err) {
    console.error(`❌ Failed to update watchlist with replan:`, err.message);
  }
}

// ✅ Main Scheduler Function
async function checkAndNotifyAllTrips() {
  console.log('🔔 Running notification check...');

  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const users = await User.find({
      'watchlist.startDate': { $gte: today, $lte: thirtyDaysLater }
    });

    console.log(`Found ${users.length} users with upcoming trips`);

    for (const user of users) {
      for (const trip of user.watchlist) {

        if (trip.startDate < today || trip.startDate > thirtyDaysLater) continue;

        const alreadyNotified = await Notification.findOne({
          tripId: trip._id.toString(),
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (alreadyNotified) {
          console.log(`⏭️ Already notified today for trip ${trip._id}`);
          continue;
        }

        const forecasts = await getWeatherForecast(trip.destination, trip.startDate);
        const alert = assessWeatherSeverity(forecasts);

        if (!alert) continue;

        const shouldNotify = applySeverityRules(alert, trip.startDate);
        if (!shouldNotify) continue;

        const message = await generateAlertMessage(trip.destination, alert);

        // ✅ Create the notification
        const notification = await Notification.create({
          userId: user._id.toString(),
          tripId: trip._id.toString(),
          destination: trip.destination,
          message,
          severity: alert.severity,
          type: 'weather',
          emailSent: false
        });

        console.log(`✅ Notification created for user ${user._id} — ${trip.destination}`);

        // ✅ Send email for critical and warning
        const emailSent = await sendWeatherAlert(user.email, user.name, notification);
        if (emailSent) {
          await Notification.findByIdAndUpdate(notification._id, { emailSent: true });
          console.log(`📧 Email sent for trip ${trip._id}`);
        }

        // ✅ Critical alerts trigger replanning agent
        if (alert.severity === 'critical') {
          const replannedItinerary = await callReplanAgent(trip, user, alert);

          if (replannedItinerary) {
            await Notification.findByIdAndUpdate(notification._id, {
              replannedItinerary
            });

            await updateWatchlistWithReplan(
              user._id.toString(),
              trip._id.toString(),
              replannedItinerary
            );

            console.log(`🔄 Trip replanned for user ${user._id} — ${trip.destination}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
}

// ✅ Start Cron Job — every day at 8 AM
function startScheduler() {
  cron.schedule('0 8 * * *', checkAndNotifyAllTrips);
  console.log('📅 Notification scheduler started');
}

module.exports = { startScheduler, checkAndNotifyAllTrips };