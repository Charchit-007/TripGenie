import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/*
  MOTION: LEFT-TO-RIGHT TAKEOFF
  - Plane SVG is drawn nose-pointing RIGHT (0deg = flying right)
  - ENTER: Comes from bottom-left → center, pitched slightly up (-10deg) then levels to 0deg.
  - IDLE:  Rests in center, perfectly level (0deg).
  - TURN:  Pitches nose up to prepare for takeoff (-25deg).
  - EXIT:  Shoots out top-right (-25deg).
*/

const P = { INTRO: 'intro', ENTER: 'enter', IDLE: 'idle', TURN: 'turn', EXIT: 'exit', FADE: 'fade' };

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(P.INTRO);
  const userName = localStorage.getItem('userName') || '';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(P.ENTER), 1500);
    const t2 = setTimeout(() => setPhase(P.IDLE),  4000);
    const t3 = setTimeout(() => setPhase(P.TURN),  6200);
    const t4 = setTimeout(() => setPhase(P.EXIT),  7000);
    const t5 = setTimeout(() => setPhase(P.FADE),  8000);
    const t6 = setTimeout(() => navigate('/home', { replace: true }), 10000);
    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, [navigate]);

  const isIdle = phase === P.IDLE || phase === P.TURN;
  const isExiting = phase === P.EXIT || phase === P.FADE;
  const isFading = phase === P.FADE;

  const planeStyle = (() => {
    switch (phase) {
      case P.INTRO:
        // Off-screen bottom-left. Nose pointing slightly up.
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(calc(-50% - 100vw), calc(-50% + 20vh)) rotate(-10deg) scale(0.7)',
          opacity: 0,
          transition: 'none',
        };

      case P.ENTER:
        // Glide to center and level out to 0deg
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
          opacity: 1,
          transition: 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
        };

      case P.IDLE:
        // Rest perfectly level
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
          opacity: 1,
          transition: 'transform 1.5s ease-in-out',
        };

      case P.TURN:
        // Pitch nose up for takeoff
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg) scale(1)',
          opacity: 1,
          transition: 'transform 0.8s ease-in-out',
        };

      case P.EXIT:
        // Blast off to top-right
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(calc(-50% + 150vw), calc(-50% - 100vh)) rotate(-25deg) scale(1.1)',
          opacity: 1,
          transition: 'transform 1.1s cubic-bezier(0.5, 0, 1, 0.5)',
        };

      case P.FADE:
        // Continue movement while fading
        return {
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(calc(-50% + 180vw), calc(-50% - 120vh)) rotate(-25deg) scale(1.1)',
          opacity: 0,
          transition: 'opacity 0.5s ease',
        };

      default:
        return { position: 'absolute', top: '50%', left: '50%' };
    }
  })();

  // Match speed streaks to the takeoff angle
  const speedLineAngle = '-25deg';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      overflow: 'hidden', fontFamily: "'Poppins', sans-serif",
      opacity: isFading ? 0 : 1,
      transition: isFading ? 'opacity 2s ease-in-out' : 'none',
    }}>

      {/* ── Sky ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 65% 38%, rgba(0,130,180,0.12) 0%, transparent 52%),
          radial-gradient(ellipse at 22% 72%, rgba(0,80,130,0.10) 0%, transparent 48%),
          linear-gradient(165deg, #060f18 0%, #0B1D26 42%, #0e2638 72%, #060f18 100%)
        `,
      }} />

      {/* ── Stars ── */}
      {STARS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.y, left: s.x,
          width: s.r, height: s.r, borderRadius: '50%',
          background: s.r > 2 ? '#fff' : '#c8eeff',
          opacity: phase === P.INTRO ? 0 : s.o,
          transition: `opacity 1.2s ease ${s.d}`,
          boxShadow: s.r > 2 ? `0 0 ${s.r * 2}px rgba(255,255,255,0.8)` : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Clouds ── */}
      {CLOUDS_BACK.map((c, i) => <RealCloud key={`b${i}`} c={c} active={phase !== P.INTRO} duration="35s" />)}
      {CLOUDS_MID.map((c, i) => <RealCloud key={`m${i}`} c={c} active={phase !== P.INTRO} duration="22s" />)}
      {CLOUDS_FRONT.map((c, i) => <RealCloud key={`f${i}`} c={c} active={phase !== P.INTRO} duration="14s" />)}

      {/* ── Horizon glow ── */}
      <div style={{
        position: 'absolute', top: '56%', left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.22), transparent)',
        opacity: phase === P.INTRO ? 0 : 0.5,
        transition: 'opacity 1s ease 0.6s',
      }} />

      {/* ── Ground spotlight (idle) ── */}
      <div style={{
        position: 'absolute', top: '54%', left: '50%',
        width: isIdle ? 300 : 0, height: isIdle ? 70 : 0,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(0,180,220,0.09) 0%, transparent 70%)',
        transform: 'translate(-50%, 0) scaleY(0.45)',
        transition: 'width 1s ease, height 1s ease, opacity 0.8s ease',
        opacity: isIdle ? 1 : 0,
        pointerEvents: 'none', zIndex: 4,
      }} />

      {/* ── Speed streaks on exit ── */}
      {isExiting && SPEED_LINES.map((l, i) => (
        <div key={i} style={{
          position: 'absolute', top: l.y, left: l.x,
          width: l.w, height: l.h,
          background: `linear-gradient(to right, transparent, rgba(0,212,255,${l.a}), transparent)`,
          borderRadius: 99,
          transform: `rotate(${speedLineAngle})`,
          transformOrigin: 'center',
          opacity: 1,
          transition: `opacity 0.15s ease ${l.d}`,
          pointerEvents: 'none', filter: 'blur(0.5px)',
        }} />
      ))}

      {/* ── Brand ── */}
      <div style={{
        position: 'absolute', top: '11%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: isExiting || phase === P.INTRO ? 0 : 1,
        transform: isExiting ? 'translateY(-14px)' : 'translateY(0)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.52em',
          textTransform: 'uppercase', color: 'rgba(0,212,255,0.7)', margin: 0,
        }}>Agentic Travel Intelligence</p>
        <h1 style={{
          fontSize: 52, fontWeight: 900, letterSpacing: '-1px',
          textTransform: 'uppercase', color: '#fff', margin: '8px 0 0',
          textShadow: '0 0 40px rgba(0,212,255,0.4)',
        }}>
          TRIP<span style={{ color: '#00d4ff' }}>GENIE</span>
        </h1>
      </div>

      {/* ── Plane ── */}
      <div style={{ ...planeStyle, zIndex: 10 }}>
        
        {/* Ground shadow — perfectly counter-rotates so it stays flat during pitch up */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: isIdle ? 200 : 120,
          height: isIdle ? 24 : 16,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)',
          filter: 'blur(5px)',
          transform: `translate(-50%, 40px) rotate(${
            phase === P.INTRO ? 10 :
            phase === P.ENTER ? 0 :
            phase === P.IDLE  ? 0 :
            phase === P.TURN  ? 25 :
            25
          }deg)`,
          transition: `width 0.8s ease, height 0.8s ease, transform ${
            phase === P.ENTER ? '2.5s cubic-bezier(0.16, 1, 0.3, 1)' :
            phase === P.TURN ? '0.8s ease-in-out' : '0.8s ease'
          }`,
          pointerEvents: 'none',
        }} />
        <PlaneRight glowing={isIdle} banking={phase === P.TURN} />
      </div>

      {/* ── Welcome text ── */}
      <div style={{
        position: 'absolute', bottom: '15%', left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: phase === P.IDLE ? 1 : 0,
        transform: phase === P.IDLE ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        pointerEvents: 'none',
      }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.88)', margin: 0 }}>
          {userName
            ? <>Welcome back, <span style={{ color: '#00d4ff', fontWeight: 700 }}>{userName}</span> ✈️</>
            : <>Your adventure begins now ✈️</>
          }
        </p>
        <p style={{
          fontSize: 11, fontWeight: 500, color: 'rgba(0,212,255,0.55)',
          margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Preparing your journey...</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;900&display=swap');
        @keyframes cloudDrift {
          from { transform: translateX(0); }
          to   { transform: translateX(-130vw); }
        }
        @keyframes enginePulse {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1.0; }
        }
        @keyframes lightPulse {
          0%,100% { opacity: 0.8; filter: blur(1px); }
          50%     { opacity: 1.0; filter: blur(2px); }
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PLANE SVG 
   ══════════════════════════════════════════════════════════════════════════ */
function PlaneRight({ glowing, banking }) {
  return (
    <svg
      width="260" height="100"
      viewBox="0 0 260 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: glowing
          ? 'drop-shadow(0 0 14px rgba(0,212,255,0.6)) drop-shadow(0 4px 16px rgba(0,0,0,0.9))'
          : 'drop-shadow(0 4px 18px rgba(0,0,0,0.9))',
        transition: 'filter 0.6s ease, transform 0.8s ease-in-out',
        // Slight 3D banking tilt during takeoff roll
        transform: banking ? 'perspective(300px) rotateX(18deg)' : 'perspective(300px) rotateX(0deg)',
      }}
    >
      <ellipse cx="125" cy="50" rx="110" ry="13" fill="url(#fuseGrad)" />
      <path d="M 15 54 Q 70 62 125 63 Q 180 62 235 54 L 235 58 Q 180 66 125 67 Q 70 66 15 58 Z" fill="url(#fuseBellyGrad)" />
      <path d="M 232 44 Q 250 48 254 50 Q 250 52 232 56 Z" fill="url(#noseGrad)" />
      <ellipse cx="222" cy="46" rx="9" ry="5" fill="url(#cockpitGrad)" opacity="0.95" />
      <ellipse cx="208" cy="45" rx="6" ry="4" fill="url(#cockpitGrad)" opacity="0.75" />
      <path d="M 155 48 L 190 8 L 205 11 L 175 50 Z" fill="url(#wingGrad)" />
      <path d="M 155 52 L 190 12 L 205 15 L 175 54 Z" fill="url(#wingUnderGrad)" opacity="0.6" />
      <path d="M 190 8 L 196 6 L 205 11 L 199 13 Z" fill="#0a4060" />
      <path d="M 158 48 L 193 8" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 148 52 L 115 88 L 128 91 L 165 56 Z" fill="url(#wingLowGrad)" opacity="0.75" />
      <path d="M 115 88 L 121 94 L 128 91 L 122 85 Z" fill="#081520" />
      <ellipse cx="182" cy="28" rx="16" ry="6" fill="url(#engGrad)" />
      <ellipse cx="182" cy="28" rx="16" ry="6" stroke="rgba(0,180,220,0.3)" strokeWidth="0.8" fill="none" />
      <ellipse cx="196" cy="28" rx="6" ry="5" fill={glowing ? 'rgba(0,212,255,0.9)' : 'rgba(0,180,210,0.6)'} style={{ animation: glowing ? 'enginePulse 0.9s ease-in-out infinite' : 'none' }} />
      <ellipse cx="168" cy="28" rx="4" ry="3.5" fill={glowing ? 'rgba(100,210,255,0.7)' : 'rgba(0,100,140,0.4)'} style={{ animation: glowing ? 'enginePulse 0.9s ease-in-out infinite 0.2s' : 'none' }} />
      {glowing && <ellipse cx="163" cy="28" rx="7" ry="3" fill="rgba(0,212,255,0.3)" style={{ filter: 'blur(3px)', animation: 'lightPulse 0.9s infinite' }} />}
      <path d="M 180 36 L 178 48" stroke="rgba(0,150,200,0.4)" strokeWidth="1.5" />
      <ellipse cx="136" cy="70" rx="13" ry="5.5" fill="url(#engGrad)" opacity="0.88" />
      <ellipse cx="136" cy="70" rx="13" ry="5.5" stroke="rgba(0,180,220,0.25)" strokeWidth="0.8" fill="none" />
      <ellipse cx="147" cy="70" rx="5" ry="4.5" fill={glowing ? 'rgba(0,212,255,0.85)' : 'rgba(0,180,210,0.55)'} style={{ animation: glowing ? 'enginePulse 0.9s ease-in-out infinite 0.15s' : 'none' }} />
      <ellipse cx="125" cy="70" rx="3.5" ry="3" fill={glowing ? 'rgba(100,210,255,0.65)' : 'rgba(0,100,140,0.35)'} style={{ animation: glowing ? 'enginePulse 0.9s ease-in-out infinite 0.35s' : 'none' }} />
      <path d="M 134 60 L 132 52" stroke="rgba(0,150,200,0.35)" strokeWidth="1.5" />
      <path d="M 28 50 L 22 22 L 40 36 L 42 52 Z" fill="url(#tailGrad)" />
      <path d="M 40 36 L 46 28 L 22 22 Z" fill="url(#tailTopGrad)" opacity="0.65" />
      <path d="M 30 42 L 8 28 L 16 24 L 40 36 Z" fill="url(#wingGrad)" opacity="0.85" />
      <path d="M 32 56 L 10 68 L 18 72 L 44 60 Z" fill="url(#wingLowGrad)" opacity="0.70" />
      <ellipse cx="20" cy="46" rx="4" ry="3" fill={glowing ? '#ff2a2a' : '#991111'} style={{ animation: glowing ? 'lightPulse 1.3s ease-in-out infinite 0.2s' : 'none' }} />
      {glowing && <ellipse cx="20" cy="46" rx="8" ry="5" fill="rgba(255,40,40,0.2)" style={{ filter: 'blur(3px)' }} />}
      <path d="M 232 45 Q 248 48 252 50 Q 248 52 232 55 L 234 51 Q 240 50 240 50 Q 240 50 234 49 Z" fill="white" opacity={glowing ? 1 : 0.6} style={{ animation: glowing ? 'lightPulse 1.2s ease-in-out infinite' : 'none' }} />
      {glowing && <ellipse cx="246" cy="50" rx="12" ry="6" fill="rgba(255,255,255,0.2)" style={{ filter: 'blur(4px)', animation: 'lightPulse 1.2s infinite' }} />}
      {[220, 206, 192, 178, 164, 150, 136, 122, 108, 94, 80, 66, 52].map((cx, i) => (
        <ellipse key={i} cx={cx} cy={47} rx="5" ry="3.5" fill="url(#winGrad)" opacity={glowing ? 0.92 : 0.55 + (i % 4) * 0.08} style={{ transition: 'opacity 0.5s ease' }} />
      ))}
      <path d="M 30 44 Q 130 38 230 44" stroke="rgba(255,255,255,0.10)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {glowing && (
        <>
          <circle cx="196" cy="6" r="2.5" fill="rgba(0,212,255,0.9)" style={{ animation: 'lightPulse 1s ease-in-out infinite' }} />
          <circle cx="120" cy="92" r="2" fill="rgba(0,255,100,0.9)" style={{ animation: 'lightPulse 1.1s ease-in-out infinite 0.3s' }} />
        </>
      )}
      <defs>
        <linearGradient id="fuseGrad" x1="15" y1="37" x2="240" y2="63" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#0d2535" /><stop offset="30%" stopColor="#163650" /><stop offset="65%" stopColor="#1e4d70" /><stop offset="100%" stopColor="#d0eeff" /></linearGradient>
        <linearGradient id="fuseBellyGrad" x1="15" y1="63" x2="235" y2="67" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#060e18" /><stop offset="100%" stopColor="#0a1824" /></linearGradient>
        <linearGradient id="noseGrad" x1="232" y1="44" x2="254" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#c8eaff" /><stop offset="100%" stopColor="#0d2535" /></linearGradient>
        <linearGradient id="cockpitGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#7ad4f0" /><stop offset="100%" stopColor="#003a55" /></linearGradient>
        <linearGradient id="wingGrad" x1="155" y1="8" x2="205" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#00d4ff" stopOpacity="0.95" /><stop offset="55%" stopColor="#0a6585" /><stop offset="100%" stopColor="#0a1e30" /></linearGradient>
        <linearGradient id="wingUnderGrad" x1="155" y1="54" x2="205" y2="8" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#060e18" /><stop offset="100%" stopColor="#0a2840" /></linearGradient>
        <linearGradient id="wingLowGrad" x1="115" y1="91" x2="165" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#060e18" /><stop offset="100%" stopColor="#163650" /></linearGradient>
        <linearGradient id="tailGrad" x1="22" y1="22" x2="42" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" /><stop offset="100%" stopColor="#081520" /></linearGradient>
        <linearGradient id="tailTopGrad" x1="22" y1="22" x2="46" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#1a5878" /><stop offset="100%" stopColor="#0a1e2c" /></linearGradient>
        <linearGradient id="engGrad" x1="166" y1="22" x2="198" y2="34" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#0a3a55" /><stop offset="50%" stopColor="#1a5878" /><stop offset="100%" stopColor="#081520" /></linearGradient>
        <linearGradient id="winGrad" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#a8eeff" /><stop offset="100%" stopColor="#00446a" /></linearGradient>
      </defs>
    </svg>
  );
}

