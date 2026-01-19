'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { 
  Target, 
  Mail, 
  Users, 
  TrendingUp, 
  Zap, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeCampaigns: 0,
    emailsSent: 0,
    replyRate: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Load stats from various endpoints
      const [leadsRes, campaignsRes] = await Promise.all([
        api.get('/api/leads').catch(() => ({ data: { leads: [] } })),
        api.get('/api/campaigns').catch(() => ({ data: [] }))
      ])

      const leads = leadsRes.data?.leads || leadsRes.data || []
      const campaigns = campaignsRes.data || []

      setStats({
        totalLeads: leads.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        emailsSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
        replyRate: 24.5
      })

      // Mock recent activity
      setRecentActivity([
        { type: 'lead', message: 'New lead discovered: Sarah Chen, CTO at CloudScale', time: '2 min ago' },
        { type: 'email', message: 'Email opened by Michael Torres', time: '15 min ago' },
        { type: 'reply', message: 'Reply received from Jennifer Park', time: '1 hour ago' },
        { type: 'campaign', message: 'Campaign "Q1 SaaS Outreach" completed', time: '3 hours ago' },
      ])
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      label: 'Total Leads', 
      value: stats.totalLeads, 
      change: '+12%', 
      positive: true,
      icon: Users,
      color: 'indigo'
    },
    { 
      label: 'Active Campaigns', 
      value: stats.activeCampaigns, 
      change: '+3', 
      positive: true,
      icon: Zap,
      color: 'purple'
    },
    { 
      label: 'Emails Sent', 
      value: stats.emailsSent.toLocaleString(), 
      change: '+847', 
      positive: true,
      icon: Mail,
      color: 'cyan'
    },
    { 
      label: 'Reply Rate', 
      value: `${stats.replyRate}%`, 
      change: '+2.3%', 
      positive: true,
      icon: TrendingUp,
      color: 'emerald'
    },
  ]

  const quickActions = [
    { label: 'Find New Leads', href: '/copilot', icon: Target },
    { label: 'Create Campaign', href: '/dashboard/campaigns', icon: Zap },
    { label: 'View Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ]

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Dashboard</h1>
            <p className="text-neutral-500 mt-1 text-sm">Welcome back. Here's your lead generation overview.</p>
          </div>
          <Link
            href="/copilot"
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Open Lead Hunter
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative p-6 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-medium text-white">{stat.value}</p>
                  <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
            <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">{action.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-indigo-400 ml-auto transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
            <h2 className="text-lg font-medium text-white mb-4">Recent Activity</h2>
            {loading ? (
              <p className="text-neutral-500 text-sm">Loading activity...</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'lead' ? 'bg-indigo-500/20 text-indigo-400' :
                      activity.type === 'email' ? 'bg-cyan-500/20 text-cyan-400' :
                      activity.type === 'reply' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {activity.type === 'lead' && <Target className="w-4 h-4" />}
                      {activity.type === 'email' && <Mail className="w-4 h-4" />}
                      {activity.type === 'reply' && <CheckCircle2 className="w-4 h-4" />}
                      {activity.type === 'campaign' && <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-300">{activity.message}</p>
                      <p className="text-xs text-neutral-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
