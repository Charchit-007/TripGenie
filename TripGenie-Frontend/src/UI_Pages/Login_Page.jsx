import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User, Compass, Globe, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    staySignedIn: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e) => {
    setFormData({ ...formData, password: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/register`;
    const { name, email, password } = formData;
    const dataToSend = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(url, dataToSend, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { token, userId, name: userName, email: userEmail } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', userEmail);

      setSuccess(response.data.msg || (isLogin ? 'Login successful!' : 'Registration successful!'));

      setTimeout(() => {
        navigate('/home');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.msg || 'An unexpected network error occurred.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d2030 0%, #112840 35%, #0f3248 65%, #0d2030 100%)'
      }}
    >

      {/* Subtle cyan glow top-right */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.12) 0%, transparent 65%)' }} />
      {/* Subtle cyan glow bottom-left */}
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.08) 0%, transparent 65%)' }} />

      {/* Brand Header */}
      <div className="mb-10 flex flex-col items-center gap-3 relative z-10">
        <div className="flex items-center gap-4">
          <div
            className="p-2.5 rounded-xl"
            style={{
              border: '1px solid rgba(86,183,223,0.35)',
              background: 'rgba(86,183,223,0.10)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <Compass className="w-10 h-10" style={{ color: '#56B7DF' }} />
          </div>
          <h1 className="text-5xl font-black tracking-tight uppercase leading-none text-white">
            Trip<span style={{ color: '#56B7DF' }}>Genie</span>
          </h1>
        </div>
        <p className="text-[10px] font-black tracking-[0.4em] uppercase mt-1"
          style={{ color: '#56B7DF', opacity: 0.75 }}>
          Agentic Travel Intelligence
        </p>
      </div>

      {/* Main Authentication Card */}
      <div
        className="w-full max-w-[440px] rounded-3xl overflow-hidden relative z-10"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(86,183,223,0.18)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 40px rgba(86,183,223,0.07), inset 0 1px 0 rgba(255,255,255,0.07)'
        }}
      >

        {/* Tab Selection */}
        <div className="flex border-b"
          style={{ background: 'rgba(86,183,223,0.04)', borderColor: 'rgba(86,183,223,0.12)' }}>
          <button
            onClick={() => setIsLogin(true)}
            className="flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative"
            style={{ color: isLogin ? 'white' : 'rgba(86,183,223,0.38)' }}
          >
            Sign In
            {isLogin && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t"
                style={{ background: 'linear-gradient(to right, #56B7DF, #38bdf8)' }} />
            )}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className="flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative"
            style={{ color: !isLogin ? 'white' : 'rgba(86,183,223,0.38)' }}
          >
            Register
            {!isLogin && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] rounded-t"
                style={{ background: 'linear-gradient(to right, #56B7DF, #38bdf8)' }} />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">

          {/* Error / Success */}
          {error && (
            <div className="text-red-400 text-[10px] font-black uppercase text-center py-3 rounded-xl border"
              style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-[10px] font-black uppercase text-center py-3 rounded-xl border"
              style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)' }}>
              {success}
            </div>
          )}

          <div className="space-y-5">

            {/* Name — Register only */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest ml-1"
                  style={{ color: '#56B7DF' }}>Adventurer Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#56B7DF' }} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none transition-all placeholder:text-white/20"
                    style={{
                      background: 'rgba(86,183,223,0.09)',
                      border: '1px solid rgba(86,183,223,0.22)',
                      color: 'white',
                    }}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1"
                style={{ color: '#56B7DF' }}>Email Intel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#56B7DF' }} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: 'rgba(86,183,223,0.09)',
                    border: '1px solid rgba(86,183,223,0.22)',
                    color: 'white',
                  }}
                  placeholder="agent@tripgenie.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1"
                style={{ color: '#56B7DF' }}>Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: '#56B7DF' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full rounded-2xl py-4 pl-12 pr-12 text-sm font-semibold focus:outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: 'rgba(86,183,223,0.09)',
                    border: '1px solid rgba(86,183,223,0.22)',
                    color: 'white',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#56B7DF' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stay logged in / Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.staySignedIn}
                  onChange={(e) => setFormData({ ...formData, staySignedIn: e.target.checked })}
                  className="w-4 h-4 rounded focus:ring-0 focus:ring-offset-0"
                  style={{ accentColor: '#56B7DF' }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(86,183,223,0.65)' }}>
                  Stay Logged In
                </span>
              </label>
              {isLogin && (
                <button type="button"
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#56B7DF' }}>
                  Forgot Key?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-5 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 mt-2"
              style={{
                background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
                boxShadow: '0 10px 35px rgba(86,183,223,0.4)'
              }}
            >
              {isLogin ? 'Initiate Session' : 'Create Profile'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(86,183,223,0.15)' }}></div>
            </div>
            <span className="relative px-4 text-[8px] font-black uppercase tracking-[0.5em]"
              style={{ background: 'transparent', color: 'rgba(86,183,223,0.5)' }}>
              Secure Protocol
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(86,183,223,0.09)',
                border: '1px solid rgba(86,183,223,0.2)',
                color: '#56B7DF'
              }}
            >
              <Globe className="w-3.5 h-3.5" /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(86,183,223,0.09)',
                border: '1px solid rgba(86,183,223,0.2)',
                color: '#56B7DF'
              }}
            >
              <Shield className="w-3.5 h-3.5" /> GitHub
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col items-center gap-2 relative z-10" style={{ opacity: 0.4 }}>
        <Shield className="w-4 h-4" style={{ color: '#56B7DF' }} />
        <p className="text-[8px] font-black uppercase tracking-[0.8em]" style={{ color: '#56B7DF' }}>
          Secure Intelligence Protocol v2.0
        </p>
      </div>
    </div>
  );
}