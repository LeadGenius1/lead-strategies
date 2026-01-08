'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '../../../lib/auth'
import { analyticsAPI } from '../../../lib/api'
import StatsCard from '../../../components/Dashboard/StatsCard'
import { Mail, Users, TrendingUp, BarChart3, Calendar, Download } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const range = dateRange === '7days' ? { days: 7 } :
                     dateRange === '30days' ? { days: 30 } :
                     dateRange === '90days' ? { days: 90 } : {}
        const data = await analyticsAPI.getOverview(range)
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-slate-300">Track your campaign performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Emails Sent"
            value={analytics?.total_sent || 0}
            change={analytics?.sent_change ? `+${analytics.sent_change}%` : undefined}
            icon={Mail}
            trend="up"
          />
          <StatsCard
            title="Open Rate"
            value={`${analytics?.open_rate || 0}%`}
            change={analytics?.open_change ? `+${analytics.open_change}%` : undefined}
            icon={BarChart3}
            trend="up"
          />
          <StatsCard
            title="Reply Rate"
            value={`${analytics?.reply_rate || 0}%`}
            change={analytics?.reply_change ? `+${analytics.reply_change}%` : undefined}
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Active Leads"
            value={analytics?.active_leads || 0}
            change={analytics?.leads_change ? `+${analytics.leads_change}%` : undefined}
            icon={Users}
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Email Performance</h2>
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Breakdown</h2>
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {analytics?.recent_activity && analytics.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white">{activity.description}</p>
                    <p className="text-sm text-slate-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}




