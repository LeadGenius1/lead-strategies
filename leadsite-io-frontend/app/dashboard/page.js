'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { isAuthenticated, logout, getCurrentUser } from '../../lib/auth'
import { dashboardAPI } from '../../lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeCampaigns: 0,
    emailSent: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const currentUser = getCurrentUser()
    setUser(currentUser)

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="bg-black text-white antialiased min-h-screen flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden min-h-screen">
      {/* Ambient Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50"></div>
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] glow-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] glow-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite.IO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link href="/dashboard/leads" className="hover:text-white transition-colors">Leads</Link>
            <Link href="/dashboard/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
            <Link href="/dashboard/forms" className="hover:text-white transition-colors">Forms</Link>
            <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-xs text-neutral-400 hidden md:block">{user.name || user.email}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Welcome back, {user?.name || 'User'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                  <i data-lucide="users" className="w-5 h-5"></i>
                </div>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.totalLeads}</div>
              <div className="text-xs text-neutral-400">Total Leads</div>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                  <i data-lucide="megaphone" className="w-5 h-5"></i>
                </div>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.activeCampaigns}</div>
              <div className="text-xs text-neutral-400">Active Campaigns</div>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                  <i data-lucide="mail" className="w-5 h-5"></i>
                </div>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.emailSent}</div>
              <div className="text-xs text-neutral-400">Emails Sent</div>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-green-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-green-400">
                  <i data-lucide="trending-up" className="w-5 h-5"></i>
                </div>
              </div>
              <div className="text-2xl font-medium text-white mb-1">{stats.conversionRate}%</div>
              <div className="text-xs text-neutral-400">Conversion Rate</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/dashboard/forms/new" className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-indigo-400">
                <i data-lucide="plus" className="w-6 h-6"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Create Form</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Add a new lead capture form to your website
              </p>
            </div>
          </Link>

          <Link href="/dashboard/campaigns/new" className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-purple-400">
                <i data-lucide="mail" className="w-6 h-6"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">New Campaign</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Start a new email campaign to nurture leads
              </p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-neutral-900/30 border border-white/10 p-8">
          <h2 className="text-lg font-medium text-white mb-6">Recent Leads</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <i data-lucide="user" className="w-5 h-5 text-indigo-400"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">New lead from website</div>
                  <div className="text-xs text-neutral-400">2 minutes ago</div>
                </div>
              </div>
              <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <i data-lucide="mail" className="w-5 h-5 text-purple-400"></i>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Email campaign sent</div>
                  <div className="text-xs text-neutral-400">1 hour ago</div>
                </div>
              </div>
              <i data-lucide="chevron-right" className="w-5 h-5 text-neutral-400"></i>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

