// services/weatherService.js
const axios = require('axios');

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

async function getWeatherForecast(destination, startDate) {
  try {
    // Get coordinates first
    const geoRes = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${destination}&limit=1&appid=${WEATHER_API_KEY}`
    );
    if (!geoRes.data.length) return null;

    const { lat, lon } = geoRes.data[0];

    // Get 5-day forecast (free tier)
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    // Filter forecasts near the trip start date
    const tripDate = new Date(startDate);
    const relevant = weatherRes.data.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      const diffDays = (tripDate - itemDate) / (1000 * 60 * 60 * 24);
      return diffDays >= -1 && diffDays <= 5;
    });

    return relevant;
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    return null;
  }
}

// Check if weather is severe enough to alert
function assessWeatherSeverity(forecasts) {
  if (!forecasts || !forecasts.length) return null;

  const severeConditions = ['Thunderstorm', 'Snow', 'Extreme', 'Tornado', 'Squall'];
  const warningConditions = ['Rain', 'Drizzle', 'Fog', 'Haze'];

  for (const forecast of forecasts) {
    const main = forecast.weather[0].main;
    const description = forecast.weather[0].description;
    const windSpeed = forecast.wind.speed; // m/s

    if (severeConditions.some(c => main.includes(c)) || windSpeed > 15) {
      return { 
        severity: 'critical', 
        condition: description, 
        temp: forecast.main.temp,
        windSpeed
      };
    }
    if (warningConditions.some(c => main.includes(c))) {
      return { 
        severity: 'warning', 
        condition: description, 
        temp: forecast.main.temp,
        windSpeed
      };
    }
  }
  return null; // No alert needed
}

module.exports = { getWeatherForecast, assessWeatherSeverity };