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
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-100 flex flex-col items-center justify-center p-6">

      {/* Brand Header */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="p-2.5 border border-sky-300/50 rounded-xl bg-white/60 shadow-sm backdrop-blur-sm">
            <Compass className="w-10 h-10 text-sky-500" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent tracking-tight uppercase leading-none">
            Trip<span className="text-cyan-500">Genie</span>
          </h1>
        </div>
        <p className="text-sky-600 text-xs font-black tracking-[0.4em] uppercase opacity-70 mt-1">
          Agentic Travel Intelligence
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">

        {/* Tab Selection */}
        <div className="flex bg-sky-50/80 border-b border-sky-100">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${isLogin ? 'text-sky-600' : 'text-sky-300 hover:text-sky-400'}`}
          >
            Sign In
            {isLogin && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-500 to-cyan-500 rounded-t" />}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${!isLogin ? 'text-sky-600' : 'text-sky-300 hover:text-sky-400'}`}
          >
            Register
            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-500 to-cyan-500 rounded-t" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">

          {/* Error / Success */}
          {error && (
            <div className="text-red-600 text-[10px] font-black uppercase text-center bg-red-50 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-[10px] font-black uppercase text-center bg-green-50 py-3 rounded-xl border border-green-200">
              {success}
            </div>
          )}

          <div className="space-y-5">

            {/* Name — Register only */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-sky-600 uppercase tracking-widest ml-1">Adventurer Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-sky-50/80 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-sky-900 font-semibold focus:outline-none focus:border-sky-400 transition-all placeholder:text-sky-300"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sky-600 uppercase tracking-widest ml-1">Email Intel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-sky-50/80 border border-sky-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-sky-900 font-semibold focus:outline-none focus:border-sky-400 transition-all placeholder:text-sky-300"
                  placeholder="agent@tripgenie.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-sky-600 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full bg-sky-50/80 border border-sky-100 rounded-2xl py-4 pl-12 pr-12 text-sm text-sky-900 font-semibold focus:outline-none focus:border-sky-400 transition-all placeholder:text-sky-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stay logged in / Forgot */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.staySignedIn}
                  onChange={(e) => setFormData({ ...formData, staySignedIn: e.target.checked })}
                  className="w-4 h-4 rounded border-sky-200 bg-sky-50 text-sky-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest group-hover:text-sky-600 transition-colors">
                  Stay Logged In
                </span>
              </label>
              {isLogin && (
                <button type="button" className="text-[10px] font-bold text-sky-500 uppercase tracking-widest hover:text-sky-700 transition-colors">
                  Forgot Key?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:from-sky-600 hover:via-cyan-600 hover:to-blue-600 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-lg hover:shadow-cyan-400/50 transition-all transform hover:scale-[1.02] active:scale-95 mt-2"
            >
              {isLogin ? 'Initiate Session' : 'Create Profile'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sky-100"></div>
            </div>
            <span className="relative bg-white/70 px-4 text-[8px] font-black text-sky-400 uppercase tracking-[0.5em]">
              Secure Protocol
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 bg-sky-50/80 border border-sky-100 rounded-2xl text-[9px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-100 transition-all"
            >
              <Globe className="w-3.5 h-3.5" /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-4 bg-sky-50/80 border border-sky-100 rounded-2xl text-[9px] font-black text-sky-500 uppercase tracking-widest hover:bg-sky-100 transition-all"
            >
              <Shield className="w-3.5 h-3.5" /> GitHub
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col items-center gap-2 opacity-40">
        <Shield className="w-4 h-4 text-sky-500" />
        <p className="text-[8px] font-black text-sky-600 uppercase tracking-[0.8em]">Secure Intelligence Protocol v2.0</p>
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
}