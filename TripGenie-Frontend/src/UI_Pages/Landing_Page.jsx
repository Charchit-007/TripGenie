import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mountain, ChevronDown, 
  Zap, Shield, Bell, CheckCheck, X,
  Bookmark, Ticket, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications.js';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const HikerHero = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// --- SUB-COMPONENT: TREKKING CARD ---
const TrekkingCard = ({ item, index, currentIndex, total, onClickCenter, onInitiate }) => {
  let diff = index - currentIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  const isCenter = diff === 0;
  let styles = "translate-x-0 opacity-0 scale-50 pointer-events-none"; 

  if (isCenter) {
    styles = "translate-x-0 translate-y-20 opacity-100 scale-110 z-40 shadow-[0_40px_80px_rgba(0,0,0,0.8)] cursor-pointer";
  } else if (diff === -1) { 
    styles = "-translate-x-[85%] translate-y-0 opacity-90 scale-100 z-30 cursor-pointer";
  } else if (diff === 1) { 
    styles = "translate-x-[85%] translate-y-0 opacity-90 scale-100 z-30 cursor-pointer";
  } else if (diff === -2) { 
    styles = "-translate-x-[170%] -translate-y-16 opacity-70 scale-90 z-20 cursor-pointer";
  } else if (diff === 2) { 
    styles = "translate-x-[170%] -translate-y-16 opacity-70 scale-90 z-20 cursor-pointer";
  }

  return (
    <div 
      onClick={() => isCenter ? onInitiate(item) : onClickCenter(index)}
      className={`absolute transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-[300px] h-[440px] rounded-[3rem] overflow-hidden border-2 border-[#56B7DF]/40 ring-1 ring-white/10 ${styles}`}
    >
      <img src={item.image} className="absolute inset-0 w-full h-full object-cover" alt={item.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D26] via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-10 left-8 right-8 text-left">
        <h3 className="text-white text-xl font-bold tracking-tight">{item.title}</h3>
        <p className="text-white/50 text-[10px] mt-1 font-bold uppercase tracking-widest">{item.location}</p>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">
            🌤️ {item.bestTime}
          </span>
          <span className="flex items-center gap-1 bg-[#56B7DF]/20 backdrop-blur-sm border border-[#56B7DF]/30 rounded-full px-3 py-1 text-[10px] font-black text-[#56B7DF] uppercase tracking-wider">
            {item.vibeIcon} {item.vibe}
          </span>
        </div>
      </div>
    </div>
  );
};

const severityConfig = {
  critical: { dot: 'bg-red-500', border: 'border-l-2 border-red-500', bg: 'bg-red-500/10', label: '🔴' },
  warning:  { dot: 'bg-yellow-400', border: 'border-l-2 border-yellow-400', bg: 'bg-yellow-400/10', label: '🟡' },
  info:     { dot: 'bg-[#56B7DF]', border: 'border-l-2 border-[#56B7DF]', bg: 'bg-[#56B7DF]/10', label: '🔵' },
};

const formatTime = (date) => new Date(date).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const getSeason = () => {
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4)  return 'spring';
  if (month >= 5 && month <= 7)  return 'summer';
  return 'autumn';
};

