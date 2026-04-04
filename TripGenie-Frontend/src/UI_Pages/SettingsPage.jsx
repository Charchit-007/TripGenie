import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Lock, Eye, EyeOff,
  Save, CheckCircle, AlertCircle,
  Mountain, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [userName,  setUserName]  = useState(localStorage.getItem('userName')  || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileStatus,  setProfileStatus]  = useState(null);
  const [profileMsg,     setProfileMsg]     = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordMsg,    setPasswordMsg]    = useState('');

  const handleSaveProfile = async () => {
    setProfileStatus(null);
    if (!userName.trim() || !userEmail.trim()) {
      setProfileStatus('error');
      setProfileMsg('Name and email cannot be empty.');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`${API_BASE_URL}/update-profile`, { userId, name: userName, email: userEmail });
      localStorage.setItem('userName',  userName);
      localStorage.setItem('userEmail', userEmail);
      setProfileStatus('success');
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileStatus('error');
      setProfileMsg(err.response?.data?.msg || 'Failed to update profile.');
    }
    setTimeout(() => setProfileStatus(null), 3500);
  };

  const handleSavePassword = async () => {
    setPasswordStatus(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('error');
      setPasswordMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus('error');
      setPasswordMsg('Password must be at least 6 characters.');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`${API_BASE_URL}/update-password`, { userId, currentPassword, newPassword });
      setPasswordStatus('success');
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPasswordStatus('error');
      setPasswordMsg(err.response?.data?.msg || 'Failed to change password.');
    }
    setTimeout(() => setPasswordStatus(null), 3500);
  };

  return (
    <div className="min-h-screen w-full text-white font-sans"
      style={{ background: 'linear-gradient(135deg, #0d2030 0%, #0B1D26 40%, #0e2638 70%, #0d2030 100%)' }}>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.08) 0%, transparent 65%)' }}/>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(86,183,223,0.06) 0%, transparent 65%)' }}/>

      {/* Top bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-8 pb-6 flex items-center justify-between">
        <button onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-semibold transition-all group"
          style={{ color: '#56B7DF' }}>
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
          Back to Home
        </button>
        <div className="flex items-center gap-3">
          <Mountain className="text-white w-6 h-6"/>
          <span className="text-white font-black tracking-[0.4em] text-xs uppercase">Trip Genie</span>
        </div>
      </div>

      {/* Page title */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-sm font-medium mt-1" style={{ color: 'rgba(86,183,223,0.65)' }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Main layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-20 flex gap-8">

        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden sticky top-8"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(86,183,223,0.12)',
              backdropFilter: 'blur(20px)',
            }}>
            <div className="p-5 border-b" style={{ borderColor: 'rgba(86,183,223,0.1)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: 'rgba(86,183,223,0.12)', border: '1px solid rgba(86,183,223,0.3)' }}>
                <User size={22} style={{ color: '#56B7DF' }}/>
              </div>
              <p className="text-white text-sm font-bold truncate">{userName || 'Traveller'}</p>
              <p className="text-xs font-medium truncate mt-0.5" style={{ color: 'rgba(86,183,223,0.55)' }}>
                {userEmail}
              </p>
            </div>
            <nav className="p-2">
              <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(86,183,223,0.12)',
                  border: '1px solid rgba(86,183,223,0.25)',
                  color: '#56B7DF',
                }}>
                <div className="flex items-center gap-2.5">
                  <User size={16}/>
                  <span className="text-xs font-bold uppercase tracking-widest">Profile</span>
                </div>
                <ChevronRight size={12}/>
              </div>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-6">

          {/* Basic Info */}
          <Section title="Basic Information" subtitle="Update your display name and email address">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldGroup label="Full Name" icon={<User size={15}/>}>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your full name"
                  style={inputStyle}
                  className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/20"
                />
              </FieldGroup>
              <FieldGroup label="Email Address" icon={<Mail size={15}/>}>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={inputStyle}
                  className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-white/20"
                />
              </FieldGroup>
            </div>
            {profileStatus && <StatusBanner status={profileStatus} msg={profileMsg}/>}
            <div className="flex justify-end mt-2">
              <SaveButton onClick={handleSaveProfile} label="Save Profile"/>
            </div>
          </Section>

          {/* Change Password */}
          <Section title="Change Password" subtitle="Use a strong password of at least 6 characters">
            <div className="space-y-4">
              <FieldGroup label="Current Password" icon={<Lock size={15}/>}>
                <div className="flex items-center" style={inputStyle}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-white/20"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    style={{ color: 'rgba(86,183,223,0.6)' }}>
                    {showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </FieldGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldGroup label="New Password" icon={<Lock size={15}/>}>
                  <div className="flex items-center" style={inputStyle}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-white/20"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ color: 'rgba(86,183,223,0.6)' }}>
                      {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </FieldGroup>
                <FieldGroup label="Confirm Password" icon={<Lock size={15}/>}>
                  <div className="flex items-center" style={inputStyle}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-white/20"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ color: 'rgba(86,183,223,0.6)' }}>
                      {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </FieldGroup>
              </div>
            </div>

            {newPassword && (
              <div className="mt-3">
                <div className="flex gap-1.5 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: i <= passwordStrength(newPassword)
                          ? strengthColor(passwordStrength(newPassword))
                          : 'rgba(255,255,255,0.08)'
                      }}/>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: strengthColor(passwordStrength(newPassword)) }}>
                  {strengthLabel(passwordStrength(newPassword))}
                </p>
              </div>
            )}

            {passwordStatus && <StatusBanner status={passwordStatus} msg={passwordMsg}/>}
            <div className="flex justify-end mt-2">
              <SaveButton onClick={handleSavePassword} label="Update Password"/>
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl p-7"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(86,183,223,0.10)',
        backdropFilter: 'blur(20px)',
      }}>
      <div className="mb-6">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <p className="text-xs font-medium mt-1" style={{ color: 'rgba(86,183,223,0.55)' }}>{subtitle}</p>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function FieldGroup({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: 'rgba(86,183,223,0.7)' }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

function SaveButton({ onClick, label }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'linear-gradient(to right, #56B7DF, #38bdf8, #0ea5e9)',
        boxShadow: '0 4px 16px rgba(86,183,223,0.35)',
      }}>
      <Save size={14}/>{label}
    </button>
  );
}

function StatusBanner({ status, msg }) {
  const isSuccess = status === 'success';
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold mt-3"
      style={{
        background: isSuccess ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
        border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
        color: isSuccess ? '#4ade80' : '#f87171',
      }}>
      {isSuccess ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
      {msg}
    </div>
  );
}

/* ── Password strength helpers ── */
const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6)                         score++;
  if (pwd.length >= 10)                        score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd))               score++;
  return score;
};
const strengthColor = (s) => ['#ef4444','#f97316','#eab308','#22c55e'][s - 1] || '#ef4444';
const strengthLabel = (s) => ['Weak','Fair','Good','Strong'][s - 1] || 'Weak';

const inputStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '10px 14px',
  borderRadius: 12,
  background: 'rgba(86,183,223,0.07)',
  border: '1px solid rgba(86,183,223,0.20)',
  color: 'white',
  fontSize: 14,
};