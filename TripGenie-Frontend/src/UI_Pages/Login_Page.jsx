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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/[0-9]/)) strength++;
    if (pass.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const pass = e.target.value;
    setFormData({ ...formData, password: pass });
    if (!isLogin) {
      setPasswordStrength(calculatePasswordStrength(pass));
    }
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

      const token = response.data.token; 
      const userId = response.data.userId;        
      const userName = response.data.name;        
      const userEmail = response.data.email;      

      localStorage.setItem('token', token); 
      localStorage.setItem('userId', userId);     
      localStorage.setItem('userName', userName); 
      localStorage.setItem('userEmail', userEmail); 

      setSuccess(response.data.msg || (isLogin ? 'Login successful!' : 'Registration successful!'));
      
      setFormData({ name: '', email: '', password: '', staySignedIn: false }); 
      setPasswordStrength(0);

      setTimeout(() => {
        navigate('/home'); 
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'An unexpected network error occurred.';
      setError(errorMessage);
      console.error('Authentication Error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1D26] flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Branding Header to match Logo style */}
      <div className="mb-10 flex flex-col items-center gap-2">
         <div className="flex items-center gap-3">
            <div className="p-2 border border-[#56B7DF]/30 rounded-lg">
                <Compass className="w-8 h-8 text-[#56B7DF]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                Trip<span className="text-[#56B7DF]">Genie</span>
            </h1>
         </div>
         <p className="text-[#56B7DF] text-[10px] font-black tracking-[0.4em] opacity-60 uppercase">Agentic Travel Intelligence</p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[420px] bg-[#0B1D26] rounded-[2.5rem] border border-[#56B7DF]/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Tab Selection */}
        <div className="flex border-b border-[#56B7DF]/10">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-6 text-[11px] font-black uppercase tracking-widest transition-all ${isLogin ? 'text-[#56B7DF] bg-white/5' : 'text-white/20 hover:text-white/40'}`}
          >
            Sign In
            {isLogin && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#56B7DF] shadow-[0_0_10px_#56B7DF]" />}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-6 text-[11px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'text-[#56B7DF] bg-white/5' : 'text-white/20 hover:text-white/40'}`}
          >
            Register
            {!isLogin && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#56B7DF] shadow-[0_0_10px_#56B7DF]" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && <div className="text-red-400 text-[10px] font-black uppercase text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</div>}
          
          <div className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Adventurer Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#56B7DF]/50 transition-all placeholder:text-white/5"
                    placeholder="ENTER FULL NAME"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Email Intel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#56B7DF]/50 transition-all placeholder:text-white/5"
                  placeholder="AGENT@TRIPGENIE.COM"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-[#56B7DF]/50 transition-all placeholder:text-white/5"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#56B7DF]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox with custom theme */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={formData.staySignedIn}
                        onChange={(e) => setFormData({...formData, staySignedIn: e.target.checked})}
                        className="w-4 h-4 rounded border-[#56B7DF]/30 bg-black/40 text-[#56B7DF] focus:ring-0"
                    />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">Stay Logged In</span>
                </label>
                {isLogin && <button type="button" className="text-[10px] font-black text-[#56B7DF] uppercase tracking-widest hover:opacity-70">Forgot Key?</button>}
            </div>

            {/* Glowing Action Button - Matched to your "Create Profile" look */}
            <button
              type="submit"
              className="w-full py-5 bg-[#56B7DF] text-[#0B1D26] text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(86,183,223,0.3)] hover:shadow-[0_0_40px_rgba(86,183,223,0.5)] transition-all transform active:scale-95"
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

      <div className="mt-10 flex flex-col items-center gap-2 opacity-30">
        <Shield className="w-4 h-4 text-[#56B7DF]" />
        <p className="text-[8px] font-black text-white uppercase tracking-[0.6em]">TripGenie Security Intelligence</p>
      </div>
    </div>
  );
}