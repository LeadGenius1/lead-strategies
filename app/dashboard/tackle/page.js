'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/contexts/AuthContext'
import { tackleAPI, dealsAPI, activitiesAPI, analyticsAPI } from '@/lib/api'

export default function TackleDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [stats, setStats] = useState({
    totalDeals: 0,
    pipelineValue: 0,
    wonDeals: 0,
    activitiesDue: 0
  })
  const [recentDeals, setRecentDeals] = useState([])
  const [upcomingActivities, setUpcomingActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    // Wait for auth to finish loading
    if (authLoading) return

    // Redirect if not authenticated
    if (!user) {
      router.push('/login?redirect=/dashboard/tackle')
      return
    }

    // Check if user has Tackle.IO access (tier 5)
    if (user.tier < 5) {
      router.push('/dashboard')
      return
    }

    const fetchDashboardData = async () => {
      try {
        const [dashboardData, deals, activities] = await Promise.all([
          tackleAPI.getDashboard().catch(() => ({})),
          dealsAPI.getAll({ limit: 5 }).catch(() => ({ deals: [] })),
          activitiesAPI.getUpcoming().catch(() => ({ activities: [] }))
        ])

        if (dashboardData) {
          setStats({
            totalDeals: dashboardData.totalDeals || 0,
            pipelineValue: dashboardData.pipelineValue || 0,
            wonDeals: dashboardData.wonDeals || 0,
            activitiesDue: dashboardData.activitiesDue || 0
          })
        }

        setRecentDeals(deals.deals || [])
        setUpcomingActivities(activities.activities || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [router, user, authLoading])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0)
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
              <Link href="/dashboard" className="text-white">Dashboard</Link>
              <Link href="/dashboard/deals" className="hover:text-white transition-colors">Deals</Link>
              <Link href="/dashboard/contacts" className="hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/companies" className="hover:text-white transition-colors">Companies</Link>
              <Link href="/dashboard/activities" className="hover:text-white transition-colors">Activities</Link>
              <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="text-xs text-zinc-400 hidden md:block">{user.firstName || user.email}</span>
              )}
              <button
                onClick={logout}
                className="text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition-all text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Sales Dashboard</h1>
            <p className="text-zinc-400 text-sm">Welcome back, {user?.firstName || 'User'}. Here's your sales overview.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <i data-lucide="briefcase" className="w-5 h-5 text-orange-400"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.totalDeals}</div>
              <div className="text-xs text-zinc-400">Total Deals</div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-green-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <i data-lucide="dollar-sign" className="w-5 h-5 text-green-400"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.pipelineValue)}</div>
              <div className="text-xs text-zinc-400">Pipeline Value</div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i data-lucide="trophy" className="w-5 h-5 text-blue-400"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.wonDeals}</div>
              <div className="text-xs text-zinc-400">Deals Won</div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i data-lucide="calendar" className="w-5 h-5 text-purple-400"></i>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.activitiesDue}</div>
              <div className="text-xs text-zinc-400">Activities Due</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/dashboard/deals/new" className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <i data-lucide="plus" className="w-6 h-6 text-orange-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-medium text-white mb-1">New Deal</h3>
                  <p className="text-xs text-zinc-400">Create a new opportunity</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/contacts/new" className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-blue-500/30 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <i data-lucide="user-plus" className="w-6 h-6 text-blue-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-medium text-white mb-1">Add Contact</h3>
                  <p className="text-xs text-zinc-400">Add a new contact</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/activities/new" className="group relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <i data-lucide="calendar-plus" className="w-6 h-6 text-purple-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-medium text-white mb-1">Schedule Activity</h3>
                  <p className="text-xs text-zinc-400">Add a task or meeting</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Deals */}
            <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Recent Deals</h2>
                <Link href="/dashboard/deals" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentDeals.length > 0 ? (
                  recentDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/dashboard/deals/${deal.id}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-white/5 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <i data-lucide="briefcase" className="w-5 h-5 text-orange-400"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{deal.title}</div>
                          <div className="text-xs text-zinc-400">{deal.company?.name || 'No company'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{formatCurrency(deal.value)}</div>
                        <div className="text-xs text-zinc-400">{deal.stage?.name || 'Unknown'}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    No deals yet. Create your first deal to get started.
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Activities */}
            <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Upcoming Activities</h2>
                <Link href="/dashboard/activities" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingActivities.length > 0 ? (
                  upcomingActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'call' ? 'bg-green-500/20' :
                          activity.type === 'meeting' ? 'bg-blue-500/20' :
                          activity.type === 'email' ? 'bg-purple-500/20' :
                          'bg-zinc-500/20'
                        }`}>
                          <i data-lucide={
                            activity.type === 'call' ? 'phone' :
                            activity.type === 'meeting' ? 'calendar' :
                            activity.type === 'email' ? 'mail' :
                            'check-circle'
                          } className={`w-5 h-5 ${
                            activity.type === 'call' ? 'text-green-400' :
                            activity.type === 'meeting' ? 'text-blue-400' :
                            activity.type === 'email' ? 'text-purple-400' :
                            'text-zinc-400'
                          }`}></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{activity.title}</div>
                          <div className="text-xs text-zinc-400">{activity.contact?.name || 'No contact'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-sm">
                    No upcoming activities. Schedule your first activity.
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