const seasonDestinations = {
  winter: [
    { title: "Maldives",    location: "Indian Ocean",  bestTime: "Nov – Apr", vibe: "Beach",     vibeIcon: "🏖️", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8", prompt: "Plan a romantic beach trip to the Maldives." },
    { title: "Rajasthan",   location: "India",         bestTime: "Oct – Mar", vibe: "Cultural",  vibeIcon: "🕌", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245", prompt: "Plan a cultural trip to Rajasthan, India." },
    { title: "Dubai",       location: "UAE",           bestTime: "Nov – Mar", vibe: "Luxury",    vibeIcon: "✨", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c", prompt: "Plan a luxury trip to Dubai, UAE." },
    { title: "Bangkok",     location: "Thailand",      bestTime: "Nov – Feb", vibe: "Leisure",   vibeIcon: "🌴", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365", prompt: "Plan a leisure trip to Bangkok, Thailand." },
    { title: "Queenstown",  location: "New Zealand",   bestTime: "Dec – Feb", vibe: "Adventure", vibeIcon: "🏔️", image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad", prompt: "Plan an adventure trip to Queenstown, New Zealand." },
  ],
  spring: [
    { title: "Kyoto",       location: "Japan",         bestTime: "Mar – May", vibe: "Cultural",  vibeIcon: "🌸", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", prompt: "Plan a cultural trip to Kyoto, Japan during cherry blossom season." },
    { title: "Santorini",   location: "Greece",        bestTime: "Apr – Jun", vibe: "Romantic",  vibeIcon: "💙", image: "https://images.unsplash.com/photo-1469796466635-455ede028aca", prompt: "Plan a romantic trip to Santorini, Greece." },
    { title: "Amsterdam",   location: "Netherlands",   bestTime: "Mar – May", vibe: "Leisure",   vibeIcon: "🌷", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4", prompt: "Plan a trip to Amsterdam, Netherlands during tulip season." },
    { title: "Tuscany",     location: "Italy",         bestTime: "Apr – Jun", vibe: "Leisure",   vibeIcon: "🍷", image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca", prompt: "Plan a leisure trip through Tuscany, Italy." },
    { title: "Barcelona",   location: "Spain",         bestTime: "May – Jun", vibe: "Cultural",  vibeIcon: "🎨", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4", prompt: "Plan a cultural trip to Barcelona, Spain." },
  ],
  summer: [
    { title: "Bali",         location: "Indonesia",    bestTime: "May – Sep", vibe: "Beach",     vibeIcon: "🏖️", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4", prompt: "Plan a leisure trip to Bali, Indonesia." },
    { title: "Amalfi Coast", location: "Italy",        bestTime: "Jun – Aug", vibe: "Scenic",    vibeIcon: "🌊", image: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7", prompt: "Plan a scenic trip along the Amalfi Coast, Italy." },
    { title: "Dubrovnik",    location: "Croatia",      bestTime: "Jun – Sep", vibe: "Leisure",   vibeIcon: "⛵", image: "https://images.unsplash.com/photo-1555990538-c62f8f9c7d9a", prompt: "Plan a trip to Dubrovnik, Croatia." },
    { title: "Swiss Alps",   location: "Switzerland",  bestTime: "Jun – Sep", vibe: "Adventure", vibeIcon: "🏔️", image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e", prompt: "Plan a summer trip to the Swiss Alps, Switzerland." },
    { title: "Iceland",      location: "Europe",       bestTime: "Jun – Aug", vibe: "Adventure", vibeIcon: "🌋", image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae", prompt: "Plan a road trip across Iceland in summer." },
  ],
  autumn: [
    { title: "Kyoto",       location: "Japan",         bestTime: "Oct – Nov", vibe: "Cultural",  vibeIcon: "🍁", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", prompt: "Plan a trip to Kyoto, Japan during autumn foliage season." },
    { title: "New England", location: "USA",           bestTime: "Sep – Nov", vibe: "Scenic",    vibeIcon: "🍂", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d", prompt: "Plan a road trip through New England, USA during fall foliage." },
    { title: "Prague",      location: "Czech Republic",bestTime: "Sep – Nov", vibe: "Cultural",  vibeIcon: "🏰", image: "https://images.unsplash.com/photo-1541849546-216549ae216d", prompt: "Plan a cultural trip to Prague, Czech Republic." },
    { title: "Inca Trail",  location: "Peru",          bestTime: "Apr – Oct", vibe: "Adventure", vibeIcon: "🥾", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377", prompt: "Plan a guided trek along the Inca Trail, Peru." },
    { title: "Istanbul",    location: "Turkey",        bestTime: "Sep – Nov", vibe: "Cultural",  vibeIcon: "🕌", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200", prompt: "Plan a cultural trip to Istanbul, Turkey." },
  ],
};

// ══════════════════════════════════════════════════════════════
// USER DROPDOWN COMPONENT
// ══════════════════════════════════════════════════════════════
function UserDropdown({ onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const userName  = localStorage.getItem('userName')  || 'Traveller';
  const userEmail = localStorage.getItem('userEmail') || '';

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const menuItems = [
    {
      icon: <Bookmark size={15} />,
      label: 'My Watchlist',
      sub: 'Saved trip plans',
      action: () => { navigate('/watchlist'); setOpen(false); },
    },
    {
      icon: <Ticket size={15} />,
      label: 'Booked Tickets',
      sub: 'View flight bookings',
      action: () => { navigate('/bookings'); setOpen(false); },
    },
    {
      icon: <Settings size={15} />,
      label: 'Settings',
      sub: 'Preferences & account',
      action: () => { navigate('/settings'); setOpen(false); },
    },
  ];

  return (
    <div className="relative" ref={ref}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 pl-3 pr-4 py-2.5 rounded-full transition-all hover:bg-white/15 hover:border-[#56B7DF]/40 active:scale-95 cursor-pointer group"
      >
        {/* User icon circle */}
        <div className="w-7 h-7 rounded-full bg-[#56B7DF]/20 border border-[#56B7DF]/40 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-[#56B7DF]" />
        </div>
        {/* Name */}
        <span className="text-white text-[11px] font-black uppercase tracking-widest max-w-[90px] truncate">
          {userName}
        </span>
        {/* Chevron */}
        <ChevronDown
          size={13}
          className={`text-white/50 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Dropdown card ── */}
      <div className={`
        absolute right-0 mt-3 w-72
        bg-[#0B1D26]/95 backdrop-blur-2xl
        border border-white/10 rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        overflow-hidden
        transition-all duration-300 origin-top-right
        ${open
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }
      `}>

        {/* Profile header */}
        <div className="px-5 py-4 border-b border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(86,183,223,0.08), transparent)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#56B7DF]/15 border border-[#56B7DF]/30 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-[#56B7DF]" />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{userName}</p>
              <p className="text-white/40 text-[10px] font-medium truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-2">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full flex items-center gap-3.5 px-5 py-3 text-left
                hover:bg-white/5 transition-all group cursor-pointer"
            >
              {/* Icon box */}
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8
                flex items-center justify-center flex-shrink-0
                group-hover:bg-[#56B7DF]/15 group-hover:border-[#56B7DF]/30
                transition-all">
                <span className="text-white/50 group-hover:text-[#56B7DF] transition-colors">
                  {item.icon}
                </span>
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white/85 text-[12px] font-semibold group-hover:text-white transition-colors">
                  {item.label}
                </p>
                <p className="text-white/35 text-[10px] font-medium">
                  {item.sub}
                </p>
              </div>
              {/* Arrow */}
              <ChevronRight size={13}
                className="text-white/20 group-hover:text-[#56B7DF]/60 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-white/8" />

        {/* Logout */}
        <div className="py-2">
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            className="w-full flex items-center gap-3.5 px-5 py-3 text-left
              hover:bg-red-500/8 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8
              flex items-center justify-center flex-shrink-0
              group-hover:bg-red-500/15 group-hover:border-red-500/30 transition-all">
              <LogOut size={15} className="text-white/50 group-hover:text-red-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-white/85 text-[12px] font-semibold group-hover:text-red-400 transition-colors">
                Logout
              </p>
              <p className="text-white/35 text-[10px] font-medium">Sign out of TripGenie</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marqueeOffers, setMarqueeOffers] = useState([
    { type: 'promo', text: 'PROMO: Bali flights -20%' },
    { type: 'alert', text: 'Swiss Alps: Heavy Snowfall' },
    { type: 'alert', text: 'Tokyo: Peak season alert' }
  ]);

  const currentSeason  = getSeason();
  const destinations   = seasonDestinations[currentSeason];

  useEffect(() => {
    const fetchWeatherAlerts = async () => {
      const popularCities = [
        { name: 'Paris',    lat: 48.8566, lon: 2.3522  },
        { name: 'Dubai',    lat: 25.2048, lon: 55.2708 },
        { name: 'New York', lat: 40.7128, lon: -74.006 }
      ];
      const weatherAlerts = [];
      for (const city of popularCities) {
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m&timezone=auto`);
          const data = await response.json();
          const temp = Math.round(data.current.temperature_2m);
          if (temp > 35) weatherAlerts.push({ type: 'alert', text: `${city.name}: Extreme Heat (${temp}°C)` });
        } catch (e) { console.error(e); }
      }
      setMarqueeOffers(prev => [...prev, ...weatherAlerts]);
    };
    fetchWeatherAlerts();
  }, []);

  const handleProtectedNavigate = (path, state = {}) => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else navigate(path, { state });
  };

  const handleCardClick = (item) => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else {
      sessionStorage.removeItem('tripGenieState');
      navigate('/chat', { state: { destination: item.title } });
    }
  };

  const [tripWidth, setTripWidth] = useState(500);
  useEffect(() => {
    const updateWidth = () => {
      const el = document.getElementById("trip-text");
      if (el) setTripWidth(el.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, isLoading } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.type === 'replan') navigate('/watchlist');
  };

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50)       setCurrentIndex((prev) => (prev + 1) % destinations.length);
    else if (diff < -50) setCurrentIndex((prev) => prev === 0 ? destinations.length - 1 : prev - 1);
    touchStartX.current = null;
  };

  const [flippedIndex, setFlippedIndex] = useState(null);
  const handleFlip = (index) => setFlippedIndex(flippedIndex === index ? null : index);

  const seasonLabels = {
    winter: '❄️ Winter Picks',
    spring: '🌸 Spring Picks',
    summer: '☀️ Summer Picks',
    autumn: '🍂 Autumn Picks',
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1D26] text-white font-sans overflow-x-hidden scroll-smooth">
      
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 px-10 pointer-events-none">
        <div className="flex items-center justify-center bg-[#0B1D26]/40 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-2.5 pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-1">
            {['Home', 'About', 'Gallery', 'Feature', 'Contact Us'].map((item) => (
              <button key={item}
                onClick={() => {
                  const idMap = { 'Home': 'hero', 'About': 'popular-destinations', 'Gallery': 'budget', 'Feature': 'map', 'Contact Us': 'footer' };
                  document.getElementById(idMap[item])?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-1 text-[14px] font-black uppercase tracking-[0.15em] text-white hover:text-[#56B7DF] transition-all cursor-pointer"
              >{item}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="relative h-screen w-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HikerHero} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D26]/70 via-transparent to-[#0B1D26]" />
        </div>

        {/* TOP BAR */}
        <div className="relative z-50 w-full max-w-7xl mx-auto px-10 pt-10 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Mountain className="text-white w-8 h-8" />
            <span className="text-white font-black tracking-[0.4em] text-xs uppercase">Trip Genie</span>
          </div>

          {/* Right side — auth controls */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-3 bg-[#56B7DF] px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-[0_4px_20px_rgba(86,183,223,0.15)] hover:bg-[#68c6eb] transition-all active:scale-95 text-[#0B1D26]">
                <User size={16} /> Sign In
              </button>
            ) : (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notificationRef}>
                  <div onClick={() => setShowNotifications(!showNotifications)}
                    className="relative cursor-pointer p-2 rounded-full hover:bg-white/10 transition-all">
                    <Bell size={22} className="text-white hover:text-[#56B7DF] transition-all" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#56B7DF] text-[9px] flex items-center justify-center rounded-full text-[#0B1D26] font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Notification dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-96 bg-[#0B1D26] border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <h3 className="text-white font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="flex items-center gap-1.5 text-[#56B7DF] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                            <CheckCheck size={12} /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {isLoading ? (
                          <div className="p-6 text-center text-white/40 text-xs">Loading...</div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell size={24} className="text-white/20 mx-auto mb-2" />
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map(n => {
                            const config = severityConfig[n.severity] || severityConfig.info;
                            return (
                              <div key={n._id} onClick={() => handleNotificationClick(n)}
                                className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all ${config.border} ${config.bg} ${!n.isRead ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-xs font-bold">📍 {n.destination}</span>
                                    {n.type === 'replan' && (
                                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Replanned</span>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                                  <p className="text-white/25 text-[10px] mt-1.5 font-bold uppercase tracking-widest">{formatTime(n.createdAt)}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                  className="text-white/20 hover:text-red-400 transition-all flex-shrink-0 mt-0.5">
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-white/10">
                          <button onClick={() => { navigate('/watchlist'); setShowNotifications(false); }}
                            className="w-full text-center text-[10px] font-black uppercase tracking-widest text-[#56B7DF] hover:text-white transition-all">
                            View Watchlist →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── User dropdown ── */}
                <UserDropdown onLogout={handleLogout} />
              </>
            )}
          </div>
        </div>

        {/* HERO TEXT */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[#56B7DF] text-[10px] font-black uppercase tracking-[0.8em] mb-6">Agentic Travel Intelligence</span>
          <h1 className="text-7xl md:text-[130px] font-black tracking-tighter uppercase leading-[0.85]">
            Find Your <br />
            <span id="trip-text" className="inline-block text-transparent" style={{ WebkitTextStroke: '2px white' }}>Trip</span>
          </h1>
          <button onClick={() => document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-12 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md animate-bounce cursor-pointer">
            <ChevronDown size={20} className="text-[#56B7DF]" />
          </button>
        </div>

        {/* TRY TRIPGENIE BUTTON */}
        <div className="relative z-20 w-full flex justify-center pb-20">
          <button onClick={() => handleProtectedNavigate('/chat')} style={{ width: tripWidth }}
            className="h-[74px] rounded-full flex items-center justify-center gap-3 text-white text-[16px] font-medium tracking-wide bg-gradient-to-r from-[#0E2F3A] to-[#124453] backdrop-blur-xl border border-[#1F5B6E] shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
            Try TripGenie <span className="text-lg">↗</span>
          </button>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section id="popular-destinations" className="bg-[#0B1D26] pt-32 pb-48">
        <div className="max-w-[1400px] mx-auto px-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
              <span className="text-[#56B7DF] text-xs font-black uppercase tracking-[0.5em]">{seasonLabels[currentSeason]}</span>
              <h2 className="text-8xl font-black mt-5 text-white tracking-tighter uppercase leading-none">Popular <br /> Destinations</h2>
            </div>
          </div>
          <div className="relative flex items-center justify-center h-[500px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {destinations.map((item, index) => (
              <TrekkingCard 
                key={index} item={item} index={index} currentIndex={currentIndex}
                total={destinations.length} onClickCenter={setCurrentIndex}
                onInitiate={handleCardClick}
              />
            ))}
          </div>
          {!isAuthenticated && (
            <p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest mt-8">
              <button onClick={() => navigate('/login')} className="text-[#56B7DF] hover:underline">Sign in</button> to explore destinations
            </p>
          )}
        </div>
      </section>

      {/* BUDGET OPTIMIZATION */}
      <section id="budget" className="py-32 bg-[#0B1D26]">
        <div className="max-w-7xl mx-auto px-10">
          <div className="mb-20 text-center">
            <span className="text-[#56B7DF] text-[10px] font-black uppercase tracking-[0.6em]">Financial Agent</span>
            <h2 className="text-5xl font-bold mt-4 text-white tracking-tighter">Budget Optimization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { tier: "Backpacker", price: "800",   score: "98%", budgetValue: "affordable", features: ["Hostels", "Local Transport", "Street Food"] },
              { tier: "Explorer",   price: "2,400", score: "94%", budgetValue: "mid-range",  features: ["Boutique Hotels", "Private Transfers", "Guided Tours"] },
              { tier: "Elite",      price: "5,000+",score: "89%", budgetValue: "luxury",     features: ["Luxury Resorts", "Helicopters", "Personal Concierge"] }
            ].map((plan, i) => (
              <div key={i} className="relative h-[420px] perspective">
                <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flippedIndex === i ? "rotate-y-180" : ""}`}>
                  <div className="absolute inset-0 backface-hidden">
                    <div className="group bg-white/5 border border-white/10 p-10 rounded-[3rem] h-full flex flex-col justify-between transition-all hover:border-[#56B7DF]/50">
                      <div>
                        <div className="mb-6 inline-flex px-3 py-1 rounded-full border border-[#56B7DF]/30 bg-[#56B7DF]/10 items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#56B7DF] animate-pulse" />
                          <span className="text-[9px] font-black text-[#56B7DF] uppercase tracking-widest">AI Match: {plan.score}</span>
                        </div>
                        <div className="mb-6 text-white">
                          <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                          <span className="block text-[11px] font-bold text-white uppercase mt-2 tracking-widest opacity-90">Estimated Total</span>
                        </div>
                        <div className="space-y-4 mb-10">
                          {plan.features.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-white/50 group-hover:text-white/80 transition-colors">
                              <Zap size={14} className="text-[#56B7DF]/60" />
                              <span className="text-[14px] font-bold tracking-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const token = localStorage.getItem('token');
                          if (!token) navigate('/login');
                          else handleFlip(i);
                        }}
                        className="relative w-full py-4 rounded-2xl bg-white/5 border border-white/10 group/btn overflow-hidden transition-all flex items-center justify-center"
                      >
                        <div className="absolute inset-0 bg-[#56B7DF] translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300 cursor-pointer" />
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em] group-hover/btn:text-[#0B1D26] cursor-pointer">Analyze Plan</span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] h-full flex flex-col overflow-hidden">
                      {/* Back card header */}
                      <div className="px-7 pt-7 pb-4 border-b border-white/8">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#56B7DF]">
                              {plan.tier} Destinations
                            </p>
                            <h3 className="text-white text-base font-bold mt-0.5">
                              Where to go on ${plan.price}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleFlip(i)}
                            className="text-white/30 hover:text-[#56B7DF] transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
                          >
                            ← Back
                          </button>
                        </div>
                      </div>

                      {/* Scrollable destination list */}
                      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
                        style={{ scrollbarWidth: 'none' }}>
                        {destinations.map((dest, di) => (
                          <button
                            key={di}
                            onClick={() => {
                              sessionStorage.removeItem('tripGenieState');
                              navigate('/chat', {
                                state: {
                                  destination: dest.title,
                                  budget: plan.budgetValue,
                                }
                              });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all group/dest cursor-pointer"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(86,183,223,0.10)';
                              e.currentTarget.style.borderColor = 'rgba(86,183,223,0.30)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                            }}
                          >
                            {/* Vibe icon */}
                            <span className="text-base flex-shrink-0">{dest.vibeIcon}</span>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-bold truncate leading-tight">
                                {dest.title}
                              </p>
                              <p className="text-white/40 text-[10px] font-medium truncate">
                                {dest.location} · {dest.vibe}
                              </p>
                            </div>
                            {/* Arrow */}
                            <span className="text-[#56B7DF]/40 text-xs flex-shrink-0
                              group-hover/dest:text-[#56B7DF] transition-colors">
                              ↗
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Hint */}
                      <div className="px-7 py-4 border-t border-white/8">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/25 text-center">
                          Tap a destination to plan with AI
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section id="map" className="py-32 bg-[#0B1D26] overflow-hidden">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-20">
            <span className="text-[#56B7DF] text-[10px] font-black uppercase tracking-[0.6em]">Global Coverage</span>
            <h2 className="text-5xl md:text-6xl font-bold mt-5 text-white tracking-tighter leading-tight">Discover the world <br /> through our eyes</h2>
          </div>
          <section className="bg-[#0B1D26] py-10">
            <style>{`
              @keyframes marquee-ltr { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
              .animate-marquee-readable { display: flex; width: max-content; animation: marquee-ltr 45s linear infinite; }
            `}</style>
            <div className="max-w-7xl mx-auto px-10">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex items-center h-16 relative">
                <div className="bg-[#56B7DF] h-full px-8 flex items-center gap-3 z-30 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B1D26]">Live Intel</span>
                </div>
                <div className="flex-1 overflow-hidden h-full flex items-center">
                  <div className="animate-marquee-readable items-center">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="flex items-center">
                        {marqueeOffers.map((offer, index) => (
                          <span key={`${i}-${index}`} className={`text-[11px] font-bold uppercase tracking-[0.3em] px-20 whitespace-nowrap flex items-center gap-4 ${offer.type === "promo" ? "text-[#56B7DF]" : "text-white/80"}`}>
                            {offer.type === "alert" && <div className="w-1.5 h-1.5 rounded-full bg-[#56B7DF]" />}
                            {offer.text}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="relative w-full aspect-[21/9] rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl">
            <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={false} zoomControl={false} className="w-full h-full z-10">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[40.7128, -74.006]}><Popup>New York</Popup></Marker>
              <Marker position={[48.8566, 2.3522]}><Popup>Paris</Popup></Marker>
              <Marker position={[51.5072, -0.1276]}><Popup>London</Popup></Marker>
              <Marker position={[25.2048, 55.2708]}><Popup>Dubai</Popup></Marker>
              <Marker position={[19.076, 72.8777]}><Popup>Mumbai</Popup></Marker>
              <Marker position={[35.6762, 139.6503]}><Popup>Tokyo</Popup></Marker>
              <Marker position={[-33.8688, 151.2093]}><Popup>Sydney</Popup></Marker>
              <Marker position={[-22.9068, -43.1729]}><Popup>Rio de Janeiro</Popup></Marker>
              <Marker position={[30.0444, 31.2357]}><Popup>Cairo</Popup></Marker>
              <Marker position={[1.3521, 103.8198]}><Popup>Singapore</Popup></Marker>
            </MapContainer>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="w-full bg-[#0B1D26] pt-20 pb-20">
        <div className="bg-[#08151B] py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
            <span>© 2026 Trip Genie AI Protocol</span>
            <div className="flex items-center gap-3">
              <Shield size={12} />
              <span>Encrypted Intelligence Protocol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}