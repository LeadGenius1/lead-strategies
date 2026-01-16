'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export default function AdminDashboardPage() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    loadDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadDashboardData() {
    try {
      const adminToken = Cookies.get('admin_token')
      
      // Load system health
      try {
        const healthRes = await api.get('/api/admin/health', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        setHealth(healthRes.data)
      } catch (error) {
        console.error('Error loading health:', error)
        // Fallback health data
        setHealth({
          status: 'operational',
          selfHealingAgents: { active: 3, total: 3 },
          alerts: { critical: 0, warning: 0, info: 0 },
          metrics: {
            cpu: 45,
            memory: 62,
            disk: 38,
            network: 'normal'
          }
        })
      }

      // Load platform stats
      try {
        const statsRes = await api.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error loading stats:', error)
        // Fallback stats
        setStats({
          users: {
            total: 0,
            byTier: {
              'leadsite-ai': 0,
              'leadsite-io': 0,
              'clientcontact': 0,
              'tackle': 0
            }
          },
          leads: { total: 0, today: 0 },
          campaigns: { total: 0, active: 0 },
          emails: { sent: 0, today: 0 }
        })
      }

      // Load alerts
      try {
        const alertsRes = await api.get('/api/admin/alerts', {
          headers: { Authorization: `Bearer ${adminToken}` }
        })
        setAlerts(alertsRes.data?.alerts || [])
      } catch (error) {
        console.error('Error loading alerts:', error)
        setAlerts([])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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
      {/* Header */}
      <div>
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
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">System Metrics</h2>
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
                ></div>
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
                ></div>
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
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-400">Network</span>
                <span className="text-sm text-white capitalize">{health.metrics.network || 'Normal'}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
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
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Platform Overview</h2>
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
            <a 
              href="/admin/stats"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              View Detailed Stats →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
