import React, { useState } from 'react';
import axios from 'axios'; 
import { Eye, EyeOff, Mail, Lock, User, Compass, Sparkles, Globe, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0B1D26] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Brand Header - Increased heading size */}
      <div className="mb-12 flex flex-col items-center gap-3">
         <div className="flex items-center gap-4">
            <div className="p-2.5 border border-[#56B7DF]/30 rounded-xl bg-[#0B1D26] shadow-sm">
                <Compass className="w-10 h-10 text-[#56B7DF]" />
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                Trip<span className="text-[#56B7DF]">Genie</span>
            </h1>
         </div>
         <p className="text-[#56B7DF] text-xs font-black tracking-[0.5em] opacity-60 uppercase mt-2">
            Agentic Travel Intelligence
         </p>
      </div>

      {/* Main Authentication Card - Matched to Destination Gallery style */}
      <div className="w-full max-w-[440px] bg-[#0B1D26] rounded-[2.5rem] border border-[#56B7DF]/20 shadow-2xl overflow-hidden shadow-black/80">
        
        {/* Tab Selection */}
        <div className="flex bg-black/20 border-b border-white/5">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${isLogin ? 'text-[#56B7DF]' : 'text-white/20 hover:text-white/40'}`}
          >
            Sign In
            {isLogin && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#56B7DF]" />}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${!isLogin ? 'text-[#56B7DF]' : 'text-white/20 hover:text-white/40'}`}
          >
            Register
            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#56B7DF]" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && <div className="text-red-400 text-[10px] font-black uppercase text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}
          
          <div className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Adventurer Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#56B7DF]/30 transition-all placeholder:text-white/5"
                    placeholder="ENTER FULL NAME"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Intel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#56B7DF]/30 transition-all placeholder:text-white/5"
                  placeholder="AGENT@TRIPGENIE.COM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-[#56B7DF]/30 transition-all placeholder:text-white/5"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#56B7DF]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={formData.staySignedIn}
                        onChange={(e) => setFormData({...formData, staySignedIn: e.target.checked})}
                        className="w-4 h-4 rounded border-white/10 bg-black/40 text-[#56B7DF] focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Stay Logged In</span>
                </label>
                {isLogin && <button type="button" className="text-[10px] font-black text-[#56B7DF] uppercase tracking-widest hover:opacity-70">Forgot Key?</button>}
            </div>

            {/* Subdued Action Button - Softened glow, focused on matte blue finish */}
            <button
              type="submit"
              className="w-full py-5 bg-[#56B7DF] text-[#0B1D26] text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_4px_20px_rgba(86,183,223,0.15)] hover:bg-[#68c6eb] transition-all transform active:scale-95 mt-4"
            >
              {isLogin ? 'Initiate Session' : 'Create Profile'}
            </button>
          </div>

          <div className="relative py-4 flex items-center justify-center">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
             <span className="relative bg-[#0B1D26] px-4 text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Secure Protocol</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button type="button" className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all">
                <Globe className="w-3.5 h-3.5" /> Google
             </button>
             <button type="button" className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 transition-all">
                <Shield className="w-3.5 h-3.5" /> GitHub
             </button>
          </div>
        </form>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 opacity-20">
        <Shield className="w-5 h-5 text-[#56B7DF]" />
        <p className="text-[8px] font-black text-white uppercase tracking-[0.8em]">Secure Intelligence Protocol v2.0</p>
      </div>
    </div>
  );
}