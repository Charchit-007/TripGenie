import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, DollarSign, Sparkles, Trash2, Loader2, 
  Globe2, ArrowLeft, Heart, Clock, AlertCircle, Compass 
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
    if (!window.confirm('Are you sure you want to remove this trip from your watchlist?')) {
      return;
    }

    setDeletingId(itemId);

    try {
      const response = await fetch(`${BASE_URL}/api/watchlist/${userId}/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWatchlist(watchlist.filter(item => item._id !== itemId));
        if (selectedTrip?._id === itemId) {
          setSelectedTrip(null);
        }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBudgetIcon = (budget) => {
    const icons = {
      'affordable': '💰',
      'mid-range': '💰💰',
      'luxury': '💰💰💰'
    };
    return icons[budget] || '💰';
  };

  const getTripTypeEmoji = (tripType) => {
    const emojis = {
      'leisure': '🏖️',
      'adventure': '🏔️',
      'cultural': '🏛️',
      'family': '👨‍👩‍👧‍👦',
      'romantic': '💑',
      'business': '💼'
    };
    return emojis[tripType] || '✈️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading your travel dreams...</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-purple-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Neural network pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Compass className="w-10 h-10 text-orange-400" />
                  <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  My Watchlist
                </h1>
              </div>
              <p className="text-slate-400 text-lg">
                {userName ? `${userName}'s saved adventures` : 'Your saved travel plans'}
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                  {watchlist.length}
                </div>
                <div className="text-sm text-slate-400 mt-1">
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
              <Globe2 className="w-24 h-24 text-slate-700" />
              <Heart className="w-8 h-8 text-slate-600 absolute -top-2 -right-2" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No trips saved yet</h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start planning your dream vacation and save your favorite trips to your watchlist!
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-purple-700 transition-all transform hover:scale-105"
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
                className="group bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Card Header */}
                <div className="relative bg-gradient-to-br from-orange-500/20 to-purple-600/20 p-6 border-b border-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-orange-400" />
                        <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                          {trip.destination}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(trip.startDate)}
                        </span>
                        <span>→</span>
                        <span>{formatDate(trip.endDate)}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {getDaysBetween(trip.startDate, trip.endDate)} days trip
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(trip._id)}
                      disabled={deletingId === trip._id}
                      className="p-2 rounded-lg bg-slate-800/50 hover:bg-red-500/20 border border-slate-700/50 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Users className="w-3.5 h-3.5" />
                        Guests
                      </div>
                      <div className="text-white font-semibold">{trip.guests}</div>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        Budget
                      </div>
                      <div className="text-white font-semibold capitalize flex items-center gap-1">
                        <span className="text-sm">{getBudgetIcon(trip.budget)}</span>
                        {trip.budget}
                      </div>
                    </div>

                    <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Vibe
                      </div>
                      <div className="text-white font-semibold capitalize flex items-center gap-1">
                        <span className="text-sm">{getTripTypeEmoji(trip.tripType)}</span>
                        {trip.tripType}
                      </div>
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-800/50">
                    <Clock className="w-3.5 h-3.5" />
                    Added on {formatDate(trip.addedAt)}
                  </div>

                  {/* AI Response Preview */}
                  {trip.aiResponse && (
                    <div>
                      <button
                        onClick={() => setSelectedTrip(selectedTrip?._id === trip._id ? null : trip)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-purple-400">AI Travel Plan</span>
                          <span className="text-xs text-slate-500">
                            {selectedTrip?._id === trip._id ? 'Hide' : 'View'} details
                          </span>
                        </div>
                      </button>

                      {selectedTrip?._id === trip._id && (
                        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 max-h-96 overflow-y-auto">
                          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {trip.aiResponse}
                          </div>
                        </div>
                      )}

                      {selectedTrip?._id !== trip._id && (
                        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                          <div className="text-sm text-slate-400 line-clamp-3">
                            {trip.aiResponse.substring(0, 150)}...
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
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Watchlist</h3>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchWatchlist}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}