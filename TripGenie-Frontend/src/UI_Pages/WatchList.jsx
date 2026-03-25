import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, Sparkles, Trash2, Loader2, 
  Globe2, ArrowLeft, Heart, Clock, AlertCircle, Compass,
  RefreshCw, ChevronDown, ChevronUp, History, Plane
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5000";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showingOldPlan, setShowingOldPlan] = useState({});

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view your watchlist');
      setIsLoading(false);
      return;
    }
    fetchWatchlist();
  }, [userId]);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/trips/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.trips || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch watchlist');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this trip from your watchlist?')) return;
    setDeletingId(itemId);
    try {
      const response = await fetch(`${BASE_URL}/api/trips/${itemId}`, { method: 'DELETE' });
      if (response.ok) {
        setWatchlist(watchlist.filter(item => item._id !== itemId));
        if (selectedTrip?._id === itemId) setSelectedTrip(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch (err) {
      alert(`Error deleting trip: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleOldPlan = (tripId) => {
    setShowingOldPlan(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric'
  });

  const getDaysBetween = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBudgetIcon = (budget) => ({
    'affordable': '💰', 'mid-range': '💰💰', 'luxury': '💰💰💰'
  }[budget] || '💰');

  const getTripTypeEmoji = (tripType) => ({
    'leisure': '🏖️', 'adventure': '🏔️', 'cultural': '🏛️',
    'family': '👨‍👩‍👧‍👦', 'romantic': '💑', 'business': '💼'
  }[tripType] || '✈️');

  // ─── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)' }}
      >
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" style={{ color: '#56B7DF' }} />
          <p className="text-lg font-medium" style={{ color: 'rgba(86,183,223,0.75)' }}>
            Loading your travel dreams...
          </p>
        </div>
      </div>
    );
  }

  // ─── Not logged in ────────────────────────────────────────────────────────
  if (error && !userId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)' }}
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="mb-6" style={{ color: 'rgba(86,183,223,0.7)' }}>{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 text-white rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
              boxShadow: '0 6px 20px rgba(86,183,223,0.35)'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Main page ────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)' }}
    >
      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.10) 0%, transparent 65%)' }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.07) 0%, transparent 65%)' }} />
      <div className="fixed top-1/2 left-1/3 w-64 h-64 rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.04) 0%, transparent 65%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 font-semibold transition-all mb-6 group cursor-pointer"
            style={{ color: '#56B7DF' }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Compass className="w-10 h-10" style={{ color: '#56B7DF' }} />
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 animate-pulse" style={{ color: '#38bdf8' }} />
                </div>
                <h1
                  className="text-4xl md:text-5xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #56B7DF, #38bdf8, #7dd3fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  My Watchlist
                </h1>
              </div>
              <p className="text-lg font-medium" style={{ color: 'rgba(86,183,223,0.75)' }}>
                {userName ? `${userName}'s saved adventures` : 'Your saved travel plans'}
              </p>
            </div>

            {/* Trip count badge */}
            <div
              className="rounded-2xl px-6 py-4 shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(86,183,223,0.2)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}
            >
              <div className="text-center">
                <div
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #56B7DF, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {watchlist.length}
                </div>
                <div className="text-sm font-medium mt-1" style={{ color: 'rgba(86,183,223,0.7)' }}>
                  {watchlist.length === 1 ? 'Trip Saved' : 'Trips Saved'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {watchlist.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <Globe2 className="w-24 h-24" style={{ color: 'rgba(86,183,223,0.25)' }} />
              <Heart className="w-8 h-8 absolute -top-2 -right-2" style={{ color: 'rgba(86,183,223,0.4)' }} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No trips saved yet</h2>
            <p className="mb-6 max-w-md mx-auto" style={{ color: 'rgba(86,183,223,0.65)' }}>
              Start planning your dream vacation and save your favorite trips to your watchlist!
            </p>
            <button
              onClick={() => navigate('/chat')}
              className="px-6 py-3 text-white rounded-xl font-semibold transition-all transform hover:scale-105 cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
                boxShadow: '0 6px 20px rgba(86,183,223,0.35)'
              }}
            >
              Plan a Trip
            </button>
          </div>
        )}

        {/* ── Watchlist Grid ──────────────────────────────────────────────── */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {watchlist.map((trip, index) => (
              <div
                key={trip._id}
                className="group rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(86,183,223,0.15)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
                onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(86,183,223,0.35)'}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(86,183,223,0.15)'}
              >

                {/* Card Header */}
                <div
                  className="relative p-6 border-b"
                  style={{
                    background: 'rgba(86,183,223,0.07)',
                    borderColor: 'rgba(86,183,223,0.15)'
                  }}
                >
                  {/* Replanned badge */}
                  {trip.isReplanned && (
                    <div
                      className="absolute top-3 right-16 flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        color: '#fbbf24'
                      }}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replanned
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5" style={{ color: '#56B7DF' }} />
                        <h3 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                          {trip.destination}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(86,183,223,0.75)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.startDate)}
                        </span>
                        <span>→</span>
                        <span>{formatDate(trip.endDate)}</span>
                      </div>
                      <div className="mt-2 text-xs font-medium" style={{ color: 'rgba(86,183,223,0.5)' }}>
                        {getDaysBetween(trip.startDate, trip.endDate)} days trip
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(trip._id)}
                      disabled={deletingId === trip._id}
                      className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
                      style={{
                        background: 'rgba(86,183,223,0.08)',
                        border: '1px solid rgba(86,183,223,0.2)',
                        color: 'rgba(86,183,223,0.6)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                        e.currentTarget.style.color = '#f87171';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(86,183,223,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(86,183,223,0.2)';
                        e.currentTarget.style.color = 'rgba(86,183,223,0.6)';
                      }}
                      title="Remove from watchlist"
                    >
                      {deletingId === trip._id
                        ? <Loader2 className="w-5 h-5 animate-spin" />
                        : <Trash2 className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">

                  {/* Trip Detail Pills */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(86,183,223,0.08)', border: '1px solid rgba(86,183,223,0.15)' }}
                    >
                      <div className="flex items-center gap-2 text-xs mb-1 font-semibold uppercase tracking-wide"
                        style={{ color: 'rgba(86,183,223,0.7)' }}>
                        <Users className="w-3.5 h-3.5" />
                        Guests
                      </div>
                      <div className="font-bold text-white">{trip.guests}</div>
                    </div>

                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(86,183,223,0.08)', border: '1px solid rgba(86,183,223,0.15)' }}
                    >
                      <div className="flex items-center gap-2 text-xs mb-1 font-semibold uppercase tracking-wide"
                        style={{ color: 'rgba(86,183,223,0.7)' }}>
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget
                      </div>
                      <div className="font-bold capitalize text-white flex items-center gap-1">
                        <span className="text-sm">{getBudgetIcon(trip.budget)}</span>
                        {trip.budget}
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(86,183,223,0.08)', border: '1px solid rgba(86,183,223,0.15)' }}
                    >
                      <div className="flex items-center gap-2 text-xs mb-1 font-semibold uppercase tracking-wide"
                        style={{ color: 'rgba(86,183,223,0.7)' }}>
                        <Sparkles className="w-3.5 h-3.5" />
                        Vibe
                      </div>
                      <div className="font-bold capitalize text-white flex items-center gap-1">
                        <span className="text-sm">{getTripTypeEmoji(trip.tripType)}</span>
                        {trip.tripType}
                      </div>
                    </div>
                  </div>

                  {/* Added Date */}
                  <div
                    className="flex items-center gap-2 text-xs font-medium mb-4 pb-4 border-b"
                    style={{ color: 'rgba(86,183,223,0.5)', borderColor: 'rgba(86,183,223,0.12)' }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Added on {formatDate(trip.createdAt)}
                  </div>

                  {/* AI Response Section */}
                  {trip.aiResponse && (
                    <div>
                      {trip.isReplanned ? (
                        <div className="mb-3">
                          {/* Plan toggle tabs */}
                          <div className="flex items-center gap-2 mb-3">
                            <button
                              onClick={() => setShowingOldPlan(prev => ({ ...prev, [trip._id]: false }))}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                              style={!showingOldPlan[trip._id]
                                ? { background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }
                                : { background: 'rgba(86,183,223,0.08)', border: '1px solid rgba(86,183,223,0.2)', color: 'rgba(86,183,223,0.55)' }
                              }
                            >
                              <RefreshCw className="w-3 h-3" />
                              Revised Plan
                            </button>
                            {trip.previousAIResponse && (
                              <button
                                onClick={() => setShowingOldPlan(prev => ({ ...prev, [trip._id]: true }))}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                style={showingOldPlan[trip._id]
                                  ? { background: 'rgba(86,183,223,0.18)', border: '1px solid rgba(86,183,223,0.4)', color: '#56B7DF' }
                                  : { background: 'rgba(86,183,223,0.08)', border: '1px solid rgba(86,183,223,0.2)', color: 'rgba(86,183,223,0.55)' }
                                }
                              >
                                <History className="w-3 h-3" />
                                Original Plan
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold"
                              style={{ color: showingOldPlan[trip._id] ? '#56B7DF' : '#fbbf24' }}>
                              {showingOldPlan[trip._id] ? '📋 Original Plan' : '🔄 Revised Plan'}
                            </span>
                            <button
                              onClick={() => setSelectedTrip(selectedTrip?._id === trip._id ? null : trip)}
                              className="text-xs font-medium transition-colors cursor-pointer"
                              style={{ color: 'rgba(86,183,223,0.6)' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#56B7DF'}
                              onMouseLeave={e => e.currentTarget.style.color = 'rgba(86,183,223,0.6)'}
                            >
                              {selectedTrip?._id === trip._id ? 'Hide' : 'View'} details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTrip(selectedTrip?._id === trip._id ? null : trip)}
                          className="w-full text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: '#56B7DF' }}>
                              AI Travel Plan
                            </span>
                            <span className="text-xs font-medium" style={{ color: 'rgba(86,183,223,0.6)' }}>
                              {selectedTrip?._id === trip._id ? 'Hide' : 'View'} details
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Expanded plan */}
                      {selectedTrip?._id === trip._id && (
                        <div
                          className="rounded-xl p-4 border max-h-96 overflow-y-auto"
                          style={trip.isReplanned && !showingOldPlan[trip._id]
                            ? { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }
                            : { background: 'rgba(86,183,223,0.07)', border: '1px solid rgba(86,183,223,0.18)' }
                          }
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed"
                            style={{ color: 'rgba(255,255,255,0.82)' }}>
                            {trip.isReplanned && showingOldPlan[trip._id]
                              ? trip.previousAIResponse
                              : trip.aiResponse
                            }
                          </div>
                        </div>
                      )}

                      {/* Collapsed preview */}
                      {selectedTrip?._id !== trip._id && (
                        <div
                          className="rounded-xl p-4 border"
                          style={trip.isReplanned && !showingOldPlan[trip._id]
                            ? { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }
                            : { background: 'rgba(86,183,223,0.07)', border: '1px solid rgba(86,183,223,0.18)' }
                          }
                        >
                          <div className="text-sm line-clamp-3" style={{ color: 'rgba(86,183,223,0.7)' }}>
                            {trip.isReplanned && showingOldPlan[trip._id]
                              ? trip.previousAIResponse?.substring(0, 150)
                              : trip.aiResponse?.substring(0, 150)
                            }...
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── NEW FLIGHT BOOKING ACTION BAR ─── */}
                  <div className="mt-6 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(86,183,223,0.12)' }}>
                    {trip.hasBookedFlight ? (
                      <>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#10b981' }}>
                          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                          Flight Booked
                        </div>
                        <button
                          onClick={() => navigate('/bookings')}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          style={{
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#10b981'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                        >
                          View Tickets
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-medium" style={{ color: 'rgba(86,183,223,0.6)' }}>
                          Ready to travel?
                        </div>
                        <button
                          onClick={() => navigate('/flights', { state: { trip } })}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all transform hover:scale-105 cursor-pointer"
                          style={{
                            background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
                            color: '#0B1D26',
                            boxShadow: '0 4px 15px rgba(86,183,223,0.3)'
                          }}
                        >
                          <Plane className="w-4 h-4" />
                          Book Flights
                        </button>
                      </>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error Display ───────────────────────────────────────────────── */}
        {error && userId && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Watchlist</h3>
                <p className="text-red-400/70 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchWatchlist}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 text-red-400"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)'
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}