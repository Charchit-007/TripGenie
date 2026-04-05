import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ArrowLeft, Mountain } from 'lucide-react';

export default function NetworkErrorPage({ onRetry, onBack }) {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d2030 0%, #0B1D26 40%, #0e2638 70%, #0d2030 100%)' }}
    >
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.07) 0%, transparent 65%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.05) 0%, transparent 65%)' }} />

      {/* Logo top left */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Mountain className="text-white w-6 h-6" />
        <span className="text-white font-black tracking-[0.4em] text-xs uppercase">Trip Genie</span>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-10 flex flex-col items-center text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(86,183,223,0.12)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Plug Icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{
            background: 'rgba(86,183,223,0.08)',
            border: '1px solid rgba(86,183,223,0.18)',
          }}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Left plug */}
            <rect x="2" y="22" width="14" height="8" rx="2" fill="none" stroke="#56B7DF" strokeWidth="2.2"/>
            <line x1="16" y1="26" x2="22" y2="26" stroke="#56B7DF" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="7" y1="18" x2="7" y2="22" stroke="#56B7DF" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="11" y1="18" x2="11" y2="22" stroke="#56B7DF" strokeWidth="2.2" strokeLinecap="round"/>
            {/* Gap in the middle */}
            <line x1="24" y1="26" x2="28" y2="26" stroke="rgba(86,183,223,0.25)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 3"/>
            {/* Right plug */}
            <rect x="36" y="22" width="14" height="8" rx="2" fill="none" stroke="#56B7DF" strokeWidth="2.2"/>
            <line x1="30" y1="26" x2="36" y2="26" stroke="#56B7DF" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="41" cy="25" r="1.2" fill="#56B7DF"/>
            <circle cx="45" cy="25" r="1.2" fill="#56B7DF"/>
            <circle cx="41" cy="29" r="1.2" fill="#56B7DF"/>
            <circle cx="45" cy="29" r="1.2" fill="#56B7DF"/>
            {/* Spark lines */}
            <line x1="26" y1="18" x2="26" y2="14" stroke="#56B7DF" strokeWidth="1.8" strokeLinecap="round" opacity="0.5"/>
            <line x1="23" y1="19" x2="21" y2="16" stroke="#56B7DF" strokeWidth="1.8" strokeLinecap="round" opacity="0.3"/>
            <line x1="29" y1="19" x2="31" y2="16" stroke="#56B7DF" strokeWidth="1.8" strokeLinecap="round" opacity="0.3"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black text-white tracking-tight mb-8">
          Connection Failed
        </h1>

        {/* Divider */}
        <div className="w-full h-px mb-8"
          style={{ background: 'rgba(86,183,223,0.10)' }} />

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
                boxShadow: '0 6px 20px rgba(86,183,223,0.35)',
              }}
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          )}
          <button
            onClick={onBack || (() => navigate('/home'))}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}