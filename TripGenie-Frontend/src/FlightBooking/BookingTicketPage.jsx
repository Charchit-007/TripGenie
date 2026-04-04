import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BookingTicketPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const justBooked = location.state?.success;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`);
        if (!response.ok) throw new Error('Ticket not found');
        
        const data = await response.json();
        setTicket(data.booking);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1D26] flex flex-col items-center justify-center text-white">
        <div className="animate-spin text-4xl mb-4 text-[#56B7DF]">🎫</div>
        <p className="text-gray-400 tracking-widest uppercase text-sm">Retrieving E-Ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#0B1D26] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Could not load ticket details.'}</p>
          <button 
            onClick={() => navigate('/watchlist')}
            className="text-[#56B7DF] hover:underline"
          >
            Return to Watchlist
          </button>
        </div>
      </div>
    );
  }

  const { flightDetails, outbound = flightDetails.outbound, passengers } = ticket;

  return (
    <div className="min-h-screen bg-[#0B1D26] text-white p-6 md:p-12 font-sans flex flex-col items-center">

      {/* Back to Home */}
      <div className="w-full max-w-3xl mb-4">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-semibold transition-all group"
          style={{ color: '#56B7DF' }}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      {justBooked && (
        <div className="mb-8 text-center animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#10b981]/20 text-[#10b981] mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
          <p className="text-gray-400 mt-2">Your receipt has been sent to your email.</p>
          <p className="text-[#56B7DF] mt-1 text-sm font-semibold">Your AI Travel Plan has been successfully synced with these flight times.</p>
        </div>
      )}

      {/* The Ticket UI */}
      <div className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* Top Header - Airline & Status */}
        <div className="bg-[#0f2733] p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-xl">
              {flightDetails.airline_code}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide">{flightDetails.airline_name}</h2>
              <p className="text-[#56B7DF] text-sm uppercase tracking-widest font-semibold">Flight {flightDetails.flight_number}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-[#10b981] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
              {ticket.status}
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-widest">E-Ticket</p>
          </div>
        </div>

        {/* Middle Body - Route & Times */}
        <div className="p-8 pb-10 relative">
          
          <div className="flex justify-between items-center mb-8">
            <div className="w-1/3">
              <p className="text-5xl font-black text-[#0f2733]">{outbound.origin_iata}</p>
              <p className="text-gray-500 font-semibold mt-1">{outbound.origin_city}</p>
              <p className="text-sm text-gray-400 mt-2">{outbound.departure.time}</p>
              <p className="text-sm text-gray-400">{outbound.departure.date}</p>
            </div>
            
            <div className="w-1/3 flex flex-col items-center relative">
              <div className="w-full flex items-center">
                <div className="h-px bg-gray-300 w-full"></div>
                <span className="text-2xl mx-2 text-[#56B7DF]">✈️</span>
                <div className="h-px bg-gray-300 w-full"></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 uppercase font-semibold tracking-widest">{outbound.duration}</p>
              <p className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded mt-1">
                {outbound.stops === 0 ? 'NON-STOP' : `${outbound.stops} STOP(S)`}
              </p>
            </div>

            <div className="w-1/3 text-right">
              <p className="text-5xl font-black text-[#0f2733]">{outbound.destination_iata}</p>
              <p className="text-gray-500 font-semibold mt-1">{outbound.destination_city}</p>
              <p className="text-sm text-gray-400 mt-2">{outbound.arrival.time}</p>
              <p className="text-sm text-gray-400">{outbound.arrival.date}</p>
            </div>
          </div>

          {/* Passenger & Booking Meta Grid */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Passenger(s)</p>
              {passengers.map((p, idx) => (
                <p key={idx} className="font-bold text-[#0f2733] truncate">
                  {p.lastName.toUpperCase()}, {p.firstName.toUpperCase()}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Class</p>
              <p className="font-bold text-[#0f2733] truncate">{flightDetails.cabin}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Date Booked</p>
              <p className="font-bold text-[#0f2733] truncate">
                {new Date(ticket.bookingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Perforation Line Effect */}
          <div className="absolute bottom-0 left-0 w-full border-b-2 border-dashed border-gray-300"></div>
          <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-[#0B1D26] rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-[#0B1D26] rounded-full"></div>
        </div>

        {/* Bottom Footer - Barcode & Total */}
        <div className="bg-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Booking Reference (PNR)</p>
            <p className="text-3xl font-black tracking-widest text-[#0f2733]">{ticket.bookingReference}</p>
            <p className="text-sm text-gray-500 mt-1">Total Paid: ₹{ticket.totalPaid} {ticket.currency}</p>
          </div>
          
          <div className="h-16 w-full md:w-64" style={{ 
            backgroundImage: 'repeating-linear-gradient(to right, #0f2733, #0f2733 2px, transparent 2px, transparent 4px, #0f2733 4px, #0f2733 5px, transparent 5px, transparent 8px, #0f2733 8px, #0f2733 12px, transparent 12px, transparent 14px)'
          }}></div>
        </div>

      </div>

      {/* Navigation Actions */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => navigate('/watchlist')}
          className="bg-transparent border border-[#56B7DF] text-[#56B7DF] px-8 py-3 rounded-lg font-bold hover:bg-[#56B7DF]/10 transition"
        >
          View Synced Itinerary
        </button>
        <button 
          onClick={() => navigate('/bookings')}
          className="bg-[#56B7DF] text-[#0B1D26] px-8 py-3 rounded-lg font-bold hover:bg-[#3ea0c7] transition"
        >
          All My Bookings
        </button>
      </div>

    </div>
  );
};

export default BookingTicketPage;