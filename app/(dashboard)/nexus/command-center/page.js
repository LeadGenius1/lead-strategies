'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Shield, Activity, Users, Mail, Target, Globe, RefreshCw } from 'lucide-react';

function MetricCard({ label, value, sub, icon: Icon, color = 'indigo' }) {
  const colors = {
    emerald: 'border-emerald-500/20 text-emerald-400',
    amber: 'border-amber-500/20 text-amber-400',
    indigo: 'border-indigo-500/20 text-indigo-400',
    cyan: 'border-cyan-500/20 text-cyan-400',
    neutral: 'border-white/10 text-neutral-300',
  };
  return (
    <div className={`rounded-xl border ${colors[color] || colors.indigo} bg-white/[0.02] p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-4 w-4 opacity-60" />}
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function CommandCenterPage() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    const adminToken = Cookies.get('admin_token');
    const token = Cookies.get('token');
    const authToken = adminToken || token;
    if (!authToken) return;

    const headers = { Authorization: `Bearer ${authToken}` };
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

    const [h, s] = await Promise.all([
      fetch('/api/admin/health', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${apiUrl}/api/admin/stats`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    setHealth(h);
    setStats(s);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    const adminToken = Cookies.get('admin_token');
    const adminUser = Cookies.get('admin_user');
    if (!adminToken || !adminUser) {
      setLoading(false);
      return;
    }

    try {
      const data = JSON.parse(adminUser);
      if (data.role === 'admin' || data.role === 'super_admin') {
        setIsAdmin(true);
      }
    } catch { /* non-critical */ }

    fetchData().finally(() => setLoading(false));

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-2">Admin Access Required</h2>
          <p className="text-sm text-neutral-500">The Command Center is restricted to AILS administrators.</p>
        </div>
      </div>
    );
  }

  const systemStatus = health?.status || 'unknown';
  const isOperational = systemStatus === 'operational';
  const agents = health?.selfHealingAgents || { active: 0, total: 0 };
  const alerts = health?.alerts || { critical: 0, warning: 0, info: 0 };
  const metrics = health?.metrics || {};

  const users = stats?.users || { total: 0, today: 0 };
  const leads = stats?.leads || { total: 0, today: 0 };
  const campaigns = stats?.campaigns || { total: 0, active: 0 };
  const emails = stats?.emails || { sent: 0, today: 0 };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-semibold text-white uppercase tracking-wide">Command Center</h1>
          </div>
          <p className="text-xs text-neutral-500">System-wide monitoring for AILS administrators</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] text-neutral-600">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 transition"
          >
            Full Admin Panel
          </Link>
        </div>
      </div>

      {/* System Health */}
      <div className={`rounded-xl border p-5 ${
        isOperational
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOperational ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
            <div>
              <h2 className={`text-sm font-semibold ${isOperational ? 'text-emerald-400' : 'text-red-400'}`}>
                {isOperational ? 'All Systems Operational' : 'System Degraded'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Self-healing agents: {agents.active}/{agents.total} active
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            {alerts.critical > 0 && (
              <span className="text-red-400">Critical: {alerts.critical}</span>
            )}
            {alerts.warning > 0 && (
              <span className="text-amber-400">Warnings: {alerts.warning}</span>
            )}
            {alerts.critical === 0 && alerts.warning === 0 && (
              <span className="text-neutral-500">No alerts</span>
            )}
          </div>
        </div>

        {/* Resource metrics */}
        {metrics.cpu !== undefined && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
            {[
              { label: 'CPU', value: metrics.cpu },
              { label: 'Memory', value: metrics.memory },
              { label: 'Disk', value: metrics.disk },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                  <span>{m.label}</span>
                  <span>{m.value}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      m.value > 80 ? 'bg-red-500' : m.value > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Metrics */}
      <div>
        <h2 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-3">Platform Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Users" value={users.total} sub={`+${users.today} today`} icon={Users} color="indigo" />
          <MetricCard label="Leads" value={leads.total} sub={`+${leads.today} today`} icon={Target} color="emerald" />
          <MetricCard label="Campaigns" value={campaigns.total} sub={`${campaigns.active} active`} icon={Mail} color="amber" />
          <MetricCard label="Emails Sent" value={emails.sent} sub={`+${emails.today} today`} icon={Globe} color="cyan" />
        </div>
      </div>

      {/* User Breakdown */}
      {stats?.users?.byTier && (
        <div>
          <h2 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-3">Users by Platform</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(stats.users.byTier).map(([tier, count]) => (
              <div key={tier} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{tier.replace(/-/g, ' ')}</p>
                <p className="text-lg font-semibold text-neutral-300">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users', href: '/admin/users', icon: Users },
            { label: 'View Audit Log', href: '/admin/audit', icon: Shield },
            { label: 'Platform Status', href: '/admin/platforms', icon: Globe },
            { label: 'AI Cockpit', href: '/nexus/cockpit', icon: Activity },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-neutral-400 hover:text-white hover:border-white/20 transition"
            >
              <action.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
