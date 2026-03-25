import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FlightsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // The trip object is passed via React Router state when navigating from Watchlist/ChatUI
  const trip = location.state?.trip; 

  // Use origin instead of a generic search query
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!origin.trim()) {
      setError('Please tell us where you are flying from.');
      return;
    }

    setLoading(true);
    setError('');
    setFlightData(null);

    // Build the strict query using the origin and the trip context
    const startDate = new Date(trip.startDate).toISOString().split('T')[0];
    const strictQuery = `Flights from ${origin} to ${trip.destination} for ${trip.guests} people on ${startDate}`;

    try {
      const response = await fetch('http://localhost:8000/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: strictQuery,
          trip_profile: trip ? {
            budget_tier: trip.budget,
            trip_type: trip.tripType,
            guests: trip.guests,
            destination: trip.destination,
            start_date: startDate
          } : null
        }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setFlightData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (flight) => {
    navigate('/booking-checkout', { state: { flight, trip } });
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1D26] text-white">
        <p>No trip context found. Please select a trip from your watchlist first.</p>
        <button onClick={() => navigate('/watchlist')} className="mt-4 text-[#56B7DF] hover:underline">
          Go to Watchlist
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1D26] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#56B7DF] to-[#38bdf8]">
            Flight Concierge
          </h1>
          <p className="text-gray-400">Find the best routes to {trip.destination}</p>
        </div>

        {/* Two-part search form */}
        <form onSubmit={handleSearch} className="mb-12 flex flex-col md:flex-row gap-4 bg-[#0f2733] p-4 rounded-xl border border-gray-800 items-center">
          <div className="flex-1 w-full flex items-center bg-[#0B1D26] rounded-lg px-4 py-2 border border-gray-700 focus-within:border-[#56B7DF]">
            <span className="text-gray-500 font-bold mr-2">FROM:</span>
            <input
              type="text"
              required
              className="w-full bg-transparent border-none text-white focus:outline-none"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai, JFK, London..."
            />
          </div>
          
          <div className="flex-1 w-full flex items-center bg-[#0B1D26]/50 rounded-lg px-4 py-2 border border-gray-800 opacity-70 cursor-not-allowed">
            <span className="text-gray-500 font-bold mr-2">TO:</span>
            <input
              type="text"
              disabled
              className="w-full bg-transparent border-none text-white"
              value={`${trip.destination} (${trip.guests} Guests)`}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto bg-[#56B7DF] text-[#0B1D26] px-8 py-3 rounded-lg font-bold hover:bg-[#3ea0c7] transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400 animate-pulse">
            <span className="text-4xl block mb-4">✈️</span>
            Analyzing routes, airlines, and your trip profile...
          </div>
        )}

        {flightData && (
          <div className="space-y-12 animate-fade-in">
            
            {/* AI Recommendation Section */}
            {flightData.recommended && (
              <div className="bg-gradient-to-br from-[#0f2733] to-[#0a1922] p-6 rounded-2xl border border-[#56B7DF]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#56B7DF] text-[#0B1D26] text-xs font-bold px-4 py-1 rounded-bl-lg uppercase tracking-wider">
                  AI Recommended
                </div>
                
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  ✨ TripGenie's Top Pick
                </h2>
                
                <p className="text-gray-300 italic mb-6 border-l-2 border-[#56B7DF] pl-4">
                  "{flightData.recommendation_reason}"
                </p>

                <div className="flex flex-col md:flex-row justify-between items-center bg-[#0B1D26] p-6 rounded-xl border border-gray-800">
                  <div className="flex-1 w-full mb-4 md:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">{flightData.recommended.airline_name}</span>
                      <span className="text-sm text-gray-400">Flight {flightData.recommended.flight_number}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <div>
                        <div className="text-2xl font-black">{flightData.recommended.outbound.departure.time}</div>
                        <div className="text-sm">{flightData.recommended.outbound.origin_iata}</div>
                      </div>
                      <div className="text-center flex-1 px-4">
                        <div className="text-xs text-gray-500 mb-1">{flightData.recommended.outbound.duration}</div>
                        <div className="h-px bg-gray-700 w-full relative">
                          <span className="absolute left-1/2 -top-2 -translate-x-1/2 text-[10px] bg-[#0B1D26] px-2 text-gray-400">
                            {flightData.recommended.outbound.stops === 0 ? 'Direct' : `${flightData.recommended.outbound.stops} Stop(s)`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">{flightData.recommended.outbound.arrival.time}</div>
                        <div className="text-sm">{flightData.recommended.outbound.destination_iata}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:ml-8 flex flex-col items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-8">
                    <span className="text-3xl font-black text-[#10b981]">₹{flightData.recommended.total_price}</span>
                    <span className="text-xs text-gray-500 mb-4">{flightData.recommended.cabin} • {trip.guests} Guest(s)</span>
                    <button 
                      onClick={() => openBookingModal(flightData.recommended)}
                      className="w-full bg-[#10b981] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#059669] transition"
                    >
                      Select This Flight
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Options Section (With Optional Chaining ?.) */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-gray-400">Other Available Flights</h3>
              <div className="grid gap-4">
                {flightData.all_options.filter(f => f.id !== flightData.recommended?.id).map((flight, idx) => (
                  <div key={flight.id || idx} className="flex flex-col md:flex-row justify-between items-center bg-[#0f2733] p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition">
                    <div className="flex-1 w-full mb-4 md:mb-0 flex gap-6 items-center">
                      <div className="w-12 h-12 bg-[#0B1D26] rounded-full flex items-center justify-center font-bold text-gray-400">
                        {flight?.airline_code || '✈️'}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <div className="font-bold">{flight?.outbound?.departure?.time || 'TBD'}</div>
                          <div className="text-sm text-gray-500">{flight?.outbound?.origin_iata || '---'}</div>
                        </div>
                        <div className="text-center text-xs text-gray-500 px-4">
                          <div>{flight?.outbound?.duration || '---'}</div>
                          <div className="text-[#56B7DF]">{flight?.outbound?.stops === 0 ? 'Direct' : `${flight?.outbound?.stops || 0} Stop(s)`}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{flight?.outbound?.arrival?.time || 'TBD'}</div>
                          <div className="text-sm text-gray-500">{flight?.outbound?.destination_iata || '---'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:ml-6 flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-xl font-bold">₹{flight?.total_price || '0.00'}</div>
                        <div className="text-xs text-gray-500">{flight?.cabin || 'ECONOMY'}</div>
                      </div>
                      <button 
                        onClick={() => openBookingModal(flight)}
                        disabled={!flight?.outbound}
                        className="border border-[#56B7DF] text-[#56B7DF] px-6 py-2 rounded-lg font-bold hover:bg-[#56B7DF]/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FlightsPage;