function RealCloud({ c, active, duration }) {
  const w = c.w, h = c.h;
  return (
    <div style={{
      position: 'absolute', top: c.top, left: c.startX,
      opacity: active ? c.opacity : 0,
      transition: 'opacity 1.5s ease',
      animation: active ? `cloudDrift ${duration} linear ${c.delay} infinite` : 'none',
      pointerEvents: 'none',
    }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <ellipse cx={w*.50} cy={h*.72} rx={w*.46} ry={h*.22} fill={c.color || 'rgba(180,220,240,0.10)'} />
        <ellipse cx={w*.50} cy={h*.52} rx={w*.36} ry={h*.32} fill={c.color || 'rgba(180,220,240,0.12)'} />
        <ellipse cx={w*.28} cy={h*.58} rx={w*.24} ry={h*.26} fill={c.color || 'rgba(180,220,240,0.11)'} />
        <ellipse cx={w*.72} cy={h*.56} rx={w*.22} ry={h*.24} fill={c.color || 'rgba(180,220,240,0.10)'} />
        <ellipse cx={w*.50} cy={h*.36} rx={w*.22} ry={h*.20} fill={c.color || 'rgba(200,235,250,0.08)'} />
        <ellipse cx={w*.32} cy={h*.42} rx={w*.16} ry={h*.17} fill={c.color || 'rgba(180,220,240,0.09)'} />
        <ellipse cx={w*.68} cy={h*.40} rx={w*.15} ry={h*.16} fill={c.color || 'rgba(180,220,240,0.08)'} />
        <ellipse cx={w*.50} cy={h*.80} rx={w*.42} ry={h*.14} fill="rgba(0,0,0,0.06)" />
      </svg>
    </div>
  );
}

const STARS = [
  { x:'8%',  y:'4%',  r:3, o:0.95, d:'0.0s' }, { x:'22%', y:'7%',  r:3, o:0.90, d:'0.3s' },
  { x:'51%', y:'3%',  r:3, o:0.95, d:'0.2s' }, { x:'73%', y:'6%',  r:3, o:0.88, d:'0.4s' },
  { x:'91%', y:'4%',  r:3, o:0.92, d:'0.1s' }, { x:'14%', y:'12%', r:2, o:0.80, d:'0.2s' },
  { x:'34%', y:'8%',  r:2, o:0.75, d:'0.1s' }, { x:'62%', y:'11%', r:2, o:0.78, d:'0.5s' },
  { x:'82%', y:'13%', r:2, o:0.72, d:'0.3s' }, { x:'44%', y:'15%', r:2, o:0.70, d:'0.4s' },
  { x:'5%',  y:'20%', r:1, o:0.65, d:'0.6s' }, { x:'28%', y:'16%', r:1, o:0.60, d:'0.2s' },
  { x:'58%', y:'18%', r:1, o:0.62, d:'0.5s' }, { x:'77%', y:'17%', r:1, o:0.58, d:'0.3s' },
  { x:'93%', y:'14%', r:1, o:0.65, d:'0.1s' }, { x:'38%', y:'22%', r:1, o:0.55, d:'0.7s' },
  { x:'67%', y:'21%', r:1, o:0.58, d:'0.4s' }, { x:'88%', y:'22%', r:1, o:0.52, d:'0.6s' },
];

const CLOUDS_BACK = [
  { top:'8%',  startX:'2%',  w:500, h:160, opacity:0.85, delay:'0s',   color:'rgba(140,190,215,0.09)' },
  { top:'25%', startX:'45%', w:440, h:140, opacity:0.80, delay:'-10s', color:'rgba(140,190,215,0.08)' },
  { top:'55%', startX:'65%', w:480, h:155, opacity:0.78, delay:'-20s', color:'rgba(140,190,215,0.09)' },
  { top:'70%', startX:'15%', w:420, h:135, opacity:0.72, delay:'-7s',  color:'rgba(140,190,215,0.07)' },
  { top:'18%', startX:'80%', w:400, h:130, opacity:0.75, delay:'-15s', color:'rgba(140,190,215,0.08)' },
];
const CLOUDS_MID = [
  { top:'32%', startX:'8%',  w:360, h:115, opacity:0.88, delay:'-3s',  color:'rgba(160,210,235,0.11)' },
  { top:'48%', startX:'50%', w:320, h:105, opacity:0.85, delay:'-12s', color:'rgba(160,210,235,0.10)' },
  { top:'62%', startX:'28%', w:340, h:110, opacity:0.82, delay:'-6s',  color:'rgba(160,210,235,0.11)' },
  { top:'15%', startX:'70%', w:300, h:100, opacity:0.80, delay:'-18s', color:'rgba(160,210,235,0.09)' },
];
const CLOUDS_FRONT = [
  { top:'38%', startX:'0%',  w:460, h:145, opacity:0.95, delay:'0s',   color:'rgba(185,225,245,0.13)' },
  { top:'58%', startX:'32%', w:400, h:128, opacity:0.90, delay:'-4s',  color:'rgba(185,225,245,0.12)' },
  { top:'20%', startX:'58%', w:380, h:120, opacity:0.88, delay:'-9s',  color:'rgba(185,225,245,0.13)' },
  { top:'72%', startX:'75%', w:420, h:132, opacity:0.92, delay:'-2s',  color:'rgba(185,225,245,0.12)' },
  { top:'45%', startX:'88%', w:390, h:124, opacity:0.87, delay:'-7s',  color:'rgba(185,225,245,0.11)' },
];
const SPEED_LINES = [
  { x:'45%', y:'44%', w:260, h:2,   a:0.60, d:'0.00s' },
  { x:'41%', y:'49%', w:210, h:1.5, a:0.50, d:'0.03s' },
  { x:'49%', y:'40%', w:185, h:1.5, a:0.42, d:'0.07s' },
  { x:'37%', y:'54%', w:230, h:2,   a:0.35, d:'0.05s' },
  { x:'53%', y:'36%', w:160, h:1,   a:0.30, d:'0.09s' },
  { x:'33%', y:'58%', w:195, h:1,   a:0.25, d:'0.04s' },
  { x:'57%', y:'33%', w:140, h:1,   a:0.22, d:'0.11s' },
];