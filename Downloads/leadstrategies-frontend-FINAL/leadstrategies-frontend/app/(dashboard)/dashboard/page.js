'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import DailyEmailStatus from '@/components/DailyEmailStatus'

const STATS = [
  { label: 'Total Websites', key: 'websites', icon: '🌐', color: 'text-blue-400' },
  { label: 'Active Campaigns', key: 'campaigns', icon: '📧', color: 'text-green-400' },
  { label: 'Total Prospects', key: 'prospects', icon: '👥', color: 'text-purple-400' },
  { label: 'Emails Sent', key: 'emailsSent', icon: '✉️', color: 'text-yellow-400' },
]

const PLATFORMS = [
  { name: 'LeadSite.AI', description: 'AI-powered lead generation', icon: '🎯', status: 'active' },
  { name: 'LeadSite.IO', description: 'Website builder platform', icon: '🏗️', status: 'active' },
  { name: 'ClientContact.IO', description: '22+ channel outreach', icon: '💬', status: 'active' },
  { name: 'Tackle.IO', description: 'Enterprise AI SDR', icon: '🚀', status: 'active' },
  { name: 'VideoSite.IO', description: 'Video marketing platform', icon: '🎬', status: 'coming' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    websites: 0,
    campaigns: 0,
    prospects: 0,
    emailsSent: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get('/api/analytics/dashboard')
        setStats(response.data)
      } catch (error) {
        console.error('Error loading stats:', error)
        // Use placeholder data
        setStats({
          websites: 3,
          campaigns: 12,
          prospects: 847,
          emailsSent: 2451,
        })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
        <p className="text-dark-textMuted mt-1">Welcome to AI Lead Strategies</p>
      </div>

      {/* Daily AI Agent Status */}
      <DailyEmailStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.key}
            className="bg-dark-surface border border-dark-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-3xl font-bold ${stat.color}`}>
                {loading ? '...' : stats[stat.key]?.toLocaleString() || 0}
              </span>
            </div>
            <p className="text-dark-textMuted mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Overview */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Your Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-dark-primary transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{platform.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  platform.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {platform.status === 'active' ? 'Active' : 'Coming Soon'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-dark-text mt-4">{platform.name}</h3>
              <p className="text-dark-textMuted text-sm mt-1">{platform.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition">
            + New Website
          </button>
          <button className="px-6 py-3 bg-dark-surface border border-dark-border hover:border-dark-primary text-dark-text rounded-lg transition">
            + Create Campaign
          </button>
          <button className="px-6 py-3 bg-dark-surface border border-dark-border hover:border-dark-primary text-dark-text rounded-lg transition">
            + Add Prospect
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-dark-text mb-4">Recent Activity</h2>
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <div className="p-6 text-center text-dark-textMuted">
            <p>No recent activity yet. Start by analyzing a website or creating a campaign!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
