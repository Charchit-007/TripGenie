import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const TripGenieAdmin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Mock data - Replace with your API calls
  useEffect(() => {
    // Simulate API call
    setUsers([
      { id: 1, name: 'Charchit Suthar', email: 'charchit@example.com', joinDate: '2024-01-15', totalTrips: 3, status: 'active' },
      { id: 2, name: 'Jinisha Dsouza', email: 'jinisha@example.com', joinDate: '2024-02-20', totalTrips: 5, status: 'active' },
      { id: 3, name: 'Flavia Dmello', email: 'flavia@example.com', joinDate: '2024-03-10', totalTrips: 1, status: 'inactive' },
    ]);

    setTrips([
      { id: 1, userId: 1, userName: 'Charchit Suthar', destination: 'Paris, France', startDate: '2024-06-15', endDate: '2024-06-22', budget: 2500, tripType: 'Leisure', status: 'planned', planGenerated: true },
      { id: 2, userId: 2, userName: 'Jinisha Dsouza', destination: 'Tokyo, Japan', startDate: '2024-07-10', endDate: '2024-07-20', budget: 3500, tripType: 'Adventure', status: 'planning', planGenerated: false },
      { id: 3, userId: 1, userName: 'Charchit Suthar', destination: 'Barcelona, Spain', startDate: '2024-08-05', endDate: '2024-08-12', budget: 2000, tripType: 'Cultural', status: 'planned', planGenerated: true },
      { id: 4, userId: 3, userName: 'Flavia Dmello', destination: 'New York, USA', startDate: '2024-05-20', endDate: '2024-05-25', budget: 1800, tripType: 'Business', status: 'completed', planGenerated: true },
    ]);
  }, []);

  // Analytics data
  const tripTypeData = [
    { name: 'Leisure', value: 35 },
    { name: 'Adventure', value: 25 },
    { name: 'Cultural', value: 20 },
    { name: 'Business', value: 12 },
    { name: 'Relaxation', value: 8 },
  ];

  const monthlyPlans = [
    { month: 'Jan', plans: 45 },
    { month: 'Feb', plans: 52 },
    { month: 'Mar', plans: 61 },
    { month: 'Apr', plans: 58 },
    { month: 'May', plans: 70 },
    { month: 'Jun', plans: 85 },
  ];

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
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-change positive">+12% from last month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Trip Plans Created</div>
            <div className="stat-value">{trips.length}</div>
            <div className="stat-change positive">+18% from last month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Plans</div>
            <div className="stat-value">{trips.filter(t => t.status === 'planned').length}</div>
            <div className="stat-change neutral">Plans in use</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Plans in Progress</div>
            <div className="stat-value">{trips.filter(t => t.status === 'planning').length}</div>
            <div className="stat-change neutral">Being generated</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-card">
          <h3 className="chart-title">Monthly Trip Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPlans}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '2px solid #06B6D4', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }} 
              />
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

        <div className="chart-card">
          <h3 className="chart-title">Trip Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tripTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="chart-card">
        <h3 className="chart-title">User Growth Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                background: '#fff', 
                border: '2px solid #14B8A6', 
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#14B8A6" 
              strokeWidth={3}
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const UsersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="section-title">User Management</h2>
        <button className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Trip Plans</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-info">{user.totalTrips} plans</span>
                </td>
                <td>
                  <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="action-btn">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="action-btn delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TripsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="section-title">Trip Plans Management</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="search-box">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search trip plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>User</th>
              <th>Destination</th>
              <th>Travel Dates</th>
              <th>Budget</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.map(trip => (
              <tr key={trip.id}>
                <td className="font-mono text-sm">#{trip.id.toString().padStart(4, '0')}</td>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{trip.userName.charAt(0)}</div>
                    <span className="font-medium">{trip.userName}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {trip.destination}
                  </div>
                </td>
                <td className="text-sm">
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </td>
                <td className="font-semibold text-cyan-600">${trip.budget.toLocaleString()}</td>
                <td>
                  <span className="badge badge-purple">{trip.tripType}</span>
                </td>
                <td>
                  <span className={`status-badge ${
                    trip.status === 'planned' ? 'status-planned' :
                    trip.status === 'planning' ? 'status-planning' :
                    'status-completed'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="action-btn">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-2xl font-bold">Trip Plan Details</h3>
              <button onClick={() => setSelectedTrip(null)} className="modal-close">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Plan ID</span>
                  <span className="detail-value">#{selectedTrip.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User</span>
                  <span className="detail-value">{selectedTrip.userName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Destination</span>
                  <span className="detail-value">{selectedTrip.destination}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">{new Date(selectedTrip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date</span>
                  <span className="detail-value">{new Date(selectedTrip.endDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User Budget</span>
                  <span className="detail-value">${selectedTrip.budget.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trip Type</span>
                  <span className="detail-value">{selectedTrip.tripType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`status-badge ${
                    selectedTrip.status === 'planned' ? 'status-planned' :
                    selectedTrip.status === 'planning' ? 'status-planning' :
                    'status-completed'
                  }`}>
                    {selectedTrip.status}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Plan Generated</span>
                  <span className="detail-value">
                    {selectedTrip.planGenerated ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Yes - Plan is ready
                      </span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        In Progress
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedTrip(null)}>Close</button>
              <button className="btn-primary">View Full Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 14L16 26L28 14L16 2Z" fill="url(#gradient1)" />
              <path d="M16 8L10 14L16 20L22 14L16 8Z" fill="url(#gradient2)" opacity="0.8" />
              <defs>
                <linearGradient id="gradient1" x1="4" y1="2" x2="28" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06B6D4" />
                  <stop offset="1" stopColor="#0891B2" />
                </linearGradient>
                <linearGradient id="gradient2" x1="10" y1="8" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF" />
                  <stop offset="1" stopColor="#CFFAFE" />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">TripGenie</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>

          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>

          <button 
            className={`nav-item ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Trip Plans
          </button>

          <button className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>

          <button className="nav-item">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <div className="admin-name">Admin</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
          <button className="logout-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'trips' && 'Trip Plans Management'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Welcome back! Here\'s what\'s happening with TripGenie today.'}
              {activeTab === 'users' && 'Manage and monitor all registered users.'}
              {activeTab === 'trips' && 'View and manage all trip plans created by users.'}
            </p>
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'trips' && <TripsView />}
        </div>
      </main>
        <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .admin-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
          font-family: 'Outfit', sans-serif;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #0e7490 0%, #155e75 100%);
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
        }

        .sidebar-header {
          padding: 0 2rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          background: linear-gradient(135deg, #06B6D4 0%, #FFF 50%, #14B8A6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-menu {
          flex: 1;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #06B6D4 0%, #14B8A6 100%);
          transform: scaleY(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:hover {
          background: rgba(6, 182, 212, 0.15);
          color: #fff;
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%);
          color: #fff;
        }

        .nav-item.active::before {
          transform: scaleY(1);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.1rem;
        }

        .admin-name {
          font-weight: 600;
          color: white;
          font-size: 0.9rem;
        }

        .admin-role {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .logout-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.15);
          border: none;
          color: #06B6D4;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          background: rgba(6, 182, 212, 0.25);
          transform: translateX(2px);
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }

        .content-header {
          background: white;
          padding: 2rem 3rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
          border: 1px solid rgba(6, 182, 212, 0.2);
          color: #06B6D4;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .content-body {
          flex: 1;
          padding: 3rem;
          overflow-y: auto;
        }

        /* Stats Cards */
        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          display: flex;
          gap: 1.25rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
          margin-bottom: 0.5rem;
          display: block;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          color: #0e7490;
          margin-bottom: 0.5rem;
          display: block;
        }

        .stat-change {
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.neutral {
          color: #6b7280;
        }

        /* Charts */
        .chart-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: 'Bricolage Grotesque', sans-serif;
          color: #0e7490;
          margin-bottom: 1.5rem;
        }

        /* Buttons */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          color: white;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          background: white;
          color: #06B6D4;
          font-weight: 600;
          border: 2px solid #06B6D4;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-secondary:hover {
          background: rgba(6, 182, 212, 0.1);
        }

        /* Table Styles */
        .table-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead {
          background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
        }

        .data-table th {
          padding: 1.25rem 1.5rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.875rem;
          color: #0e7490;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table td {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          color: #333;
        }

        .data-table tbody tr {
          transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1rem;
        }

        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .badge-info {
          background: rgba(6, 182, 212, 0.1);
          color: #0891B2;
        }

        .badge-purple {
          background: rgba(168, 85, 247, 0.1);
          color: #7c3aed;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-active {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-inactive {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .status-planned {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-planning {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .status-completed {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(6, 182, 212, 0.1);
          border: none;
          color: #06B6D4;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: #06B6D4;
          color: white;
          transform: scale(1.1);
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .action-btn.delete:hover {
          background: #ef4444;
          color: white;
        }

        /* Search and Filter */
        .search-box {
          flex: 1;
          max-width: 400px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border-radius: 12px;
          border: 2px solid rgba(6, 182, 212, 0.2);
          background: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #06B6D4;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        .filter-select {
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          border: 2px solid rgba(6, 182, 212, 0.2);
          background: white;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #06B6D4;
          box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          justify-space-between;
          align-items: center;
        }

        .modal-close {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.1);
          border: none;
          color: #06B6D4;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #06B6D4;
          color: white;
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .detail-value {
          font-size: 1rem;
          color: #0e7490;
          font-weight: 600;
        }

        .modal-footer {
          padding: 2rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .section-title {
          font-size: 1.75rem;
          font-weight: 800;
          font-family: 'Bricolage Grotesque', sans-serif;
          color: #0e7490;
        }

        .space-y-6 > * + * {
          margin-top: 1.5rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            width: 240px;
          }

          .main-content {
            margin-left: 240px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
            transition: left 0.3s ease;
          }

          .main-content {
            margin-left: 0;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TripGenieAdmin;