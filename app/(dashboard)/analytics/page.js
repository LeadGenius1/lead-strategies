'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { BarChart3, TrendingUp, Users, Mail, Target, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      const response = await api.get('/api/analytics')
      setData(response.data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Mock data for demo
      setData({
        overview: {
          totalLeads: 1247,
          leadsChange: 12.5,
          emailsSent: 8453,
          emailsChange: 8.2,
          replyRate: 24.7,
          replyChange: 2.1,
          conversionRate: 3.2,
          conversionChange: 0.5
        },
        weeklyData: [
          { day: 'Mon', leads: 45, emails: 312 },
          { day: 'Tue', leads: 52, emails: 287 },
          { day: 'Wed', leads: 61, emails: 345 },
          { day: 'Thu', leads: 38, emails: 298 },
          { day: 'Fri', leads: 72, emails: 412 },
          { day: 'Sat', leads: 28, emails: 156 },
          { day: 'Sun', leads: 19, emails: 98 },
        ],
        topCampaigns: [
          { name: 'Q1 SaaS Outreach', sent: 2341, opens: 892, replies: 156, rate: 6.7 },
          { name: 'Healthcare Directors', sent: 1876, opens: 654, replies: 98, rate: 5.2 },
          { name: 'Tech CTOs 2025', sent: 1432, opens: 512, replies: 87, rate: 6.1 },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { 
      label: 'Total Leads', 
      value: data?.overview?.totalLeads?.toLocaleString() || '0', 
      change: data?.overview?.leadsChange || 0, 
      icon: Users, 
      color: 'indigo' 
    },
    { 
      label: 'Emails Sent', 
      value: data?.overview?.emailsSent?.toLocaleString() || '0', 
      change: data?.overview?.emailsChange || 0, 
      icon: Mail, 
      color: 'cyan' 
    },
    { 
      label: 'Reply Rate', 
      value: `${data?.overview?.replyRate || 0}%`, 
      change: data?.overview?.replyChange || 0, 
      icon: TrendingUp, 
      color: 'emerald' 
    },
    { 
      label: 'Conversion', 
      value: `${data?.overview?.conversionRate || 0}%`, 
      change: data?.overview?.conversionChange || 0, 
      icon: Target, 
      color: 'purple' 
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen p-6 font-sans">
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">Analytics</h1>
          <p className="text-neutral-500 mt-1 text-sm font-light">Track your lead generation performance</p>
        </div>

        {/* Stats Grid – Aether cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const isPositive = stat.change >= 0
            return (
              <div
                key={stat.label}
                className="aether-card p-6 bg-neutral-900/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </span>
                </div>
                <p className="text-3xl font-medium text-white">{stat.value}</p>
                <p className="text-sm text-neutral-500 mt-1 font-light">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white">Weekly Activity</h2>
              <select className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-400 focus:outline-none">
                <option>This Week</option>
                <option>Last Week</option>
                <option>Last Month</option>
              </select>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {data?.weeklyData?.map((item, index) => {
                const maxLeads = Math.max(...data.weeklyData.map(d => d.leads))
                const height = (item.leads / maxLeads) * 100
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center gap-1">
                      <span className="text-xs text-indigo-400">{item.leads}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      ></div>
                    </div>
                    <span className="text-xs text-neutral-500">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Campaigns */}
          <div className="aether-card p-6 bg-neutral-900/30">
            <h2 className="text-lg font-medium text-white mb-6">Top Campaigns</h2>
            <div className="space-y-4">
              {data?.topCampaigns?.map((campaign, index) => (
                <div key={campaign.name} className="p-4 rounded-xl bg-black/50 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-neutral-500/20 text-neutral-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-medium text-white">{campaign.name}</span>
                    </div>
                    <span className="text-sm text-emerald-400 font-medium">{campaign.rate}%</span>
                  </div>
                  <div className="flex gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {campaign.sent.toLocaleString()} sent
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {campaign.opens.toLocaleString()} opens
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {campaign.replies} replies
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <h2 className="text-lg font-medium text-white mb-6">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Open Rate', value: 38.2, target: 35, unit: '%' },
              { label: 'Click Rate', value: 12.4, target: 10, unit: '%' },
              { label: 'Bounce Rate', value: 2.1, target: 5, unit: '%', inverse: true },
            ].map((metric) => {
              const progress = metric.inverse 
                ? ((metric.target - metric.value) / metric.target) * 100 + 100
                : (metric.value / metric.target) * 100
              const isGood = metric.inverse ? metric.value < metric.target : metric.value >= metric.target
              return (
                <div key={metric.label} className="p-4 rounded-xl bg-black/50 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-neutral-400">{metric.label}</span>
                    <span className={`text-sm font-medium ${isGood ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Target: {metric.target}{metric.unit}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
