import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BookingsPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view your bookings.');
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const data = await response.json();
        setBookings(data.bookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1D26] flex items-center justify-center text-white">
        <div className="text-center animate-pulse text-[#56B7DF]">
          <span className="text-4xl block mb-4">✈️</span>
          Loading your travel wallet...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1D26] text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-10 border-b border-gray-800 pb-6 flex justify-between items-end">
          <div>
            
                    {/* Back to Home */}
                    <button
                      onClick={() => navigate('/home')}
                      className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all group"
                      style={{ color: '#56B7DF' }}
                    >
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      Back to Home
                    </button>
                    
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#56B7DF] to-[#38bdf8]">
              My Bookings
            </h1>
            <p className="text-gray-400 mt-2">Manage your upcoming flights and past trips.</p>
          </div>
          <button 
            onClick={() => navigate('/watchlist')}
            className="text-sm font-bold text-[#56B7DF] hover:text-white transition"
          >
            + Plan a New Trip
          </button>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-[#0f2733] p-12 rounded-2xl border border-gray-800 text-center">
            <div className="text-6xl mb-4 opacity-50">🎫</div>
            <h2 className="text-xl font-bold mb-2">No flights booked yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              You don't have any confirmed tickets. Head over to your Watchlist to find and book the perfect flight for your AI-planned trips.
            </p>
            <button 
              onClick={() => navigate('/watchlist')}
              className="bg-[#56B7DF] text-[#0B1D26] px-8 py-3 rounded-lg font-bold hover:bg-[#3ea0c7] transition"
            >
              Go to Watchlist
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const { outbound } = booking.flightDetails;
              
              return (
                <div key={booking._id} className="bg-[#0f2733] rounded-xl border border-gray-800 hover:border-gray-600 transition overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Left Side: Date & Status */}
                  <div className="bg-black/20 p-6 md:w-48 flex flex-col justify-center items-center md:border-r border-gray-800 border-b md:border-b-0">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Departure</p>
                    <p className="text-2xl font-black text-[#56B7DF] text-center leading-tight">
                      {outbound.departure.date.split(' ')[0]} <br/>
                      <span className="text-lg text-white">{outbound.departure.date.split(' ').slice(1).join(' ')}</span>
                    </p>
                    <div className="mt-4 bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {booking.status}
                    </div>
                  </div>

                  {/* Middle: Route Info */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-300">{booking.flightDetails.airline_name}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-[#56B7DF]/20 text-[#56B7DF]">
                          🔄 Round Trip
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">PNR: <strong className="text-white tracking-widest">{booking.bookingReference}</strong></span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="w-1/3">
                        <p className="text-3xl font-black">{outbound.origin_iata}</p>
                        <p className="text-sm text-gray-400">{outbound.departure.time}</p>
                      </div>
                      
                      <div className="w-1/3 flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">{outbound.duration}</div>
                        <div className="flex items-center w-full">
                          <div className="h-px bg-gray-600 w-full"></div>
                          <div className="w-2 h-2 rounded-full bg-[#56B7DF] mx-1"></div>
                          <div className="h-px bg-gray-600 w-full"></div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase">
                          {outbound.stops === 0 ? 'Direct' : `${outbound.stops} Stop(s)`}
                        </div>
                      </div>

                      <div className="w-1/3 text-right">
                        <p className="text-3xl font-black">{outbound.destination_iata}</p>
                        <p className="text-sm text-gray-400">{outbound.arrival.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Action */}
                  <div className="p-6 bg-black/10 md:w-56 flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-800">
                    <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                    <p className="text-2xl font-black text-[#10b981] mb-4">
                      ₹{booking.totalPaid} <span className="text-sm text-gray-400 font-normal">{booking.currency}</span>
                    </p>
                    <button 
                      onClick={() => navigate(`/ticket/${booking._id}`)}
                      className="w-full bg-transparent border border-[#56B7DF] text-[#56B7DF] px-4 py-2 rounded-lg font-bold hover:bg-[#56B7DF]/10 transition text-center"
                    >
                      View Ticket
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;