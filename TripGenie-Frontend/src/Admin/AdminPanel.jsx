import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import useAdminAuth from '../hooks/useAdminAuth';

const ADMIN_URL = "http://localhost:5000";

const TripGenieAdmin = () => {
  const token = useAdminAuth();

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState([]);
  const [selectedAdminToRemove, setSelectedAdminToRemove] = useState(null);

  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchAdmins(), fetchTrips(), fetchStats(), fetchBookings()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${ADMIN_URL}/api/admin/users`, { headers: authHeaders });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${ADMIN_URL}/api/admin/trips`, { headers: authHeaders });
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${ADMIN_URL}/api/admin/stats`, { headers: authHeaders });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${ADMIN_URL}/api/admin/admins`, { headers: authHeaders });
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${ADMIN_URL}/api/admin/bookings`, { headers: authHeaders });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their trips?')) return;
    const res = await fetch(`${ADMIN_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (res.ok) fetchAll();
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Delete this trip?')) return;
    const res = await fetch(`${ADMIN_URL}/api/admin/trips/${tripId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    if (res.ok) fetchTrips();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = '/admin/login';
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUserForRole(user);
    setSelectedUserRoles(user.role || ['user']);
  };

  const handleToggleRole = (role) => {
    setSelectedUserRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (selectedUserRoles.length === 0) {
      alert('User must have at least one role');
      return;
    }
    const res = await fetch(`${ADMIN_URL}/api/admin/users/${selectedUserForRole._id}/role`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ roles: selectedUserRoles })
    });
    if (res.ok) {
      fetchUsers();
      setSelectedUserForRole(null);
      setSelectedUserRoles([]);
    } else {
      alert('Failed to update roles');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const res = await fetch(`${ADMIN_URL}/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      fetchBookings();
    } else {
      alert('Failed to update booking status');
    }
  };

  const handleRemoveAdminRole = async (userId) => {
    if (!window.confirm('Remove admin role from this user?')) return;
    const res = await fetch(`${ADMIN_URL}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ roles: ['user'] })
    });
    if (res.ok) {
      fetchAdmins();
      setSelectedAdminToRemove(null);
    } else {
      alert('Failed to remove admin role');
    }
  };

  // Real stats from API
  const tripTypeData = stats?.tripsByType?.map(t => ({
    name: t._id,
    value: t.count
  })) || [];

  const monthlyPlans = stats?.tripsByMonth?.map(t => ({
    month: new Date(2026, t._id.month - 1).toLocaleString('default', { month: 'short' }),
    plans: t.count
  })) || [];

  // Mock user growth until we track it
  const userGrowth = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 145 },
    { month: 'Mar', users: 178 },
    { month: 'Apr', users: 195 },
    { month: 'May', users: 230 },
    { month: 'Jun', users: 280 },
  ];

  const COLORS = ['#06B6D4', '#0891B2', '#14B8A6', '#0D9488', '#2DD4BF'];

  const filteredTrips = trips.filter(trip => {
    const userName = trip.userId?.name || '';
    const matchesSearch =
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trip.budget === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tooltipStyle = {
    background: '#fff',
    border: '2px solid #06B6D4',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-700 font-semibold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Dashboard View ────────────────────────────────────────────────────────
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Users',
            value: stats?.totalUsers ?? users.length,
            change: 'Registered users',
            gradient: 'from-cyan-400 to-cyan-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            )
          },
          {
            label: 'Trip Plans Created',
            value: stats?.totalTrips ?? trips.length,
            change: 'All time trips',
            gradient: 'from-teal-400 to-teal-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            )
          },
          {
            label: 'Replanned Trips',
            value: stats?.replanCount ?? 0,
            change: 'AI replanned',
            gradient: 'from-cyan-300 to-teal-500',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            )
          },
          {
            label: 'Trip Types',
            value: tripTypeData.length,
            change: 'Unique categories',
            gradient: 'from-sky-400 to-cyan-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            )
          },
          {
            label: 'Total Admins',
            value: admins.length,
            change: 'Admin users',
            gradient: 'from-purple-400 to-purple-600',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100 4m0-4a2 2 0 110 4m-6-8a2 2 0 100-4m0 4a2 2 0 110-4" />
            )
          }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-7 shadow-md border border-black/[0.04] flex gap-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white flex-shrink-0`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {card.icon}
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-500 font-medium block mb-1">{card.label}</span>
              <span className="text-4xl font-extrabold text-cyan-800 block mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{card.value}</span>
              <span className="text-xs font-semibold text-gray-400">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-md border border-black/[0.04]">
          <h3 className="text-xl font-bold text-cyan-800 mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Monthly Trip Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPlans}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="plans" fill="url(#colorPlans)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-black/[0.04]">
          <h3 className="text-xl font-bold text-cyan-800 mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Trip Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={tripTypeData} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100} dataKey="value">
                {tripTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-black/[0.04]">
        <h3 className="text-xl font-bold text-cyan-800 mb-6" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>User Growth Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ ...tooltipStyle, border: '2px solid #14B8A6' }} />
            <Line type="monotone" dataKey="users" stroke="#14B8A6" strokeWidth={3}
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ─── Users View ────────────────────────────────────────────────────────────
  const UsersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-cyan-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>User Management</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-black/[0.04] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50">
              {['Name', 'Email', 'Roles', 'Join Date', 'Trip Plans', 'Actions'].map(h => (
                <th key={h} className="px-6 py-5 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t border-black/[0.06] hover:bg-cyan-500/5 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-base">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600">{user.email}</td>
                <td className="px-6 py-5">
                  <div className="flex gap-2 flex-wrap">
                    {(user.role || ['user']).map(role => (
                      <span key={role} className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        role === 'admin' 
                          ? 'bg-purple-500/10 text-purple-700' 
                          : 'bg-cyan-500/10 text-cyan-700'
                      }`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-700">
                    {user.totalTrips} plans
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenRoleModal(user)}
                      className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                      title="Assign roles"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100 4m0-4a2 2 0 110 4m-6-8a2 2 0 100-4m0 4a2 2 0 110-4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                      title="Delete user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-medium">No users found</div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {selectedUserForRole && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedUserForRole(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-8 py-6 border-b border-black/[0.06]">
              <h3 className="text-2xl font-bold text-gray-800">Assign Roles</h3>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">Assign roles for <span className="font-semibold text-gray-800">{selectedUserForRole.name}</span></p>
                <div className="space-y-3">
                  {['user', 'admin'].map(role => (
                    <label key={role} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50/30 transition-all">
                      <input
                        type="checkbox"
                        checked={selectedUserRoles.includes(role)}
                        onChange={() => handleToggleRole(role)}
                        className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">{role}</p>
                        <p className="text-sm text-gray-500">
                          {role === 'admin' ? 'Access to admin dashboard' : 'Regular user access'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-6 border-t border-black/[0.06]">
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="px-7 py-3.5 rounded-xl bg-white text-cyan-600 font-semibold border-2 border-cyan-500 hover:bg-cyan-500/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Save Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Admins View ────────────────────────────────────────────────────────────
  const AdminsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-cyan-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Admin Management</h2>
        <span className="inline-flex items-center px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold text-sm">
          {admins.length} {admins.length === 1 ? 'Admin' : 'Admins'}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-black/[0.04] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
              {['Name', 'Email', 'Join Date', 'Trips Created', 'Actions'].map(h => (
                <th key={h} className="px-6 py-5 text-left text-xs font-bold text-purple-800 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id} className="border-t border-black/[0.06] hover:bg-purple-500/5 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-base">
                      {admin.name?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">{admin.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600">{admin.email}</td>
                <td className="px-6 py-5 text-gray-600">{new Date(admin.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-700">
                    {admin.totalTrips} plans
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => setSelectedAdminToRemove(admin)}
                    className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                    title="Remove admin role"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-medium">No admins found</div>
        )}
      </div>

      {/* Remove Admin Modal */}
      {selectedAdminToRemove && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setSelectedAdminToRemove(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-8 py-6 border-b border-black/[0.06]">
              <h3 className="text-2xl font-bold text-gray-800">Remove Admin Role</h3>
              <button
                onClick={() => setSelectedAdminToRemove(null)}
                className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">{selectedAdminToRemove.name}</span> will be demoted to a regular user and lose all admin privileges.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Admin Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Email:</span> {selectedAdminToRemove.email}</p>
                  <p><span className="font-medium">Since:</span> {new Date(selectedAdminToRemove.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Trip Plans:</span> {selectedAdminToRemove.totalTrips || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-8 py-6 border-t border-black/[0.06]">
              <button
                onClick={() => setSelectedAdminToRemove(null)}
                className="px-7 py-3.5 rounded-xl bg-white text-gray-600 font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveAdminRole(selectedAdminToRemove._id)}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
              >
                Remove Admin Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Trips View ────────────────────────────────────────────────────────────
  const TripsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-extrabold text-cyan-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Trip Plans Management</h2>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex items-center flex-1 max-w-sm">
            <svg className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search trip plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-cyan-500/20 bg-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
            />
          </div>
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-5 py-3.5 rounded-xl border-2 border-cyan-500/20 bg-white text-sm font-medium cursor-pointer focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
          >
            <option value="all">All Budgets</option>
            <option value="affordable">Affordable</option>
            <option value="mid-range">Mid-Range</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-black/[0.04] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50">
              {['Plan ID', 'User', 'Destination', 'Travel Dates', 'Budget', 'Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-5 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip._id} className="border-t border-black/[0.06] hover:bg-cyan-500/5 transition-colors">
                <td className="px-6 py-5 font-mono text-sm text-gray-500">#{trip._id?.slice(-6)}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {trip.userId?.name?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">{trip.userId?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {trip.destination}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {new Date(trip.startDate).toLocaleDateString()} — {new Date(trip.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-700 capitalize">
                    {trip.budget}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-700 capitalize">
                    {trip.tripType}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                    trip.isReplanned
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {trip.isReplanned ? 'Replanned' : 'Planned'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrips.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-medium">No trips found</div>
        )}
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8 animate-[fadeIn_0.3s_ease]"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-black/[0.06]">
              <h3 className="text-2xl font-bold text-gray-800">Trip Plan Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Plan ID', value: `#${selectedTrip._id?.slice(-6)}` },
                  { label: 'User', value: selectedTrip.userId?.name },
                  { label: 'Destination', value: selectedTrip.destination },
                  { label: 'Start Date', value: new Date(selectedTrip.startDate).toLocaleDateString() },
                  { label: 'End Date', value: new Date(selectedTrip.endDate).toLocaleDateString() },
                  { label: 'Budget', value: selectedTrip.budget, capitalize: true },
                  { label: 'Trip Type', value: selectedTrip.tripType, capitalize: true },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                    <span className={`text-base font-semibold text-cyan-800 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${
                    selectedTrip.isReplanned ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                  }`}>
                    {selectedTrip.isReplanned ? 'Replanned' : 'Planned'}
                  </span>
                </div>
                {selectedTrip.aiResponse && (
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <span className="text-sm text-gray-500 font-medium">AI Plan Preview</span>
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100 max-h-48 overflow-y-auto text-sm text-cyan-900 leading-relaxed">
                      {selectedTrip.aiResponse.substring(0, 500)}...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-8 py-6 border-t border-black/[0.06]">
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-7 py-3.5 rounded-xl bg-white text-cyan-600 font-semibold border-2 border-cyan-500 hover:bg-cyan-500/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Bookings View ────────────────────────────────────────────────────────
  const BookingsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-cyan-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>Bookings Management</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-black/[0.04] overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-teal-50 to-cyan-50">
              {['Booking Ref', 'User', 'Destination', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-6 py-5 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking._id} className="border-t border-black/[0.06] hover:bg-cyan-500/5 transition-colors">
                <td className="px-6 py-5 font-mono font-semibold text-cyan-600">{booking.bookingReference}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold">
                      {booking.userId?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{booking.userId?.name}</p>
                      <p className="text-sm text-gray-500">{booking.userId?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600">{booking.tripId?.destination}</td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700">
                    {booking.totalPaid} {booking.currency}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <select
                    value={booking.status}
                    onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : booking.status === 'CANCELLED'
                        ? 'bg-red-500/10 text-red-700'
                        : 'bg-amber-500/10 text-amber-700'
                    }`}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FLIGHT_CHANGED">Flight Changed</option>
                  </select>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td className="px-6 py-5">
                  <button
                    title="View details"
                    className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-medium">No bookings found</div>
        )}
      </div>
    </div>
  );
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Outfit', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50" style={{ fontFamily: "'Outfit', sans-serif" }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-72 bg-gradient-to-b from-cyan-800 to-cyan-900 flex flex-col fixed h-screen shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-10">
          {/* Logo */}
          <div className="px-8 pb-8 pt-8 border-b border-white/10">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L4 14L16 26L28 14L16 2Z" fill="url(#g1)" />
                <path d="M16 8L10 14L16 20L22 14L16 8Z" fill="url(#g2)" opacity="0.8" />
                <defs>
                  <linearGradient id="g1" x1="4" y1="2" x2="28" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06B6D4" /><stop offset="1" stopColor="#0891B2" />
                  </linearGradient>
                  <linearGradient id="g2" x1="10" y1="8" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFF" /><stop offset="1" stopColor="#CFFAFE" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-white to-teal-400 bg-clip-text text-transparent" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                TripGenie
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
            {[
              {
                id: 'dashboard', label: 'Dashboard',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              },
              {
                id: 'users', label: 'Users',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              },
              {
                id: 'admins', label: 'Admins',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100 4m0-4a2 2 0 110 4m-6-8a2 2 0 100-4m0 4a2 2 0 110-4" />
              },
              {
                id: 'trips', label: 'Trip Plans',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              },
              {
                id: 'bookings', label: 'Bookings',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all overflow-hidden
                  ${activeTab === item.id
                    ? 'bg-cyan-500/20 text-white'
                    : 'text-white/70 hover:bg-cyan-500/15 hover:text-white'
                  }`}
              >
                {activeTab === item.id && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-teal-400 rounded-r-full" />
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                {adminName?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{adminName || 'Admin'}</div>
                <div className="text-white/50 text-xs">Administrator</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 flex items-center justify-center transition-all hover:translate-x-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main className="flex-1 ml-72 flex flex-col">
          {/* Header */}
          <header className="bg-white px-12 py-7 border-b border-black/[0.06] flex justify-between items-center shadow-sm sticky top-0 z-10">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-500 to-sky-600 bg-clip-text text-transparent mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'admins' && 'Admin Management'}
                {activeTab === 'trips' && 'Trip Plans Management'}
                {activeTab === 'bookings' && 'Bookings Management'}
              </h1>
              <p className="text-gray-500 text-sm">
                {activeTab === 'dashboard' && "Welcome back! Here's what's happening with TripGenie today."}
                {activeTab === 'users' && 'Manage and monitor all registered users.'}
                {activeTab === 'admins' && 'Manage administrator accounts and permissions.'}
                {activeTab === 'trips' && 'View and manage all trip plans created by users.'}
                {activeTab === 'bookings' && 'Manage flight bookings and update booking statuses.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-cyan-500/20 text-cyan-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center transition-all"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-12 overflow-y-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'users' && <UsersView />}
            {activeTab === 'admins' && <AdminsView />}
            {activeTab === 'trips' && <TripsView />}
            {activeTab === 'bookings' && <BookingsView />}
          </div>
        </main>
      </div>
    </>
  );
};

export default TripGenieAdmin;