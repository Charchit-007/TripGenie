import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Hotel, Utensils, Zap, Wallet, Cloud } from 'lucide-react';

export default function ResponsePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const missionTitle = location.state?.title || "Switzerland";

  // Data database for your friends to see different results for each card
  const itineraries = {
    "K2 Base Camp": {
      dates: "2026-06-10 to 2026-07-01",
      days: [
        { day: "Day 1-3", task: "Arrival in Islamabad & Briefing at Alpine Club." },
        { day: "Day 4-10", task: "Flight to Skardu and Jeep trek to Askole." },
        { day: "Day 11-21", task: "Trek through Baltoro Glacier to Concordia (K2 Base Camp)." }
      ],
      hotels: ["Serena Shigar", "K7 Base Camp Tents"],
      cost: "$3,500",
      weather: "-10°C to 5°C"
    },
    "Inca Trail": {
      dates: "2026-05-14 to 2026-05-24",
      days: [
        { day: "Day 1", task: "Arrival in Cusco & Acclimatization." },
        { day: "Day 2-5", task: "Classic 4-Day Trek to Machu Picchu via Dead Woman's Pass." },
        { day: "Day 6-10", task: "Exploration of Sacred Valley and Ollantaytambo." }
      ],
      hotels: ["Belmond Sanctuary Lodge", "Casa Andina"],
      cost: "$2,200",
      weather: "8°C to 20°C"
    },
    "Switzerland": {
        dates: "2026-02-14 to 2026-02-16",
        days: [
          { day: "Day 1", task: "Arrive in Zurich. Explore Altstadt (Old Town)." },
          { day: "Day 2", task: "Train to Interlaken. Visit Top of Europe (Jungfraujoch)." },
          { day: "Day 3", task: "Lake Zurich boat tour & Swiss National Museum." }
        ],
        hotels: ["Hotel du Theatre ($150/nt)", "Hotel Seeburg ($120/nt)"],
        cost: "$810",
        weather: "1°C to 3°C (Overcast)"
      }
  };

  // Fallback to Switzerland data if card isn't in list
  const data = itineraries[missionTitle] || itineraries["Switzerland"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-[#0EA5E9] transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center text-white">
                <Zap size={16} fill="currentColor" />
            </div>
            <span className="font-black tracking-tighter text-xl">Trip Genie</span>
        </div>
        <button className="bg-[#0EA5E9] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-blue-200">Add to Watchlist</button>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        {/* INPUT SUMMARY BAR */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-wrap gap-4 mb-10 justify-center sm:justify-between">
           <div className="flex flex-col px-4 border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</span>
                <span className="font-bold">{missionTitle}</span>
           </div>
           <div className="flex flex-col px-4 border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates</span>
                <span className="font-bold text-sm">{data.dates}</span>
           </div>
           <div className="flex flex-col px-4 border-r border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
                <span className="font-bold text-sm">Mid-Range</span>
           </div>
           <div className="bg-[#0EA5E9] w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0">
                <Zap size={20} />
           </div>
        </div>

        {/* AI TRAVEL PLAN CONTENT */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="p-10 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 text-[#0EA5E9] mb-4">
                <MapPin size={24} />
                <h1 className="text-3xl font-black tracking-tight">AI Travel Plan</h1>
            </div>
            <p className="text-slate-400 text-xs font-medium">Generated: 02/13/2026, 10:05 AM | Created by: Trip Genie</p>
          </div>

          <div className="p-10 space-y-12">
            {/* ITINERARY */}
            <section>
              <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Calendar className="text-[#0EA5E9]" size={20} /> Day-by-Day Itinerary
              </h3>
              <div className="space-y-6 border-l-2 border-slate-100 ml-2 pl-8">
                {data.days.map((d, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#0EA5E9]" />
                    <p className="font-black text-sm text-[#0EA5E9] mb-1">{d.day}</p>
                    <p className="text-slate-600 font-medium leading-relaxed">{d.task}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOTELS & COST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                        <Hotel className="text-[#0EA5E9]" size={20} /> Recommended Hotels
                    </h3>
                    <ul className="space-y-3">
                        {data.hotels.map((h, i) => (
                            <li key={i} className="text-slate-600 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                • {h}
                            </li>
                        ))}
                    </ul>
                </section>
                <section>
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                        <Wallet className="text-[#0EA5E9]" size={20} /> Cost Breakdown
                    </h3>
                    <div className="bg-[#0EA5E9]/5 p-6 rounded-2xl border border-[#0EA5E9]/10">
                        <p className="text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest">Total Estimated Budget</p>
                        <p className="text-4xl font-black text-[#0EA5E9]">{data.cost}</p>
                    </div>
                </section>
            </div>

            {/* WEATHER */}
            <section className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between">
                <div>
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Current Weather Intel</h3>
                    <p className="text-2xl font-bold">{data.weather}</p>
                </div>
                <Cloud size={48} className="text-[#0EA5E9] opacity-50" />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}