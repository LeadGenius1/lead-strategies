'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/contexts/AuthContext'
import { activitiesAPI } from '@/lib/api'

export default function ActivitiesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState([])
  const [overdue, setOverdue] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'upcoming', 'overdue', 'completed'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/dashboard/tackle/activities')
      return
    }

    if (user.tier < 5) {
      router.push('/dashboard')
      return
    }

    fetchActivities()
  }, [router, user, authLoading])

  const fetchActivities = async () => {
    try {
      const [allData, upcomingData, overdueData] = await Promise.all([
        activitiesAPI.getAll().catch(() => ({ activities: [] })),
        activitiesAPI.getUpcoming().catch(() => ({ activities: [] })),
        activitiesAPI.getOverdue().catch(() => ({ activities: [] }))
      ])

      setActivities(allData.activities || [])
      setUpcoming(upcomingData.activities || [])
      setOverdue(overdueData.activities || [])
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id) => {
    try {
      await activitiesAPI.complete(id, 'Completed')
      fetchActivities()
    } catch (err) {
      console.error('Failed to complete activity:', err)
    }
  }

  const getFilteredActivities = () => {
    switch (filter) {
      case 'upcoming':
        return upcoming
      case 'overdue':
        return overdue
      case 'completed':
        return activities.filter(a => a.status === 'completed')
      default:
        return activities
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call':
        return 'phone'
      case 'meeting':
        return 'calendar'
      case 'email':
        return 'mail'
      case 'task':
        return 'check-square'
      default:
        return 'activity'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'call':
        return 'green'
      case 'meeting':
        return 'blue'
      case 'email':
        return 'purple'
      case 'task':
        return 'orange'
      default:
        return 'zinc'
    }
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
              <Link href="/dashboard/activities" className="text-white">Activities</Link>
              <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/activities/new"
                className="text-xs font-medium bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all text-white flex items-center gap-2"
              >
                <i data-lucide="plus" className="w-4 h-4"></i>
                New Activity
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Activities</h1>
              <p className="text-zinc-400 text-sm">Manage your tasks, calls, meetings, and emails.</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
              <div className="text-2xl font-bold text-white">{activities.length}</div>
              <div className="text-xs text-zinc-400">Total Activities</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
              <div className="text-2xl font-bold text-orange-400">{upcoming.length}</div>
              <div className="text-xs text-zinc-400">Upcoming</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
              <div className="text-2xl font-bold text-red-400">{overdue.length}</div>
              <div className="text-xs text-zinc-400">Overdue</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
              <div className="text-2xl font-bold text-green-400">
                {activities.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-xs text-zinc-400">Completed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            {['all', 'upcoming', 'overdue', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-900/30 border border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {getFilteredActivities().length > 0 ? (
              getFilteredActivities().map((activity) => {
                const color = getActivityColor(activity.type)
                const isOverdue = new Date(activity.dueDate) < new Date() && activity.status !== 'completed'

                return (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 border transition-all ${
                      isOverdue ? 'border-red-500/30' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleComplete(activity.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          activity.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : `bg-${color}-500/20 text-${color}-400 hover:bg-green-500/20 hover:text-green-400`
                        }`}
                      >
                        {activity.status === 'completed' ? (
                          <i data-lucide="check" className="w-5 h-5"></i>
                        ) : (
                          <i data-lucide={getActivityIcon(activity.type)} className="w-5 h-5"></i>
                        )}
                      </button>
                      <div>
                        <h3 className={`text-sm font-medium ${
                          activity.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'
                        }`}>
                          {activity.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          {activity.contact && (
                            <span className="text-xs text-zinc-400">
                              {activity.contact.firstName} {activity.contact.lastName}
                            </span>
                          )}
                          {activity.deal && (
                            <span className="text-xs text-orange-400">
                              {activity.deal.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-xs ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                          {activity.dueDate
                            ? new Date(activity.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'No date'}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-400 font-medium">Overdue</div>
                        )}
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                        <i data-lucide="more-vertical" className="w-4 h-4"></i>
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="calendar" className="w-8 h-8 text-zinc-400"></i>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No activities found</h3>
                <p className="text-zinc-400 text-sm mb-6">Schedule your first activity to get started.</p>
                <Link
                  href="/dashboard/activities/new"
                  className="inline-flex items-center gap-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-all text-white"
                >
                  <i data-lucide="plus" className="w-4 h-4"></i>
                  New Activity
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
