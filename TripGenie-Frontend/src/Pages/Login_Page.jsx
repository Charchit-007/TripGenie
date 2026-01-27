import './App.css'
import React, { useState } from 'react';
import axios from 'axios'; 
import { Eye, EyeOff, Mail, Lock, User, Compass, Sparkles, Globe } from 'lucide-react';
// 1. Ensure this import is here
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function AuthPage() {
  // 2. Initialize the navigation hook
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

      // Handle success
      const token = response.data.token; 
      localStorage.setItem('token', token); 
      setSuccess(response.data.msg || (isLogin ? 'Login successful!' : 'Registration successful!'));
      
      // Clear form
      setFormData({ name: '', email: '', password: '', staySignedIn: false }); 
      setPasswordStrength(0);

      // 3. THE REDIRECT LOGIC
      // We wait 1.5 seconds so the user can see the "Success" green box
      setTimeout(() => {
        navigate('/home'); 
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'An unexpected network error occurred.';
      setError(errorMessage);
      console.error('Authentication Error:', err.response?.data || err.message);
    }
  };

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[passwordStrength - 1] || 'bg-gray-600';
  };

  const getStrengthText = () => {
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return texts[passwordStrength - 1] || '';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Neural network pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative">
              <Compass className="w-10 h-10 text-orange-400" />
              <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              TripGenie
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Your AI-Powered Journey Companion</p>
        </div>

        {/* Main Card */}
        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-800/50">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-500 to-purple-500"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-4 text-sm font-medium transition-all relative ${
                !isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Account
              {!isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-blue-500"></div>
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-800/30 text-red-300 rounded-lg border border-red-700 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-800/30 text-green-300 rounded-lg border border-green-700 text-sm">
                    {success}
                </div>
            )}
            
            <div className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300 font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {!isLogin && formData.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            level <= passwordStrength ? getStrengthColor() : 'bg-slate-700'
                          }`}
                        ></div>
                      ))}
                    </div>
                    {passwordStrength > 0 && (
                      <p className="text-xs text-slate-400">
                        Password strength: <span className="text-slate-300">{getStrengthText()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.staySignedIn}
                    onChange={(e) => setFormData({ ...formData, staySignedIn: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-slate-400 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    Keep me exploring
                  </span>
                </label>
                {isLogin && (
                  <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-linear-to-r from-cyan-500 via-teal-500 to-cyan-500 bg-size-[200%_auto] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-500 transform hover:scale-[1.02] hover:bg-position-[right_center] active:scale-[0.98]"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900/50 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-all hover:scale-[1.02]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-all hover:scale-[1.02]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Powered by AI • Secured with encryption • Your journey starts here
        </p>
      </div>
    </div>
  );
}