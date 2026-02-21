import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, Loader2, Globe, Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AI_BASE_URL = "http://localhost:8000";
const USER_BASE_URL = "http://localhost:5000";

// ✅ Persist state across navigation using sessionStorage
const loadSavedState = () => {
  try {
    const saved = sessionStorage.getItem('tripGenieState');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const saveState = (state) => {
  try {
    sessionStorage.setItem('tripGenieState', JSON.stringify(state));
  } catch {}
};

export default function TripInputForm() {
  const navigate = useNavigate();
  const savedState = loadSavedState();

  const [formData, setFormData] = useState(savedState?.formData || {
    destination: '',
    startDate: '',
    endDate: '',
    guests: 1,
    budget: 'mid-range',
    tripType: 'leisure'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(savedState?.response || null);
  const [error, setError] = useState(null);
  const [isSavingToWatchlist, setIsSavingToWatchlist] = useState(false);
  const [savedToWatchlist, setSavedToWatchlist] = useState(savedState?.savedToWatchlist || false);
  const [currentTripData, setCurrentTripData] = useState(savedState?.currentTripData || null);

  const userId = localStorage.getItem('userId');

  // ✅ Persist state whenever it changes
  useEffect(() => {
    saveState({ formData, response, savedToWatchlist, currentTripData });
  }, [formData, response, savedToWatchlist, currentTripData]);

  // ✅ Format display date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Reset everything for a new prompt
  const handleNewPrompt = () => {
    setFormData({
      destination: '',
      startDate: '',
      endDate: '',
      guests: 1,
      budget: 'mid-range',
      tripType: 'leisure'
    });
    setResponse(null);
    setError(null);
    setSavedToWatchlist(false);
    setCurrentTripData(null);
    sessionStorage.removeItem('tripGenieState');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.destination.trim() || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSavedToWatchlist(false);

    const question = `Plan a trip to ${formData.destination} from ${formData.startDate} to ${formData.endDate} for ${formData.guests} guest${formData.guests > 1 ? 's' : ''} with a ${formData.budget} budget. Trip type: ${formData.tripType}`;

    try {
      const res = await fetch(`${AI_BASE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const data = await res.json();
        const answer = data.answer || "No answer returned.";
        const tripData = { ...formData, aiResponse: answer };
        setCurrentTripData(tripData);
        setResponse({ answer, startDate: formData.startDate, endDate: formData.endDate });
      } else {
        const errorText = await res.text();
        setError(`Bot failed to respond: ${errorText}`);
      }
    } catch (err) {
      setError(`The response failed due to ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!userId) {
      setError('Please log in to save trips to your watchlist');
      return;
    }
    if (!currentTripData) {
      setError('No trip data to save');
      return;
    }

    setIsSavingToWatchlist(true);
    setError(null);

    try {
      const res = await fetch(`${USER_BASE_URL}/api/watchlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...currentTripData }),
      });

      if (res.ok) {
        setSavedToWatchlist(true);
      } else {
        const errorData = await res.json();
        setError(`Failed to add to watchlist: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError(`Failed to save to watchlist: ${err.message}`);
    } finally {
      setIsSavingToWatchlist(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 flex flex-col items-center p-6">

      {/* ✅ Fixed Back Button — properly anchored top left */}
      <div className="w-full max-w-7xl mb-6 mt-2">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-800 font-semibold transition-all group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Where to next?
        </h1>
        <p className="text-sky-700 text-lg font-medium">Plan your perfect getaway with TripGenie ✨</p>
      </div>

      {/* Main Search Bar */}
      <div className="w-full max-w-7xl mb-6">
        <div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/60 hover:shadow-cyan-200/50 transition-shadow duration-300">

          <div className="flex flex-row items-stretch gap-3">

            {/* Destination */}
            <div className="relative group flex-[1.8] min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-5 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-5 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Where are you going?"
                  className="w-full bg-transparent border-none outline-none text-sky-900 placeholder-sky-400 font-semibold text-base pt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="relative flex-1 min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-4 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-4 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Check In
                </label>
                {/* ✅ lang attribute forces DD/MM/YYYY in supported browsers */}
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  lang="en-GB"
                  className="w-full bg-transparent border-none outline-none text-sky-900 font-semibold text-sm pt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="relative flex-1 min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-4 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-4 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Check Out
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  lang="en-GB"
                  className="w-full bg-transparent border-none outline-none text-sky-900 font-semibold text-sm pt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative flex-1 min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-4 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-4 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Guests
                </label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="20"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sky-900 font-semibold text-base pt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="relative flex-1 min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-4 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-4 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Budget
                </label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sky-900 font-semibold text-sm pt-1 appearance-none cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="affordable">Affordable</option>
                  <option value="mid-range">Mid-Range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            {/* Trip Type */}
            <div className="relative flex-[1.2] min-w-35">
              <div className="bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-sm hover:from-sky-100/80 hover:to-cyan-100/80 transition-all rounded-2xl px-4 pt-7 pb-3 h-20 border border-sky-100/50 shadow-sm hover:shadow-md">
                <label className="absolute top-2.5 left-4 text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Vibe
                </label>
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none outline-none text-sky-900 font-semibold text-sm pt-1 appearance-none cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="leisure">Leisure</option>
                  <option value="adventure">Adventure</option>
                  <option value="cultural">Cultural</option>
                  <option value="family">Family</option>
                  <option value="romantic">Romantic</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.destination.trim() || !formData.startDate || !formData.endDate}
              className="w-20 h-20 bg-gradient-to-br from-sky-500 via-cyan-500 to-blue-500 hover:from-sky-600 hover:via-cyan-600 hover:to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-cyan-400/50 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Search className="w-7 h-7" />
              )}
            </button>

          </div>

          <p className="text-center text-xs text-sky-600/70 mt-4 font-medium">
            {isLoading ? '🤖 TripGenie is planning your trip...' : '✨ AI-powered itinerary will be generated instantly'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-7xl mb-6">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="w-full max-w-7xl pb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
            <div className="border-b border-sky-200 pb-4 mb-6 flex justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2 mb-2">
                  <Globe className="w-8 h-8 text-cyan-600" />
                  AI Travel Plan
                </h2>
                <div className="text-sm text-sky-700 space-y-1">
                  {/* ✅ Dates shown as DD/MM/YYYY */}
                  <p>
                    <strong>From:</strong> {formatDate(response.startDate)}
                    <span className="mx-2">→</span>
                    <strong>To:</strong> {formatDate(response.endDate)}
                  </p>
                  <p><strong>Created by:</strong> Trip Genie</p>
                </div>
              </div>

              {/* ✅ Action Buttons */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">

                {/* ✅ New Search Button */}
                <button
                  type="button"
                  onClick={handleNewPrompt}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow border border-sky-200 bg-white/60 text-sky-700 hover:bg-sky-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Search
                </button>

                {/* ✅ Add to Watchlist → Saved! → Go to Watchlist */}
                {userId && (
                  !savedToWatchlist ? (
                    <button
                      type="button"
                      onClick={handleAddToWatchlist}
                      disabled={isSavingToWatchlist}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:transform-none shadow-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingToWatchlist ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-5 h-5" />
                          Add to Watchlist
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-green-500 text-white shadow-lg">
                        <BookmarkCheck className="w-5 h-5" />
                        Saved!
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/watchlist')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                      >
                        Go to Watchlist
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="prose prose-sky max-w-none">
              <div className="whitespace-pre-wrap text-sky-900 leading-relaxed">
                {response.answer}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-sky-200">
              <p className="text-sm text-sky-600 italic">
                *This travel plan was generated by AI. Please verify all information, especially prices,
                operating hours, and travel requirements before your trip.*
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
}