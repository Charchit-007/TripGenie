import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, DollarSign, Sparkles, Loader2, Globe, Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, RotateCcw,ChevronDown,Check, Palmtree, Plane } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NetworkErrorPage from '../components/NetworkErrorPage';

const AI_BASE_URL = "http://localhost:8000";
const USER_BASE_URL = "http://localhost:5000";

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
  const location = useLocation();

  const prefilledDestination = location.state?.destination || '';
  const prefilledBudget      = location.state?.budget      || 'mid-range';

  useEffect(() => {
    if (!prefilledDestination && !location.state?.budget) {
      sessionStorage.removeItem('tripGenieState');
    }
  }, []);

  const [formData, setFormData] = useState({
    destination: prefilledDestination,
    startDate: '',
    endDate: '',
    guests: 1,
    budget: prefilledBudget,
    tripType: 'leisure'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [isSavingToWatchlist, setIsSavingToWatchlist] = useState(false);
  const [savedToWatchlist, setSavedToWatchlist] = useState(false);
  const [currentTripData, setCurrentTripData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    saveState({ formData, response, savedToWatchlist, currentTripData });
  }, [formData, response, savedToWatchlist, currentTripData]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    setNetworkError(false);
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
    setNetworkError(false);
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
        // FastAPI returned an error (Groq failure, tool error, etc.) → show error page
        setNetworkError(true);
      }
    } catch (err) {
      setNetworkError(true);
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
      const res = await fetch(`${USER_BASE_URL}/api/trips`, {
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

  const fieldStyle = {
    background: 'rgba(86,183,223,0.09)',
    border: '1px solid rgba(86,183,223,0.22)',
  };

  const fieldStylePrefilled = {
    background: 'rgba(86,183,223,0.18)',
    border: '1px solid rgba(86,183,223,0.45)',
  };

  const handleBookFlights = () => {
    if (!currentTripData) return;
    navigate('/flights', { state: { trip: currentTripData } });
  };

  if (networkError) {
    return (
      <NetworkErrorPage
        onRetry={() => {
          setNetworkError(false);
          handleSubmit({ preventDefault: () => {} });
        }}
        onBack={() => {
          setNetworkError(false);
          navigate('/home');
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-6 relative overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)' }}
    >

      {/* Background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.10) 0%, transparent 65%)' }} />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.07) 0%, transparent 65%)' }} />

      {/* Top Bar */}
      <div className="flex justify-between items-center w-full max-w-7xl mb-6 mt-2">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 font-semibold transition-all group w-fit cursor-pointer"
          style={{ color: '#56B7DF' }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <button
          type="button"
          onClick={() => navigate('/watchlist')}
          className="flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 w-fit cursor-pointer text-white"
          style={{
            background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
            boxShadow: '0 4px 15px rgba(86,183,223,0.35)'
          }}
        >
          Watchlist
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{
            background: 'linear-gradient(to right, #56B7DF, #38bdf8, #7dd3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Where to next?
        </h1>
        {prefilledDestination ? (
          <p className="text-lg font-medium" style={{ color: 'rgba(86,183,223,0.85)' }}>
            Planning a trip to <span className="font-bold" style={{ color: '#56B7DF' }}>{prefilledDestination}</span>
            {location.state?.budget && (
              <> · <span className="font-bold capitalize" style={{ color: '#56B7DF' }}>{prefilledBudget}</span> budget</>
            )} ✨ Fill in the rest to get started!
          </p>
        ) : (
          <p className="text-lg font-medium" style={{ color: 'rgba(86,183,223,0.75)' }}>
            Plan your perfect getaway with TripGenie ✨
          </p>
        )}
      </div>

      {/* Main Search Bar */}
      <div className="w-full max-w-7xl mb-6">
        <div
          className="p-4 rounded-3xl shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(86,183,223,0.15)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        >
          <div className="flex flex-row items-stretch gap-3">

            {/* Destination */}
            <div className="relative group flex-[1.8] min-w-35">
              <div
                className="backdrop-blur-sm transition-all rounded-2xl px-5 pt-7 pb-3 h-20 shadow-sm"
                style={prefilledDestination ? fieldStylePrefilled : fieldStyle}
              >
                <label className="absolute top-2.5 left-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: '#56B7DF' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  Destination
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Where are you going?"
                  className="w-full bg-transparent border-none outline-none font-semibold text-base pt-1 placeholder:text-white/20"
                  style={{ color: 'white' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="relative flex-1 min-w-35">
              <div className="backdrop-blur-sm transition-all rounded-2xl px-4 pt-7 pb-3 h-20 shadow-sm" style={fieldStyle}>
                <label className="absolute top-2.5 left-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: '#56B7DF' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  Check In
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  lang="en-GB"
                  className="w-full bg-transparent border-none outline-none font-semibold text-sm pt-1 cursor-pointer"
                  style={{ color: 'white', colorScheme: 'dark' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="relative flex-1 min-w-35">
              <div className="backdrop-blur-sm transition-all rounded-2xl px-4 pt-7 pb-3 h-20 shadow-sm" style={fieldStyle}>
                <label className="absolute top-2.5 left-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: '#56B7DF' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  Check Out
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  lang="en-GB"
                  className="w-full bg-transparent border-none outline-none font-semibold text-sm pt-1 cursor-pointer"
                  style={{ color: 'white', colorScheme: 'dark' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Guests */}
            <div className="relative flex-1 min-w-35">
              <div className="backdrop-blur-sm transition-all rounded-2xl px-4 pt-7 pb-3 h-20 shadow-sm" style={fieldStyle}>
                <label className="absolute top-2.5 left-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: '#56B7DF' }}>
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
                  className="w-full bg-transparent border-none outline-none font-semibold text-base pt-1 cursor-pointer"
                  style={{ color: 'white' }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Budget Dropdown */}
            <div className="relative flex-1 min-w-35">
              <div
                onClick={() => !isLoading && setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
                className="backdrop-blur-sm transition-all rounded-2xl px-4 pt-7 pb-3 h-20 shadow-sm cursor-pointer relative"
                style={fieldStyle}
              >
                <label className="absolute top-2.5 left-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  style={{ color: '#56B7DF' }}>
                  <DollarSign className="w-3.5 h-3.5" />
                  Budget
                </label>
                <div className="w-full font-semibold text-sm pt-1 capitalize flex justify-between items-center"
                  style={{ color: 'white' }}>
                  {formData.budget ? formData.budget.replace('-', ' ') : 'Select Budget'}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${activeDropdown === 'budget' ? 'rotate-180' : ''}`}
                    style={{ color: '#56B7DF' }}
                  />
                </div>
              </div>

              {activeDropdown === 'budget' && (
                <div
                  className="absolute top-full left-0 w-full mt-2 p-2 rounded-2xl z-50"
                  style={{
                    background: 'rgba(13,32,48,0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(86,183,223,0.2)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'affordable', label: 'Budget', icon: '🪙' },
                      { value: 'mid-range', label: 'Mid', icon: '💵' },
                      { value: 'luxury', label: 'Luxury', icon: '💎' }
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          handleChange({ target: { name: 'budget', value: opt.value } });
                          setActiveDropdown(null);
                        }}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: formData.budget === opt.value ? 'rgba(86,183,223,0.2)' : 'transparent',
                          border: formData.budget === opt.value ? '1px solid rgba(86,183,223,0.4)' : '1px solid transparent',
                          color: formData.budget === opt.value ? '#56B7DF' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-center">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trip Type / Vibe Dropdown */}
            <div className="relative flex-[1.2] min-w-35">
              <div
                onClick={() => !isLoading && setActiveDropdown(activeDropdown === 'tripType' ? null : 'tripType')}
                className="backdrop-blur-sm transition-all rounded-2xl px-4 pt-7 pb-3 h-20 shadow-sm cursor-pointer relative"
                style={fieldStyle}
              >
                <label className="absolute top-2.5 left-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  style={{ color: '#56B7DF' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Vibe
                </label>
                <div className="w-full font-semibold text-sm pt-1 capitalize flex justify-between items-center"
                  style={{ color: 'white' }}>
                  {formData.tripType || 'Select Vibe'}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${activeDropdown === 'tripType' ? 'rotate-180' : ''}`}
                    style={{ color: '#56B7DF' }}
                  />
                </div>
              </div>

              {activeDropdown === 'tripType' && (
                <div
                  className="absolute top-full left-0 w-full mt-2 p-2 rounded-2xl z-50"
                  style={{
                    background: 'rgba(13,32,48,0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(86,183,223,0.2)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'leisure', label: 'Leisure', icon: '🌴' },
                      { value: 'adventure', label: 'Adventure', icon: '⛰️' },
                      { value: 'cultural', label: 'Cultural', icon: '🏛️' },
                      { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
                      { value: 'romantic', label: 'Romantic', icon: '❤️' },
                      { value: 'business', label: 'Business', icon: '💼' }
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          handleChange({ target: { name: 'tripType', value: opt.value } });
                          setActiveDropdown(null);
                        }}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: formData.tripType === opt.value ? 'rgba(86,183,223,0.2)' : 'transparent',
                          border: formData.tripType === opt.value ? '1px solid rgba(86,183,223,0.4)' : '1px solid transparent',
                          color: formData.tripType === opt.value ? '#56B7DF' : 'rgba(255,255,255,0.6)'
                        }}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-center">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.destination.trim() || !formData.startDate || !formData.endDate}
              className="w-20 h-20 text-white rounded-2xl flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #56B7DF, #38bdf8, #0ea5e9)',
                boxShadow: '0 8px 25px rgba(86,183,223,0.4)'
              }}
            >
              {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Search className="w-7 h-7" />}
            </button>

          </div>

          <p className="text-center text-xs mt-4 font-medium" style={{ color: 'rgba(86,183,223,0.55)' }}>
            {isLoading ? '🤖 TripGenie is planning your trip...' : '✨ AI-powered itinerary will be generated instantly'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="w-full max-w-7xl mb-6">
          <div className="rounded-2xl p-4 border"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }}>
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="w-full max-w-7xl pb-10">
          <div
            className="rounded-3xl shadow-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(86,183,223,0.15)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div className="border-b pb-4 mb-6 flex justify-between items-start gap-4"
              style={{ borderColor: 'rgba(86,183,223,0.15)' }}>
              <div>
                <h2
                  className="text-3xl font-bold flex items-center gap-2 mb-2"
                  style={{
                    background: 'linear-gradient(to right, #56B7DF, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  <Globe className="w-8 h-8 flex-shrink-0" style={{ color: '#56B7DF', WebkitTextFillColor: '#56B7DF' }} />
                  AI Travel Plan
                </h2>
                <div className="text-sm space-y-1" style={{ color: 'rgba(86,183,223,0.8)' }}>
                  <p>
                    <strong>From:</strong> {formatDate(response.startDate)}
                    <span className="mx-2">→</span>
                    <strong>To:</strong> {formatDate(response.endDate)}
                  </p>
                  <p><strong>Created by:</strong> Trip Genie</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">

                <button
                  type="button"
                  onClick={handleNewPrompt}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    background: 'rgba(86,183,223,0.1)',
                    border: '1px solid rgba(86,183,223,0.25)',
                    color: '#56B7DF'
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  New Search
                </button>

                {userId && (
                  !savedToWatchlist ? (
                    <button
                      type="button"
                      onClick={handleAddToWatchlist}
                      disabled={isSavingToWatchlist}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:transform-none text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
                        boxShadow: '0 6px 20px rgba(86,183,223,0.35)'
                      }}
                    >
                      {isSavingToWatchlist ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Saving...</>
                      ) : (
                        <><Bookmark className="w-5 h-5" />Add to Watchlist</>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                        style={{
                          background: 'linear-gradient(to right, #22c55e, #16a34a)',
                          boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
                        }}
                      >
                        <BookmarkCheck className="w-5 h-5" />Saved!
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/watchlist')}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 text-white cursor-pointer"
                        style={{
                          background: 'linear-gradient(to right, #a855f7, #6366f1)',
                          boxShadow: '0 6px 20px rgba(168,85,247,0.3)'
                        }}
                      >
                        Go to Watchlist <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={handleBookFlights}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 text-[#0B1D26] cursor-pointer mt-2"
                  style={{
                    background: 'linear-gradient(to right, #56B7DF, #38bdf8)',
                    boxShadow: '0 4px 15px rgba(86,183,223,0.3)'
                  }}
                >
                  <Plane className="w-5 h-5" />
                  Book Flights
                </button>

              </div>
            </div>

            <div className="prose prose-sky max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {response.answer}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(86,183,223,0.15)' }}>
              <p className="text-sm italic" style={{ color: 'rgba(86,183,223,0.5)' }}>
                *This travel plan was generated by AI. Please verify all information, especially prices,
                operating hours, and travel requirements before your trip.*
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}