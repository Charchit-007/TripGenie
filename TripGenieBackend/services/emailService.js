// services/emailService.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

// ──────────────────────────────────────────────
// WEATHER ALERT EMAIL
// ──────────────────────────────────────────────

function getEmailTemplate(userName, notification) {
  const severityConfig = {
    critical: {
      color: '#ef4444',
      label: '🔴 Critical Alert',
      banner: '#7f1d1d',
    },
    warning: {
      color: '#eab308',
      label: '🟡 Weather Warning',
      banner: '#713f12',
    },
  };

  const config = severityConfig[notification.severity] || severityConfig.warning;

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0B1D26;font-family:sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f2733;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        
        <div style="background:${config.banner};padding:24px 32px;border-bottom:2px solid ${config.color};">
          <p style="margin:0;color:${config.color};font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;">
            Trip Genie · Travel Intelligence
          </p>
          <h1 style="margin:8px 0 0;color:white;font-size:22px;font-weight:900;">
            ${config.label}
          </h1>
        </div>

        <div style="padding:32px;">
          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0 0 16px;">
            Hi ${userName || 'Traveller'},
          </p>

          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0 0 24px;">
            We detected an alert for your upcoming trip to 
            <strong style="color:white;">📍 ${notification.destination}</strong>
          </p>

          <div style="background:rgba(255,255,255,0.05);border-left:4px solid ${config.color};border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="color:white;font-size:14px;line-height:1.7;margin:0;">
              ${notification.message}
            </p>
          </div>

          ${notification.replannedItinerary ? `
          <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="color:#fbbf24;font-size:13px;font-weight:900;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.1em;">
              🔄 Your Trip Has Been Replanned
            </p>
            <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">
              TripGenie has automatically generated a revised itinerary for you. View it in your watchlist.
            </p>
          </div>
          ` : ''}

          <a href="http://localhost:3000/watchlist" 
             style="display:inline-block;background:#56B7DF;color:#0B1D26;padding:14px 32px;border-radius:50px;font-weight:900;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">
            View My Watchlist →
          </a>
        </div>

        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:0.2em;">
            © ${new Date().getFullYear()} Trip Genie AI Protocol · You're receiving this because you have a saved trip.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

async function sendWeatherAlert(userEmail, userName, notification) {
  const severityLabels = {
    critical: '🔴 Critical Travel Alert',
    warning: '🟡 Weather Warning',
  };

  const subject = `${severityLabels[notification.severity] || '✈️ Travel Alert'} — ${notification.destination}`;

  const msg = {
    to: userEmail,
    from: FROM_EMAIL,
    subject,
    html: getEmailTemplate(userName, notification),
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Weather email sent to ${userEmail} for ${notification.destination}`);
    return true;
  } catch (err) {
    console.error(`❌ Weather email failed for ${userEmail}:`, err.message);
    return false;
  }
}

// ──────────────────────────────────────────────
// FLIGHT TICKET EMAIL
// ──────────────────────────────────────────────

function getFlightTicketTemplate(userName, bookingData) {
  const outbound = bookingData.flightDetails.outbound;
  const passengerNames = bookingData.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ');

  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0B1D26;font-family:sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#0f2733;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
        
        <div style="background:#082f49;padding:24px 32px;border-bottom:2px solid #38bdf8;">
          <p style="margin:0;color:#38bdf8;font-size:11px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;">
            Trip Genie · Flight Confirmed
          </p>
          <h1 style="margin:8px 0 0;color:white;font-size:22px;font-weight:900;">
            🎫 E-Ticket: ${bookingData.bookingReference}
          </h1>
        </div>

        <div style="padding:32px;">
          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0 0 16px;">
            Hi ${userName || bookingData.passengers[0].firstName},
          </p>

          <p style="color:rgba(255,255,255,0.7);font-size:15px;margin:0 0 24px;">
            Your flight to <strong style="color:white;">📍 ${outbound.destination_city}</strong> is confirmed and ready.
          </p>

          <div style="background:rgba(255,255,255,0.05);border-left:4px solid #38bdf8;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="color:white;font-size:16px;font-weight:bold;margin:0 0 12px;">
              ✈️ ${bookingData.flightDetails.airline_name} — ${bookingData.flightDetails.flight_number}
            </p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 6px;">
              <strong style="color:#94a3b8;">Departure:</strong> ${outbound.origin_city} (${outbound.origin_iata})<br/>
              <span style="color:white;">${outbound.departure.time} on ${outbound.departure.date}</span>
            </p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 6px;">
              <strong style="color:#94a3b8;">Arrival:</strong> ${outbound.destination_city} (${outbound.destination_iata})<br/>
              <span style="color:white;">${outbound.arrival.time} on ${outbound.arrival.date}</span>
            </p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">
              <strong style="color:#94a3b8;">Cabin:</strong> ${bookingData.flightDetails.cabin}
            </p>
          </div>

          <div style="background:rgba(255,255,255,0.05);border-left:4px solid #10b981;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 10px;">
              <strong style="color:#94a3b8;">Passengers:</strong> <span style="color:white;">${passengerNames}</span>
            </p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">
              <strong style="color:#94a3b8;">Total Paid:</strong> <span style="color:#10b981;font-weight:bold;font-size:16px;">${bookingData.totalPaid} ${bookingData.currency}</span>
            </p>
          </div>

          <a href="http://localhost:3000/bookings" 
             style="display:inline-block;background:#56B7DF;color:#0B1D26;padding:14px 32px;border-radius:50px;font-weight:900;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">
            View Boarding Pass →
          </a>
        </div>

        <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;text-transform:uppercase;letter-spacing:0.2em;">
            © ${new Date().getFullYear()} Trip Genie AI Protocol · Your ticket receipt.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}

async function sendFlightTicketEmail(userEmail, userName, bookingData) {
  const outbound = bookingData.flightDetails.outbound;
  const subject = `🎫 Flight Confirmed: ${outbound.destination_city} (${bookingData.bookingReference})`;

  const msg = {
    to: userEmail,
    from: FROM_EMAIL,
    subject,
    html: getFlightTicketTemplate(userName, bookingData),
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Ticket email sent to ${userEmail} for PNR: ${bookingData.bookingReference}`);
    return true;
  } catch (err) {
    console.error(`❌ Ticket email failed for ${userEmail}:`, err.message);
    return false;
  }
}

module.exports = { 
  sendWeatherAlert, 
  sendFlightTicketEmail 
};