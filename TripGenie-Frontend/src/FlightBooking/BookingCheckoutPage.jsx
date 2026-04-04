import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BookingCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const flight = location.state?.flight;
  const trip = location.state?.trip;

  const userId = localStorage.getItem('userId');
  const userEmailDefault = localStorage.getItem('userEmail') || '';

  const [passengers, setPassengers] = useState([]);
  const [email, setEmail] = useState(userEmailDefault);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip && trip.guests) {
      const initialPassengers = Array.from({ length: trip.guests }, () => ({
        firstName: '',
        lastName: '',
        passportNumber: ''
      }));
      setPassengers(initialPassengers);
    }
  }, [trip]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (!userId) throw new Error('You must be logged in to book a flight.');

      let currentTripId = trip._id;

      if (!currentTripId) {
        setProcessingStep('Saving trip to your watchlist...');
        const saveTripRes = await fetch('http://localhost:5000/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            guests: trip.guests,
            budget: trip.budget,
            tripType: trip.tripType,
            aiResponse: trip.aiResponse
          })
        });

        if (!saveTripRes.ok) throw new Error('Failed to secure trip data in the database.');
        const savedTripData = await saveTripRes.json();
        currentTripId = savedTripData.trip._id;
      }

      setProcessingStep('Securing your ticket...');
      const bookingRes = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tripId: currentTripId,
          flightDetails: flight,
          passengers,
          totalPaid: flight.total_price,
          currency: flight.currency,
          userEmail: email
        })
      });

      if (!bookingRes.ok) {
        const errData = await bookingRes.json();
        throw new Error(errData.error || 'Payment failed or booking could not be saved.');
      }
      const bookingData = await bookingRes.json();

      setProcessingStep('Agent is synchronizing your itinerary...');
      const syncRes = await fetch('http://localhost:8000/sync-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tripId: currentTripId,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          guests: trip.guests,
          budget: trip.budget,
          tripType: trip.tripType,
          aiResponse: trip.aiResponse,
          flight: flight
        })
      });

      if (!syncRes.ok) throw new Error('Failed to sync itinerary.');
      const syncData = await syncRes.json();

      setProcessingStep('Finalizing your Watchlist...');
      const updateRes = await fetch(`http://localhost:5000/api/trips/${currentTripId}/flight`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightDetails: flight,
          newAiResponse: syncData.replannedItinerary
        })
      });

      if (!updateRes.ok) throw new Error('Failed to update trip with new itinerary.');

      navigate(`/ticket/${bookingData.booking._id}`, { state: { success: true } });

    } catch (err) {
      setError(err.message || 'An error occurred during checkout.');
      setIsProcessing(false);
    }
  };

  if (!flight || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1D26] text-white">
        <p>Missing booking details. Please go back and select a flight.</p>
      </div>
    );
  }

  const { outbound } = flight;

  return (
    <div className="min-h-screen bg-[#0B1D26] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Back to Home */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all group"
          style={{ color: '#56B7DF' }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
        
        <h1 className="text-3xl font-black mb-8 text-[#56B7DF]">Complete Your Booking</h1>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Contact Details */}
            <div className="bg-[#0f2733] p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Contact Information</h2>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email (For E-Ticket)</label>
                <input 
                  type="email" required
                  className="w-full bg-[#0B1D26] border border-gray-700 rounded p-3 text-white focus:border-[#56B7DF] outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Passenger Details */}
            <form id="checkout-form" onSubmit={handleCheckout} className="bg-[#0f2733] p-6 rounded-xl border border-gray-800 space-y-6">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Passenger Details</h2>
              
              {passengers.map((p, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-[#56B7DF] font-semibold">Passenger {idx + 1}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      <input 
                        type="text" required
                        className="w-full bg-[#0B1D26] border border-gray-700 rounded p-3 text-white focus:border-[#56B7DF] outline-none"
                        value={p.firstName}
                        onChange={(e) => handlePassengerChange(idx, 'firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      <input 
                        type="text" required
                        className="w-full bg-[#0B1D26] border border-gray-700 rounded p-3 text-white focus:border-[#56B7DF] outline-none"
                        value={p.lastName}
                        onChange={(e) => handlePassengerChange(idx, 'lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Passport Number (Optional)</label>
                    <input 
                      type="text"
                      className="w-full bg-[#0B1D26] border border-gray-700 rounded p-3 text-white focus:border-[#56B7DF] outline-none"
                      value={p.passportNumber}
                      onChange={(e) => handlePassengerChange(idx, 'passportNumber', e.target.value)}
                    />
                  </div>
                  {idx < passengers.length - 1 && <hr className="border-gray-700 my-4"/>}
                </div>
              ))}
            </form>
          </div>

          {/* Right Column: Flight Summary & Pay */}
          <div className="md:col-span-1">
            <div className="bg-[#0f2733] p-6 rounded-xl border border-[#56B7DF]/30 sticky top-6">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Flight Summary</h2>
              
              <div className="mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Airline</span>
                  <span className="font-semibold">{flight.airline_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Flight</span>
                  <span className="font-semibold">{flight.flight_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ticket Type</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-[#56B7DF]/20 text-[#56B7DF]">
                    🔄 Round Trip
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cabin</span>
                  <span className="font-semibold">{flight.cabin}</span>
                </div>
                
                <div className="mt-4 p-4 bg-[#0B1D26] rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-2 font-semibold uppercase">Outbound Flight</div>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-black">{outbound.departure.time}</span>
                    <span className="text-2xl font-black">{outbound.arrival.time}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{outbound.origin_iata}</span>
                    <span>{outbound.duration}</span>
                    <span>{outbound.destination_iata}</span>
                  </div>
                </div>
                <div className="mt-3 p-4 bg-[#0B1D26] rounded-lg border border-gray-800">
                  <div className="text-xs text-gray-500 mb-2 font-semibold uppercase">Return Flight</div>
                  <div className="flex justify-between mb-2">
                    <span className="text-2xl font-black">{flight.inbound?.departure?.time || 'TBD'}</span>
                    <span className="text-2xl font-black">{flight.inbound?.arrival?.time || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{flight.inbound?.origin_iata || '---'}</span>
                    <span>{flight.inbound?.duration || '---'}</span>
                    <span>{flight.inbound?.destination_iata || '---'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg">Total Due</span>
                  <span className="text-3xl font-black text-[#10b981]">₹{flight.total_price}</span>
                </div>
                <p className="text-right text-xs text-gray-500 mt-1">Includes ₹{flight.taxes_and_fees} taxes & fees</p>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button 
                form="checkout-form"
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#10b981] text-white py-4 rounded-lg font-black text-lg hover:bg-[#059669] transition disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin text-2xl mb-1">⚙️</span>
                    <span className="text-sm font-normal">{processingStep}</span>
                  </>
                ) : (
                  'Confirm & Pay'
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;