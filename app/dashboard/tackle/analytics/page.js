'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/contexts/AuthContext'
import { analyticsAPI } from '@/lib/api'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [salesData, setSalesData] = useState(null)
  const [pipelineData, setPipelineData] = useState(null)
  const [activityData, setActivityData] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/dashboard/tackle/analytics')
      return
    }

    if (user.tier < 5) {
      router.push('/dashboard')
      return
    }

    fetchAnalytics()
  }, [router, user, authLoading, dateRange])

  const fetchAnalytics = async () => {
    try {
      const [sales, pipeline, activities, leaders, forecastData] = await Promise.all([
        analyticsAPI.getSalesOverview({ range: dateRange }).catch(() => ({})),
        analyticsAPI.getPipelineMetrics({ range: dateRange }).catch(() => ({})),
        analyticsAPI.getActivityMetrics({ range: dateRange }).catch(() => ({})),
        analyticsAPI.getLeaderboard({ range: dateRange }).catch(() => ({ leaderboard: [] })),
        analyticsAPI.getForecast().catch(() => ({}))
      ])

      setSalesData(sales)
      setPipelineData(pipeline)
      setActivityData(activities)
      setLeaderboard(leaders.leaderboard || [])
      setForecast(forecastData)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons()
          }
        }}
      />

      <div className="bg-[#050505] text-white antialiased min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <i data-lucide="target" className="w-4 h-4 text-white"></i>
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-white">Tackle.IO</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/deals" className="hover:text-white transition-colors">Deals</Link>
              <Link href="/dashboard/contacts" className="hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/companies" className="hover:text-white transition-colors">Companies</Link>
              <Link href="/dashboard/activities" className="hover:text-white transition-colors">Activities</Link>
              <Link href="/dashboard/analytics" className="text-white">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="ytd">Year to Date</option>
              </select>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Sales Analytics</h1>
            <p className="text-zinc-400 text-sm">Track your team's performance and revenue metrics.</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <i data-lucide="dollar-sign" className="w-4 h-4"></i>
                Revenue Won
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(salesData?.revenueWon)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <i data-lucide="trending-up" className="w-3 h-3 text-green-400"></i>
                <span className="text-green-400">+{formatPercentage(salesData?.revenueChange)}</span>
                <span className="text-zinc-500">vs last period</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <i data-lucide="briefcase" className="w-4 h-4"></i>
                Deals Closed
              </div>
              <div className="text-3xl font-bold text-white">
                {salesData?.dealsClosed || 0}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <i data-lucide="target" className="w-3 h-3 text-orange-400"></i>
                <span className="text-zinc-400">Win rate: {formatPercentage(salesData?.winRate)}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <i data-lucide="activity" className="w-4 h-4"></i>
                Avg Deal Size
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(salesData?.avgDealSize)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <i data-lucide="clock" className="w-3 h-3 text-blue-400"></i>
                <span className="text-zinc-400">Avg cycle: {salesData?.avgCycle || 0} days</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <i data-lucide="pie-chart" className="w-4 h-4"></i>
                Pipeline Value
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(pipelineData?.totalValue)}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs">
                <span className="text-zinc-400">{pipelineData?.openDeals || 0} open deals</span>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Pipeline by Stage */}
            <div className="rounded-2xl bg-zinc-900/30 border border-white/5 p-6">
              <h2 className="text-lg font-medium text-white mb-6">Pipeline by Stage</h2>
              <div className="space-y-4">
                {(pipelineData?.stages || []).map((stage) => (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{stage.name}</span>
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(stage.value)} ({stage.count})
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${stage.percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="rounded-2xl bg-zinc-900/30 border border-white/5 p-6">
              <h2 className="text-lg font-medium text-white mb-6">Activity Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <i data-lucide="phone" className="w-4 h-4"></i>
                    <span className="text-xs">Calls Made</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activityData?.calls || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <i data-lucide="mail" className="w-4 h-4"></i>
                    <span className="text-xs">Emails Sent</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activityData?.emails || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <i data-lucide="calendar" className="w-4 h-4"></i>
                    <span className="text-xs">Meetings Held</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activityData?.meetings || 0}</div>
                </div>
                <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <i data-lucide="check-square" className="w-4 h-4"></i>
                    <span className="text-xs">Tasks Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{activityData?.tasks || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Forecast */}
            <div className="rounded-2xl bg-zinc-900/30 border border-white/5 p-6">
              <h2 className="text-lg font-medium text-white mb-6">Sales Forecast</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Committed</span>
                    <span className="text-sm font-medium text-green-400">
                      {formatCurrency(forecast?.committed)}
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Best Case</span>
                    <span className="text-sm font-medium text-blue-400">
                      {formatCurrency(forecast?.bestCase)}
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Pipeline</span>
                    <span className="text-sm font-medium text-orange-400">
                      {formatCurrency(forecast?.pipeline)}
                    </span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
              {forecast?.quota && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Quota Attainment</span>
                    <span className="text-lg font-bold text-white">
                      {formatPercentage((forecast.committed / forecast.quota) * 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Team Leaderboard */}
            <div className="rounded-2xl bg-zinc-900/30 border border-white/5 p-6">
              <h2 className="text-lg font-medium text-white mb-6">Team Leaderboard</h2>
              <div className="space-y-4">
                {leaderboard.length > 0 ? (
                  leaderboard.map((rep, index) => (
                    <div
                      key={rep.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                          index === 2 ? 'bg-orange-600/20 text-orange-500' :
                          'bg-zinc-700/50 text-zinc-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-medium">
                          {rep.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{rep.name}</div>
                          <div className="text-xs text-zinc-400">{rep.deals} deals</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-400">
                          {formatCurrency(rep.revenue)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    No leaderboard data available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
