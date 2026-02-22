import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, Sparkles, Trash2, Loader2, 
  Globe2, ArrowLeft, Heart, Clock, AlertCircle, Compass,
  RefreshCw, ChevronDown, ChevronUp, History
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
      const response = await fetch(`${BASE_URL}/api/watchlist/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.watchlist || []);
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
      const response = await fetch(`${BASE_URL}/api/watchlist/${userId}/${itemId}`, {
        method: 'DELETE',
      });
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

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-sky-700 text-lg font-medium">Loading your travel dreams...</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-sky-900 mb-2">Authentication Required</h2>
          <p className="text-sky-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 relative overflow-hidden">

      {/* Decorative blobs — matching Chat_UI */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed top-1/2 left-1/3 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold transition-all mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Compass className="w-10 h-10 text-cyan-500" />
                  <Sparkles className="w-4 h-4 text-sky-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  My Watchlist
                </h1>
              </div>
              <p className="text-sky-600 text-lg font-medium">
                {userName ? `${userName}'s saved adventures` : 'Your saved travel plans'}
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-4 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  {watchlist.length}
                </div>
                <div className="text-sm text-sky-600 font-medium mt-1">
                  {watchlist.length === 1 ? 'Trip Saved' : 'Trips Saved'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {watchlist.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <Globe2 className="w-24 h-24 text-sky-200" />
              <Heart className="w-8 h-8 text-cyan-300 absolute -top-2 -right-2" />
            </div>
            <h2 className="text-2xl font-bold text-sky-900 mb-3">No trips saved yet</h2>
            <p className="text-sky-600 mb-6 max-w-md mx-auto">
              Start planning your dream vacation and save your favorite trips to your watchlist!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Plan a Trip
            </button>
          </div>
        )}

        {/* Watchlist Grid */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {watchlist.map((trip, index) => (
              <div
                key={trip._id}
                className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden hover:border-cyan-300/60 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-200/50"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
              >
                {/* Card Header */}
                <div className="relative bg-gradient-to-br from-sky-100/80 to-cyan-100/80 p-6 border-b border-sky-100">

                  {/* Replanned badge */}
                  {trip.isReplanned && (
                    <div className="absolute top-3 right-16 flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3" />
                      Replanned
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-cyan-500" />
                        <h3 className="text-2xl font-bold text-sky-900 group-hover:text-cyan-600 transition-colors">
                          {trip.destination}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-sky-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.startDate)}
                        </span>
                        <span>→</span>
                        <span>{formatDate(trip.endDate)}</span>
                      </div>
                      <div className="mt-2 text-xs text-sky-500 font-medium">
                        {getDaysBetween(trip.startDate, trip.endDate)} days trip
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(trip._id)}
                      disabled={deletingId === trip._id}
                      className="p-2 rounded-lg bg-white/60 hover:bg-red-50 border border-sky-100 hover:border-red-200 text-sky-400 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                      title="Remove from watchlist"
                    >
                      {deletingId === trip._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Trip Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-sky-50/80 rounded-xl p-3 border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-500 text-xs mb-1 font-semibold uppercase tracking-wide">
                        <Users className="w-3.5 h-3.5" />
                        Guests
                      </div>
                      <div className="text-sky-900 font-bold">{trip.guests}</div>
                    </div>
                    <div className="bg-sky-50/80 rounded-xl p-3 border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-500 text-xs mb-1 font-semibold uppercase tracking-wide">
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget
                      </div>
                      <div className="text-sky-900 font-bold capitalize flex items-center gap-1">
                        <span className="text-sm">{getBudgetIcon(trip.budget)}</span>
                        {trip.budget}
                      </div>
                    </div>
                    <div className="bg-sky-50/80 rounded-xl p-3 border border-sky-100">
                      <div className="flex items-center gap-2 text-sky-500 text-xs mb-1 font-semibold uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        Vibe
                      </div>
                      <div className="text-sky-900 font-bold capitalize flex items-center gap-1">
                        <span className="text-sm">{getTripTypeEmoji(trip.tripType)}</span>
                        {trip.tripType}
                      </div>
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-4 pb-4 border-b border-sky-100">
                    <Clock className="w-3.5 h-3.5" />
                    Added on {formatDate(trip.addedAt)}
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                !showingOldPlan[trip._id]
                                  ? 'bg-amber-100 border border-amber-300 text-amber-600'
                                  : 'bg-sky-50 border border-sky-100 text-sky-400 hover:text-sky-600'
                              }`}
                            >
                              <RefreshCw className="w-3 h-3" />
                              Revised Plan
                            </button>
                            {trip.previousAIResponse && (
                              <button
                                onClick={() => setShowingOldPlan(prev => ({ ...prev, [trip._id]: true }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  showingOldPlan[trip._id]
                                    ? 'bg-sky-100 border border-sky-300 text-sky-600'
                                    : 'bg-sky-50 border border-sky-100 text-sky-400 hover:text-sky-600'
                                }`}
                              >
                                <History className="w-3 h-3" />
                                Original Plan
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${showingOldPlan[trip._id] ? 'text-sky-500' : 'text-amber-500'}`}>
                              {showingOldPlan[trip._id] ? '📋 Original Plan' : '🔄 Revised Plan'}
                            </span>
                            <button
                              onClick={() => setSelectedTrip(selectedTrip?._id === trip._id ? null : trip)}
                              className="text-xs text-sky-400 hover:text-sky-600 transition-colors font-medium"
                            >
                              {selectedTrip?._id === trip._id ? 'Hide' : 'View'} details
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTrip(selectedTrip?._id === trip._id ? null : trip)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-cyan-600">AI Travel Plan</span>
                            <span className="text-xs text-sky-400 font-medium">
                              {selectedTrip?._id === trip._id ? 'Hide' : 'View'} details
                            </span>
                          </div>
                        </button>
                      )}

                      {/* Plan content — expanded */}
                      {selectedTrip?._id === trip._id && (
                        <div className={`rounded-xl p-4 border max-h-96 overflow-y-auto ${
                          trip.isReplanned && !showingOldPlan[trip._id]
                            ? 'bg-amber-50/80 border-amber-200'
                            : 'bg-sky-50/80 border-sky-100'
                        }`}>
                          <div className="text-sm text-sky-800 whitespace-pre-wrap leading-relaxed">
                            {trip.isReplanned && showingOldPlan[trip._id]
                              ? trip.previousAIResponse
                              : trip.aiResponse
                            }
                          </div>
                        </div>
                      )}

                      {/* Plan content — collapsed preview */}
                      {selectedTrip?._id !== trip._id && (
                        <div className={`rounded-xl p-4 border ${
                          trip.isReplanned && !showingOldPlan[trip._id]
                            ? 'bg-amber-50/80 border-amber-200'
                            : 'bg-sky-50/80 border-sky-100'
                        }`}>
                          <div className="text-sm text-sky-600 line-clamp-3">
                            {trip.isReplanned && showingOldPlan[trip._id]
                              ? trip.previousAIResponse?.substring(0, 150)
                              : trip.aiResponse?.substring(0, 150)
                            }...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && userId && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-600 font-semibold">Error Loading Watchlist</h3>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchWatchlist}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}