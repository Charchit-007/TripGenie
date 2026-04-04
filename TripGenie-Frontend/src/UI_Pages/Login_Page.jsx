import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mountain } from 'lucide-react'; // ✅ Change 1: Mountain instead of Compass

const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function AuthPage() {
  const navigate = useNavigate();
  const [toggled, setToggled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Change 2 & 3: separate show/hide state for register password
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: loginData.email,
        password: loginData.password,
      });
      const { token, userId, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      setLoginSuccess(response.data.msg || 'Login successful!');
      setTimeout(() => navigate('/splash', { replace: true }), 1500);
    } catch (err) {
      setLoginError(err.response?.data?.msg || 'An unexpected error occurred.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      });
      const { token, userId, name, email } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      setRegisterSuccess(response.data.msg || 'Registration successful!');
      setTimeout(() => navigate('/splash', { replace: true }), 1500);
    } catch (err) {
      setRegisterError(err.response?.data?.msg || 'An unexpected error occurred.');
    }
  };

  return (
    <div style={styles.body}>

      {/* ── TripGenie Brand ─────────────────────────────────────── */}
      <div style={styles.brand}>
        {/* ✅ Change 1: Mountain icon */}
        <div style={styles.brandIcon}>
          <Mountain style={{ width: 40, height: 40, color: '#00d4ff' }} />
        </div>
        <h1 style={styles.brandTitle}>
          TRIP<span style={{ color: '#00d4ff' }}>GENIE</span>
        </h1>
      </div>
      <p style={styles.brandSub}>AGENTIC TRAVEL INTELLIGENCE</p>

      {/* ── Auth Wrapper ─────────────────────────────────────────── */}
      <div style={styles.authWrapper}>

        {/* Background sliding shapes */}
        <div style={{
          ...styles.backgroundShape,
          transform: toggled
            ? 'rotate(0deg) skewY(0deg)'
            : 'rotate(10deg) skewY(40deg)',
          transitionDelay: toggled ? '0.5s' : '1.6s',
        }} />
        <div style={{
          ...styles.secondaryShape,
          transform: toggled
            ? 'rotate(-11deg) skewY(-41deg)'
            : 'rotate(0deg) skewY(0deg)',
          transitionDelay: toggled ? '1.2s' : '0.5s',
        }} />

        {/* ── SIGN IN PANEL ── */}
        <div style={{ ...styles.credentialsPanel, left: 0, padding: '0 40px' }}>

          <h2 style={{
            ...styles.slideElement,
            fontSize: 32,
            textAlign: 'center',
            marginBottom: 4,
            transform: toggled ? 'translateX(-120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            transitionDelay: toggled ? '0s' : '2.1s',
          }}>Login</h2>

          {/* Error/Success — signin */}
          {loginError && (
            <div style={{ ...styles.alertBox, ...styles.alertError, transitionDelay: toggled ? '0.05s' : '2.15s',
              transform: toggled ? 'translateX(-120%)' : 'translateX(0%)', opacity: toggled ? 0 : 1 }}>
              {loginError}
            </div>
          )}
          {loginSuccess && (
            <div style={{ ...styles.alertBox, ...styles.alertSuccess, transitionDelay: toggled ? '0.05s' : '2.15s',
              transform: toggled ? 'translateX(-120%)' : 'translateX(0%)', opacity: toggled ? 0 : 1 }}>
              {loginSuccess}
            </div>
          )}

          {/* Email */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(-120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            transitionDelay: toggled ? '0.1s' : '2.2s',
          }}>
            <input
              type="email"
              required
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              placeholder=""
              style={styles.fieldInput}
              onFocus={e => e.target.style.borderBottomColor = '#00d4ff'}
              onBlur={e => e.target.style.borderBottomColor = loginData.email ? '#00d4ff' : '#fff'}
            />
            <label style={{
              ...styles.fieldLabel,
              top: loginData.email ? '-5px' : '50%',
              color: loginData.email ? '#00d4ff' : '#fff',
              fontSize: loginData.email ? '12px' : '16px',
            }}>Email</label>
            <i className="fa-solid fa-envelope" style={styles.fieldIcon} />
          </div>

          {/* Password — ✅ Change 2: eye icon + toggle */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(-120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            transitionDelay: toggled ? '0.2s' : '2.3s',
          }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              placeholder=""
              style={styles.fieldInput}
              onFocus={e => e.target.style.borderBottomColor = '#00d4ff'}
              onBlur={e => e.target.style.borderBottomColor = loginData.password ? '#00d4ff' : '#fff'}
            />
            <label style={{
              ...styles.fieldLabel,
              top: loginData.password ? '-5px' : '50%',
              color: loginData.password ? '#00d4ff' : '#fff',
              fontSize: loginData.password ? '12px' : '16px',
            }}>Password</label>
            {/* ✅ Eye icon replaces lock icon, toggles show/hide */}
            <i
              className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}
              style={{ ...styles.fieldIcon, color: loginData.password ? '#00d4ff' : '#fff' }}
              onClick={() => setShowPassword(p => !p)}
            />
          </div>

          {/* Submit */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(-120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            transitionDelay: toggled ? '0.3s' : '2.4s',
          }}>
            <SubmitButton label="Login" onClick={handleLogin} />
          </div>

          {/* Switch link — ✅ Change 4: white text */}
          <div style={{
            ...styles.switchLink,
            transform: toggled ? 'translateX(-120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            transitionDelay: toggled ? '0.4s' : '2.5s',
            transition: 'transform 0.7s ease, opacity 0.7s ease',
          }}>
            <p style={{ fontSize: 14, textAlign: 'center', color: '#fff' }}>
              Don't have an account?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setToggled(true); }}
                style={styles.switchAnchor}>Sign Up</a>
            </p>
          </div>
        </div>

        {/* ── WELCOME BACK (signin side) ── */}
        <div style={{ ...styles.welcomeSection, right: 0, textAlign: 'right', padding: '0 40px 60px 150px' }}>
          <h2 style={{
            ...styles.welcomeH2,
            transform: toggled ? 'translateX(120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            filter: toggled ? 'blur(10px)' : 'blur(0px)',
            transitionDelay: toggled ? '0s' : '2.0s',
          }}>WELCOME<br />BACK!</h2>
          <p style={{
            ...styles.welcomeP,
            transform: toggled ? 'translateX(120%)' : 'translateX(0%)',
            opacity: toggled ? 0 : 1,
            filter: toggled ? 'blur(10px)' : 'blur(0px)',
            transitionDelay: toggled ? '0.1s' : '2.1s',
          }}>Great to see you again.<br />Sign in to continue your journey.</p>
        </div>

        {/* ── REGISTER PANEL ── */}
        <div style={{ ...styles.credentialsPanel, right: 0, padding: '0 60px' }}>

          <h2 style={{
            ...styles.slideElement,
            fontSize: 32,
            textAlign: 'center',
            marginBottom: 4,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.7s' : '0s',
          }}>Register</h2>

          {/* Error/Success — register */}
          {registerError && (
            <div style={{ ...styles.alertBox, ...styles.alertError, transitionDelay: toggled ? '1.75s' : '0.05s',
              transform: toggled ? 'translateX(0%)' : 'translateX(120%)', opacity: toggled ? 1 : 0 }}>
              {registerError}
            </div>
          )}
          {registerSuccess && (
            <div style={{ ...styles.alertBox, ...styles.alertSuccess, transitionDelay: toggled ? '1.75s' : '0.05s',
              transform: toggled ? 'translateX(0%)' : 'translateX(120%)', opacity: toggled ? 1 : 0 }}>
              {registerSuccess}
            </div>
          )}

          {/* Name */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.8s' : '0.1s',
          }}>
            <input
              type="text"
              required
              value={registerData.name}
              onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
              placeholder=""
              style={styles.fieldInput}
              onFocus={e => e.target.style.borderBottomColor = '#00d4ff'}
              onBlur={e => e.target.style.borderBottomColor = registerData.name ? '#00d4ff' : '#fff'}
            />
            <label style={{
              ...styles.fieldLabel,
              top: registerData.name ? '-5px' : '50%',
              color: registerData.name ? '#00d4ff' : '#fff',
              fontSize: registerData.name ? '12px' : '16px',
            }}>Username</label>
            <i className="fa-solid fa-user" style={styles.fieldIcon} />
          </div>

          {/* Email */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.9s' : '0.2s',
          }}>
            <input
              type="email"
              required
              value={registerData.email}
              onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
              placeholder=""
              style={styles.fieldInput}
              onFocus={e => e.target.style.borderBottomColor = '#00d4ff'}
              onBlur={e => e.target.style.borderBottomColor = registerData.email ? '#00d4ff' : '#fff'}
            />
            <label style={{
              ...styles.fieldLabel,
              top: registerData.email ? '-5px' : '50%',
              color: registerData.email ? '#00d4ff' : '#fff',
              fontSize: registerData.email ? '12px' : '16px',
            }}>Email</label>
            <i className="fa-solid fa-envelope" style={styles.fieldIcon} />
          </div>

          {/* Password — ✅ Change 3: eye icon + toggle for register */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.9s' : '0.3s',
          }}>
            <input
              type={showRegisterPassword ? 'text' : 'password'}
              required
              value={registerData.password}
              onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
              placeholder=""
              style={styles.fieldInput}
              onFocus={e => e.target.style.borderBottomColor = '#00d4ff'}
              onBlur={e => e.target.style.borderBottomColor = registerData.password ? '#00d4ff' : '#fff'}
            />
            <label style={{
              ...styles.fieldLabel,
              top: registerData.password ? '-5px' : '50%',
              color: registerData.password ? '#00d4ff' : '#fff',
              fontSize: registerData.password ? '12px' : '16px',
            }}>Password</label>
            {/* ✅ Eye icon replaces lock icon, toggles show/hide */}
            <i
              className={showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}
              style={{ ...styles.fieldIcon, color: registerData.password ? '#00d4ff' : '#fff' }}
              onClick={() => setShowRegisterPassword(p => !p)}
            />
          </div>

          {/* Submit */}
          <div style={{
            ...styles.fieldWrapper,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '2.0s' : '0.4s',
          }}>
            <SubmitButton label="Register" onClick={handleRegister} />
          </div>

          {/* Switch link — ✅ Change 4: white text */}
          <div style={{
            ...styles.switchLink,
            transform: toggled ? 'translateX(0%)' : 'translateX(120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '2.1s' : '0.5s',
            transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
          }}>
            <p style={{ fontSize: 14, textAlign: 'center', color: '#fff' }}>
              Already have an account?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setToggled(false); }}
                style={styles.switchAnchor}>Sign In</a>
            </p>
          </div>
        </div>

        {/* ── WELCOME (register side) ── */}
        <div style={{ ...styles.welcomeSection, left: 0, textAlign: 'left', padding: '0 150px 60px 38px', pointerEvents: 'none' }}>
          <h2 style={{
            ...styles.welcomeH2,
            transform: toggled ? 'translateX(0%)' : 'translateX(-120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.7s' : '0s',
          }}>WELCOME!</h2>
          <p style={{
            ...styles.welcomeP,
            transform: toggled ? 'translateX(0%)' : 'translateX(-120%)',
            opacity: toggled ? 1 : 0,
            filter: toggled ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: toggled ? '1.8s' : '0.1s',
          }}>Join TripGenie and start<br />planning your dream trips.</p>
        </div>

      </div>

      {/* Font Awesome + global styles */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        input::placeholder { color: transparent; }
        input:focus { outline: none; }
        a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

/* ── Animated submit button ──────────────────────────────────────────── */
function SubmitButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        height: 45,
        background: 'transparent',
        borderRadius: 40,
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 600,
        color: '#fff',
        border: '2px solid #00d4ff',
        overflow: 'hidden',
        zIndex: 1,
        fontFamily: 'Poppins, sans-serif',
        letterSpacing: '0.5px',
      }}
    >
      {/* Animated gradient fill */}
      <span style={{
        position: 'absolute',
        height: '300%',
        width: '100%',
        background: 'linear-gradient(#1a1a2e, #00d4ff, #1a1a2e, #00d4ff)',
        top: hovered ? '0%' : '-100%',
        left: 0,
        zIndex: -1,
        transition: '0.5s',
        pointerEvents: 'none',
      }} />
      {label}
    </button>
  );
}

