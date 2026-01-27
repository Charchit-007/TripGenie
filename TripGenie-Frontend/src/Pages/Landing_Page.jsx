import React, { useState, useEffect } from 'react';
import { 
  User, ArrowRight, ArrowLeft, Mountain, Tent, Users, Clock, ChevronDown, 
  Send, Zap, Shield 
} from 'lucide-react';

const HikerHero = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"; 

const FloatingStat = ({ icon, val, label }) => (
  <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-[2.5rem] w-[280px] h-[100px] flex items-center gap-5 hover:bg-white/10 transition-all shadow-2xl group ring-1 ring-white/5">
    <div className="text-[#FF66B2] bg-white/5 w-16 h-16 rounded-[22px] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 border border-white/10">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="text-left">
      <p className="text-2xl font-black tracking-tighter text-white leading-none">{val}</p>
      <p className="text-white/40 text-[9px] uppercase font-bold tracking-[0.2em] mt-2 leading-tight">{label}</p>
    </div>
  </div>
);

const TrekkingCard = ({ item, index, currentIndex, total, onClickCenter }) => {
  let diff = index - currentIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;

  const isCenter = diff === 0;
  let styles = "translate-x-0 opacity-0 scale-50 pointer-events-none"; 

  if (isCenter) {
    styles = "translate-x-0 translate-y-20 opacity-100 scale-110 z-40 shadow-[0_40px_80px_rgba(0,0,0,0.8)]";
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
      onClick={() => onClickCenter(index)}
      className={`absolute transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-[300px] h-[440px] rounded-[3rem] overflow-hidden border-2 border-[#FF66B2]/40 ring-1 ring-white/10 ${styles}`}
    >
      <img src={item.image} className="absolute inset-0 w-full h-full object-cover" alt={item.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D26] via-transparent to-transparent opacity-90" />
      <div className="absolute bottom-10 left-8 right-8 text-left">
        <h3 className="text-white text-xl font-bold tracking-tight">{item.title}</h3>
        <p className="text-white/50 text-[10px] mt-1 font-bold uppercase tracking-widest">{item.location}</p>
        <div className="flex items-center gap-2 mt-5 text-white/60">
          <Clock size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{item.duration}</span>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marqueeOffers, setMarqueeOffers] = useState([
    { type: 'promo', text: 'PROMO: Bali flights -20%' },
    { type: 'alert', text: 'Swiss Alps: Heavy Snowfall' },
    { type: 'alert', text: 'Tokyo: Peak season alert' }
  ]);

  const destinations = [
    { title: "K2 Base Camp", location: "Pakistan", duration: "3 Weeks", image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833" },
    { title: "Annapurna", location: "Nepal", duration: "12 Days", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa" },
    { title: "Everest Camp", location: "Nepal", duration: "2 Weeks", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    { title: "Markha Valley", location: "Ladakh", duration: "1 Week", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470" },
    { title: "Inca Trail", location: "Peru", duration: "10 Days", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377" },
  ];

  // Fetch weather alerts for popular destinations
  useEffect(() => {
    const fetchWeatherAlerts = async () => {
      const popularCities = [
        { name: 'Paris', lat: 48.8566, lon: 2.3522 },
        { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
        { name: 'New York', lat: 40.7128, lon: -74.0060 },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
        { name: 'Singapore', lat: 1.3521, lon: 103.8198 }
      ];
      
      const weatherAlerts = [];
      
      for (const city of popularCities) {
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation,weather_code&timezone=auto`
          );
          const data = await response.json();
          
          const temp = Math.round(data.current.temperature_2m);
          const weatherCode = data.current.weather_code;
          const precipitation = data.current.precipitation;
          
          // Generate alerts based on weather conditions
          if (temp > 35) {
            weatherAlerts.push({ type: 'alert', text: `${city.name}: Extreme heat (${temp}°C)` });
          } else if (temp < 0) {
            weatherAlerts.push({ type: 'alert', text: `${city.name}: Freezing conditions (${temp}°C)` });
          }
          
          // Weather codes: 71-77 = Snow, 51-67 = Rain
          if (weatherCode >= 71 && weatherCode <= 77) {
            weatherAlerts.push({ type: 'alert', text: `${city.name}: Snowfall expected` });
          } else if (precipitation > 5) {
            weatherAlerts.push({ type: 'alert', text: `${city.name}: Heavy rain alert` });
          }
        } catch (error) {
          console.error(`Failed to fetch weather for ${city.name}:`, error);
        }
      }
      
      // Combine manual promos with weather alerts
      const manualPromos = [
        { type: 'promo', text: 'PROMO: Bali flights -20%' },
        { type: 'promo', text: 'PROMO: Dubai hotels -30%' },
        { type: 'promo', text: 'FLASH SALE: Paris packages 25% off' }
      ];
      
      setMarqueeOffers([...manualPromos, ...weatherAlerts]);
    };

    fetchWeatherAlerts();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherAlerts, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % destinations.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);

  return (
    <div className="min-h-screen w-full bg-[#0B1D26] text-white font-sans overflow-x-hidden scroll-smooth">
      
      {/* 1. STICKY NAV BAR (Links Only) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-8 px-10 pointer-events-none">
        <div className="flex items-center justify-center bg-[#0B1D26]/40 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-2">
            {['Home', 'About', 'Gallery', 'Feature', 'Contact Us'].map((item) => (
              <button 
                key={item}
                onClick={() => {
                  const idMap = { 'Home': 'hero', 'About': 'popular-destinations', 'Gallery': 'budget', 'Feature': 'map', 'Contact Us': 'footer' };
                  document.getElementById(idMap[item])?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-[#FF66B2] transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section id="hero" className="relative h-screen w-full flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HikerHero} className="w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D26]/70 via-transparent to-[#0B1D26]" />
        </div>

        {/* LOGO AND JOIN BUTTON (In Hero, not Nav) */}
        <div className="relative z-50 w-full max-w-7xl mx-auto px-10 pt-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mountain className="text-white w-8 h-8" />
              <span className="text-white font-black tracking-[0.4em] text-xs uppercase">Trail Makers</span>
            </div>
            <button className="flex items-center gap-3 bg-[#56B7DF] px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-[#45a6ce] transition-all active:scale-95">
              <User size={16} /> Sign In
            </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[#FF66B2] text-[10px] font-black uppercase tracking-[0.8em] mb-6">Agentic Travel Intelligence</span>
          <h1 className="text-7xl md:text-[130px] font-black tracking-tighter uppercase leading-[0.85]">
            Find Your <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>Trail</span>
          </h1>
          <button onClick={() => document.getElementById('popular-destinations').scrollIntoView({ behavior: 'smooth' })} className="mt-12 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md animate-bounce">
            <ChevronDown size={20} className="text-[#FF66B2]" />
          </button>
        </div>

        {/* UNIFIED STATS BAR (Symmetric sizes) */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-10 pb-12 flex flex-col lg:flex-row items-end justify-between gap-6">
          <div className="flex flex-wrap gap-6">
            <FloatingStat icon={<Users />} val="32,541+" label="Satisfied Clients" />
            <FloatingStat icon={<Tent />} val="524+" label="Camps Organized" />
          </div>

          <div onClick={() => document.getElementById('popular-destinations').scrollIntoView({ behavior: 'smooth' })} 
               className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-2 pr-10 h-[100px] border border-white/10 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-pointer ring-1 ring-[#FF66B2]/20">
             <div className="w-20 h-20 rounded-[22px] overflow-hidden shrink-0 border border-white/10">
               <img src={destinations[1].image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Explore" />
             </div>
             <div className="text-left">
               <span className="text-[8px] font-black uppercase tracking-widest text-[#FF66B2]">Live Insights</span>
               <h4 className="text-xl font-black uppercase flex items-center gap-3 text-white tracking-tighter">
                 Explore Peaks <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
               </h4>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DESTINATIONS */}
      <section id="popular-destinations" className="bg-[#0B1D26] pt-32 pb-48">
        <div className="max-w-[1400px] mx-auto px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
              <span className="text-[#FF66B2] text-xs font-black uppercase tracking-[0.5em]">Global Scout</span>
              <h2 className="text-6xl font-bold mt-5 text-white tracking-tighter">Popular Destinations</h2>
            </div>
            <div className="flex gap-4">
              <button onClick={handlePrev} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:border-[#FF66B2] text-white"><ArrowLeft size={24} /></button>
              <button onClick={handleNext} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:border-[#FF66B2] text-white"><ArrowRight size={24} /></button>
            </div>
          </div>
          <div className="relative flex items-center justify-center h-[500px]">
            {destinations.map((item, index) => (
              <TrekkingCard key={index} item={item} index={index} currentIndex={currentIndex} total={destinations.length} onClickCenter={setCurrentIndex} />
            ))}
          </div>
        </div>
      </section>

      {/* BUDGET SECTION */}
      <section id="budget" className="py-32 bg-[#0B1D26]">
        <div className="max-w-6xl mx-auto px-10">
          <div className="mb-20 text-center">
            <span className="text-[#FF66B2] text-[10px] font-black uppercase tracking-[0.6em]">Financial Agent</span>
            <h2 className="text-5xl font-bold mt-4 text-white tracking-tighter">Budget Optimization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto justify-items-center">
            {[
              { tier: "Backpacker", price: "800", score: "98%", features: ["Hostels & Guesthouses", "Local Transport", "Street Food Gems"] },
              { tier: "Explorer", price: "2,400", score: "94%", features: ["Boutique Hotels", "Private Transfers", "Guided Day Tours"] },
              { tier: "Elite", price: "5,000+", score: "89%", features: ["Luxury Resorts", "Helicopter Transfers", "Personal Concierge"] }
            ].map((plan, i) => (
              <div key={i} className="relative w-full max-w-[320px] group bg-white/5 border border-white/10 p-10 rounded-[3rem] transition-all hover:border-[#FF66B2]/50 hover:bg-white/[0.07]">
                <div className="flex justify-between items-start mb-10">
                  <div className="px-3 py-1 rounded-full border border-[#FF66B2]/30 bg-[#FF66B2]/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF66B2] animate-pulse" />
                    <span className="text-[8px] font-black text-[#FF66B2] uppercase tracking-widest">AI Match: {plan.score}</span>
                  </div>
                </div>
                <div className="mb-10 text-white">
                  <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                  <span className="block text-[9px] font-bold text-white/20 uppercase mt-2 tracking-widest">Estimated Total</span>
                </div>
                <div className="space-y-5 mb-12">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-white/40">
                      <Zap size={12} className="text-[#FF66B2]/40" />
                      <span className="text-[11px] font-bold">{f}</span>
                    </div>
                  ))}
                </div>
                <button className="relative w-full overflow-hidden py-4 rounded-2xl bg-white/5 border border-white/10 group/btn transition-all">
                  <div className="absolute inset-0 bg-[#FF66B2] translate-y-[101%] group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] group-hover/btn:text-[#0B1D26] transition-colors">Analyze Plan</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section id="map" className="py-32 bg-[#0B1D26] overflow-hidden">
        <div className="max-w-7xl mx-auto px-10">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-[#FF66B2] text-[10px] font-black uppercase tracking-[0.6em]">Global Coverage</span>
            <h2 className="text-5xl md:text-6xl font-bold mt-5 text-white tracking-tighter leading-tight">
              Discover the world <br /> through our eyes
            </h2>
          </div>

          {/* UPDATED MARQUEE SECTION WITH LIVE DATA */}
          <section className="bg-[#0B1D26] py-10">
            <style>{`
              @keyframes marquee-ltr { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }
              .animate-marquee-readable { display: flex; width: max-content; animation: marquee-ltr 45s linear infinite; }
            `}</style>
            <div className="max-w-7xl mx-auto px-10">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex items-center h-16 relative">
                <div className="bg-[#FF66B2] h-full px-8 flex items-center gap-3 z-30 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Intel</span>
                </div>
                <div className="flex-1 overflow-hidden h-full flex items-center">
                  <div className="animate-marquee-readable items-center">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="flex items-center">
                        {marqueeOffers.map((offer, index) => (
                          <span 
                            key={`${i}-${index}`}
                            className={`text-[11px] font-bold uppercase tracking-[0.3em] px-20 whitespace-nowrap flex items-center gap-4 ${
                              offer.type === 'promo' ? 'text-[#FF66B2]' : 'text-white/80'
                            }`}
                          >
                            {offer.type === 'alert' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FF66B2]" />
                            )}
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

          {/* Map Container with Famous Cities */}
          <div className="relative w-full aspect-[21/9] rounded-[4rem] bg-[#12252E] border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
            
            {/* The Map Layer */}
            <div className="absolute inset-0 z-0 opacity-90 pointer-events-none scale-[1.1]">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg" 
                className="w-full h-full object-contain brightness-0 invert shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                alt="Solid White Map" 
              />
            </div>

            {/* Updated Marker Layer with Famous Cities */}
            <div className="relative z-20 w-full h-full">
              {[
                { name: 'New York', top: '35%', left: '22%' },
                { name: 'Paris', top: '30%', left: '49%' },
                { name: 'Dubai', top: '42%', left: '58%' },
                { name: 'Mumbai', top: '45%', left: '63%' },
                { name: 'Singapore', top: '52%', left: '72%' },
                { name: 'Tokyo', top: '33%', left: '82%' },
                { name: 'Sydney', top: '72%', left: '83%' },
                { name: 'London', top: '28%', left: '48%' },
                { name: 'Monaco', top: '32%', left: '50.5%' },
                { name: 'Los Angeles', top: '36%', left: '18%' },
                { name: 'Rio de Janeiro', top: '65%', left: '34%' },
                { name: 'Cairo', top: '42%', left: '52%' },
                { name: 'Bangkok', top: '47%', left: '70%' },
                { name: 'Istanbul', top: '35%', left: '53%' },
                { name: 'Cape Town', top: '74%', left: '51%' }
              ].map((loc, idx) => (
                <div 
                  key={idx}
                  style={{ top: loc.top, left: loc.left }}
                  className="absolute group/pin cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                >
                  {/* Pink Pulse */}
                  <div className="w-10 h-10 bg-[#FF66B2] rounded-full animate-ping absolute -left-3.5 -top-3.5 opacity-40" />
                  
                  {/* Pink Core */}
                  <div className="w-4 h-4 bg-[#FF66B2] rounded-full relative z-10 shadow-[0_0_20px_#FF66B2] group-hover/pin:scale-150 transition-transform duration-300 border-2 border-[#12252E]" />
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0B1D26] border border-white/20 text-white px-4 py-1.5 rounded-lg opacity-0 group-hover/pin:opacity-100 transition-all duration-300 pointer-events-none transform group-hover/pin:-translate-y-2 shadow-2xl z-50">
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      {loc.name}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0B1D26] border-r border-b border-white/20 rotate-45" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="w-full bg-[#0B1D26] pt-32">
        <div className="relative w-full leading-[0]">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#0B1D26] to-transparent z-10" />
        </div>
        <div className="bg-[#08151B] py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
            <span>© 2026 Trail Makers Agency</span>
            <div className="flex items-center gap-3">
              <Shield size={12} className="text-[#FF66B2]/20" />
              <span>Encrypted Intelligence Protocol</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}