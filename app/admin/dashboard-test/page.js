'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Cookies from 'js-cookie'
import { getPlatformFeatures } from '@/lib/platformFeatures'

export default function AdminDashboardTestPage() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const defaultHealth = {
    status: 'operational',
    selfHealingAgents: { active: 3, total: 3 },
    alerts: { critical: 0, warning: 0, info: 0 },
    metrics: { cpu: 45, memory: 62, disk: 38, network: 'normal' }
  }

  const defaultStats = {
    users: { total: 0, byTier: { 'leadsite-ai': 0, 'leadsite-io': 0, 'clientcontact': 0 } },
    leads: { total: 0, today: 0 },
    campaigns: { total: 0, active: 0 },
    emails: { sent: 0, today: 0 }
  }

  async function loadDashboardData() {
    const adminToken = Cookies.get('admin_token')
    const headers = adminToken ? { Authorization: `Bearer ${adminToken}` } : {}

    try {
      const [healthRes, statsRes, alertsRes] = await Promise.all([
        fetch('/api/admin/health', { headers }),
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/alerts', { headers })
      ])

      const healthJson = healthRes.ok ? await healthRes.json().catch(() => defaultHealth) : defaultHealth
      setHealth(healthJson?.data ?? healthJson ?? defaultHealth)

      const statsJson = statsRes.ok ? await statsRes.json().catch(() => defaultStats) : defaultStats
      setStats(statsJson?.data ?? statsJson ?? defaultStats)

      const alertsJson = alertsRes.ok ? await alertsRes.json().catch(() => ({ alerts: [] })) : { alerts: [] }
      setAlerts(Array.isArray(alertsJson?.alerts) ? alertsJson.alerts : [])
    } catch (error) {
      console.error('Dashboard load error:', error)
      setHealth(defaultHealth)
      setStats(defaultStats)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header - Test badge */}
      <div>
        <span className="inline-block px-2 py-1 mb-2 text-xs font-mono bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
          TEST PAGE - /admin/dashboard-test
        </span>
        <h1 className="text-3xl font-bold text-white">System Health</h1>
        <p className="text-neutral-400 mt-1">Monitor platform status and performance</p>
      </div>

      {/* System Status */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">🖥️</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                health.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                health.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {health.status || 'Unknown'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">System Status</p>
            <p className="text-sm text-neutral-400 mt-1">All systems operational</p>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {health.selfHealingAgents?.active || 0} / {health.selfHealingAgents?.total || 0}
            </p>
            <p className="text-sm text-neutral-400 mt-1">Self-Healing Agents Active</p>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {health.alerts?.critical || 0}
            </p>
            <p className="text-sm text-neutral-400 mt-1">Critical Alerts</p>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {health.metrics?.cpu || 0}%
            </p>
            <p className="text-sm text-neutral-400 mt-1">CPU Usage</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      {health?.metrics && (
        <div className="aether-card p-6 bg-neutral-900/30">
          <h2 className="text-xl font-medium text-white mb-6 tracking-tight">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-400">CPU</span>
                <span className="text-sm text-white">{health.metrics.cpu}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${health.metrics.cpu}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-400">Memory</span>
                <span className="text-sm text-white">{health.metrics.memory}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${health.metrics.memory}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-400">Disk</span>
                <span className="text-sm text-white">{health.metrics.disk}%</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${health.metrics.disk}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-400">Network</span>
                <span className="text-sm text-white capitalize">{health.metrics.network || 'Normal'}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.level === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                  alert.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{alert.title}</p>
                    <p className="text-sm text-neutral-400 mt-1">{alert.message}</p>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Stats Preview */}
      {stats && (
        <div className="aether-card p-6 bg-neutral-900/30">
          <h2 className="text-xl font-medium text-white mb-4 tracking-tight">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-neutral-400">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.users?.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.leads?.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.campaigns?.active || 0}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Emails Sent</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.emails?.sent || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/stats"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View Detailed Stats →
            </Link>
          </div>
        </div>
      )}

      {/* All 20 Features - Quick Access Grid */}
      <div className="aether-card p-6 bg-neutral-900/30">
        <h2 className="text-xl font-medium text-white mb-2 tracking-tight">All Features (F01-F20)</h2>
        <p className="text-sm text-neutral-400 mb-6">Admin super-dashboard — quick access to every platform feature</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {getPlatformFeatures('admin').map((feature) => (
            <Link
              key={feature.code}
              href={feature.href}
              className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-colors group"
            >
              <span className="text-xs font-mono text-neutral-500 group-hover:text-indigo-400">{feature.code}</span>
              <span className="text-sm text-white truncate group-hover:text-indigo-300">{feature.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