/* ── Styles object ───────────────────────────────────────────────────── */
const styles = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)',
    padding: '20px',
    fontFamily: 'Poppins, sans-serif',
  },

  // Brand
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  brandIcon: {
    padding: 10,
    borderRadius: 12,
    border: '1px solid rgba(0,212,255,0.35)',
    background: 'rgba(0,212,255,0.10)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: '-1px',
    textTransform: 'uppercase',
    color: '#fff',
    margin: 0,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.4em',
    textTransform: 'uppercase',
    color: 'rgba(0,212,255,0.75)',
    marginBottom: 36,
  },

  // Auth card wrapper — exact from CSS
  authWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: 800,
    height: 500,
    border: '2px solid #00d4ff',
    boxShadow: '0 0 25px #00d4ff',
    overflow: 'hidden',
    background: '#0d2030',
  },

  // Background shapes
  backgroundShape: {
    position: 'absolute',
    right: 0,
    top: -5,
    height: 600,
    width: 850,
    background: 'linear-gradient(45deg, #0a1a28 0%, #0d2030 30%, #0a8fa8 65%, #00d4ff 100%)',
    transformOrigin: 'bottom right',
    transition: '1.5s ease',
    zIndex: 0,
  },
  secondaryShape: {
    position: 'absolute',
    left: 250,
    top: '100%',
    height: 700,
    width: 850,
    background: '#0d2030',
    borderTop: '3px solid #00d4ff',
    transformOrigin: 'bottom left',
    transition: '1.5s ease',
    zIndex: 0,
  },

  // Credentials panel
  credentialsPanel: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 2,
  },

  // Slide element base
  slideElement: {
    transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
    color: '#fff',
  },

  // Field wrapper
  fieldWrapper: {
    position: 'relative',
    width: '100%',
    height: 50,
    marginTop: 25,
    transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
  },
  fieldInput: {
    width: '100%',
    height: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #fff',
    outline: 'none',
    fontSize: 16,
    color: '#fff',
    fontWeight: 600,
    paddingRight: 23,
    transition: '0.5s',
    fontFamily: 'Poppins, sans-serif',
  },
  fieldLabel: {
    position: 'absolute',
    left: 0,
    transform: 'translateY(-50%)',
    fontSize: 16,
    color: '#fff',
    transition: '0.5s',
    pointerEvents: 'none',
  },
  fieldIcon: {
    position: 'absolute',
    top: '50%',
    right: 0,
    fontSize: 18,
    transform: 'translateY(-50%)',
    color: '#fff',
    cursor: 'pointer',
  },

  // Switch link
  switchLink: {
    fontSize: 14,
    textAlign: 'center',
    margin: '20px 0 10px',
    transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
  },
  switchAnchor: {
    textDecoration: 'none',
    color: '#00d4ff',
    fontWeight: 600,
  },

  // Welcome section
  welcomeSection: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 1,
  },
  welcomeH2: {
    textTransform: 'uppercase',
    fontSize: 36,
    lineHeight: 1.3,
    color: '#fff',
    transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
    margin: 0,
  },
  welcomeP: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    transition: 'transform 0.7s ease, opacity 0.7s ease, filter 0.7s ease',
    marginTop: 8,
  },

  // Alerts
  alertBox: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
    padding: '6px 12px',
    borderRadius: 8,
    marginTop: 8,
    transition: 'transform 0.7s ease, opacity 0.7s ease',
  },
  alertError: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
  },
  alertSuccess: {
    background: 'rgba(34,197,94,0.12)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#4ade80',
  },
};