'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const adminToken = Cookies.get('admin_token')
      const response = await api.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      setStats(response.data)
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
            'clientcontact': 0
          }
        },
        leads: { total: 0, today: 0 },
        campaigns: { total: 0, active: 0 },
        emails: { sent: 0, today: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-400">Loading stats...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Stats</h1>
        <p className="text-neutral-400 mt-1">Comprehensive platform analytics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-neutral-400">Total Users</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.users?.total || 0}</p>
        </div>
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-neutral-400">Total Leads</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.leads?.total || 0}</p>
        </div>
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-neutral-400">Active Campaigns</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.campaigns?.active || 0}</p>
        </div>
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-neutral-400">Emails Sent</p>
          <p className="text-3xl font-bold text-white mt-2">{stats?.emails?.sent || 0}</p>
        </div>
      </div>

      {/* Users by Tier */}
      {stats?.users?.byTier && (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Users by Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.users.byTier).map(([tier, count]) => (
              <div key={tier} className="p-4 bg-[#030303] rounded-lg">
                <p className="text-sm text-neutral-400">{tier.replace('-', ' ').toUpperCase()}</p>
                <p className="text-2xl font-bold text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Activity */}
      <div className="bg-[#050505] border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Today's Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-neutral-400">Leads Added Today</p>
            <p className="text-2xl font-bold text-white mt-2">{stats?.leads?.today || 0}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Emails Sent Today</p>
            <p className="text-2xl font-bold text-white mt-2">{stats?.emails?.today || 0}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">New Users Today</p>
            <p className="text-2xl font-bold text-white mt-2">{stats?.users?.today || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
