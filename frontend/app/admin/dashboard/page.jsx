'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SystemDashboard from '@/components/SystemDashboard';

/**
 * Admin Dashboard Page
 * AI Lead Strategies LLC
 *
 * Protected admin-only page for system monitoring
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('system');

  useEffect(() => {
    // Check admin authentication
    const token = sessionStorage.getItem('admin_token');
    const adminData = sessionStorage.getItem('admin_user');

    if (!token || !adminData) {
      router.push('/admin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(adminData));
    } catch (e) {
      router.push('/admin/login');
      return;
    }

    // Verify token with server
    verifyToken(token);
  }, [router]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      setLoading(false);
    } catch (error) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
      router.push('/admin/login');
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('admin_token');

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
    } catch (e) {
      // Ignore errors during logout
    }

    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-white font-bold">AI Lead Strategies Admin</h1>
              <p className="text-gray-400 text-xs">Internal Management Console</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white text-sm">{admin?.name}</p>
              <p className="text-gray-400 text-xs">{admin?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-4">
            <TabButton
              active={activeTab === 'system'}
              onClick={() => setActiveTab('system')}
            >
              🖥️ System Health
            </TabButton>
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </TabButton>
            <TabButton
              active={activeTab === 'stats'}
              onClick={() => setActiveTab('stats')}
            >
              📊 Platform Stats
            </TabButton>
            {admin?.role === 'super_admin' && (
              <>
                <TabButton
                  active={activeTab === 'admins'}
                  onClick={() => setActiveTab('admins')}
                >
                  🔐 Admin Users
                </TabButton>
                <TabButton
                  active={activeTab === 'audit'}
                  onClick={() => setActiveTab('audit')}
                >
                  📋 Audit Logs
                </TabButton>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main>
        {activeTab === 'system' && <SystemDashboard />}
        {activeTab === 'users' && <UsersPanel />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'admins' && <AdminsPanel />}
        {activeTab === 'audit' && <AuditPanel />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

// Placeholder panels - these would be fully implemented
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Platform Users</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-gray-300">Email</th>
              <th className="px-4 py-3 text-gray-300">Name</th>
              <th className="px-4 py-3 text-gray-300">Tier</th>
              <th className="px-4 py-3 text-gray-300">Status</th>
              <th className="px-4 py-3 text-gray-300">Leads</th>
              <th className="px-4 py-3 text-gray-300">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white">{user.email}</td>
                <td className="px-4 py-3 text-gray-300">{user.name || '-'}</td>
                <td className="px-4 py-3">
                  <TierBadge tier={user.tier} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.subscriptionStatus} />
                </td>
                <td className="px-4 py-3 text-gray-300">{user._count?.leads || 0}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading stats...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Platform Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Users" value={stats?.overview?.totalUsers || 0} icon="👥" />
        <StatCard title="Active Users" value={stats?.overview?.activeUsers || 0} icon="✅" color="green" />
        <StatCard title="Total Leads" value={stats?.overview?.totalLeads || 0} icon="📋" />
        <StatCard title="Campaigns" value={stats?.overview?.totalCampaigns || 0} icon="📧" />
        <StatCard title="New This Week" value={stats?.overview?.recentSignups || 0} icon="🆕" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Users by Tier</h3>
          <div className="space-y-3">
            {Object.entries(stats?.usersByTier || {}).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between">
                <TierBadge tier={parseInt(tier.replace('tier_', ''))} />
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Users by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats?.usersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminsPanel() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Admin User Management</h2>
      <p className="text-gray-400">Manage admin users who can access this dashboard.</p>
      {/* Full implementation would include CRUD for admin users */}
    </div>
  );
}

function AuditPanel() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Audit Logs</h2>
      <p className="text-gray-400">All admin actions are logged for security.</p>
      {/* Full implementation would show audit log table */}
    </div>
  );
}

function StatCard({ title, value, icon, color = 'white' }) {
  const colorClasses = {
    white: 'text-white',
    green: 'text-green-400',
    blue: 'text-blue-400',
    red: 'text-red-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function TierBadge({ tier }) {
  const tierNames = {
    1: { name: 'LeadSite.AI', color: 'bg-blue-600' },
    2: { name: 'LeadSite.IO', color: 'bg-purple-600' },
    3: { name: 'ClientContact.IO', color: 'bg-green-600' },
    4: { name: 'VideoSite.IO', color: 'bg-orange-600' },
    5: { name: 'Tackle.AI', color: 'bg-red-600' }
  };

  const { name, color } = tierNames[tier] || { name: 'Unknown', color: 'bg-gray-600' };

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${color}`}>
      {name}
    </span>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    active: 'bg-green-600',
    trial: 'bg-yellow-600',
    canceled: 'bg-red-600',
    past_due: 'bg-orange-600',
    unknown: 'bg-gray-600'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[status] || statusColors.unknown}`}>
      {status || 'unknown'}
    </span>
  );
}
