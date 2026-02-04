'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DEFAULT_STATS = {
  totalLeads: 0,
  activeCampaigns: 0,
  emailsSent: 0,
  replyRate: 0,
}

function StatCard({ label, value }) {
  return (
    <div className="bg-neutral-900/50 backdrop-blur border border-white/10 rounded-xl p-6">
      <p className="text-neutral-500 text-sm">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1]

        if (!token) {
          router.push('/login')
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'
        const res = await fetch(`${apiUrl}/api/v1/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error(`Stats API failed: ${res.status}`)
        }

        const json = await res.json()
        const data = json.data || json
        const s = data.stats || data

        setStats({
          totalLeads: s.leads ?? s.totalLeads ?? 0,
          activeCampaigns: s.activeCampaigns ?? s.campaigns ?? 0,
          emailsSent: s.emailsSent ?? 0,
          replyRate: s.replyRate ?? 0,
        })
      } catch (err) {
        console.error('Dashboard load error:', err)
        setError(err.message)
        setStats(DEFAULT_STATS)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400">Dashboard API Error: {error}</p>
          <p className="text-sm text-neutral-500 mt-2">Check Railway logs for backend issues.</p>
          <p className="text-sm text-neutral-500 mt-1">Showing default stats.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <StatCard label="Total Leads" value={stats.totalLeads} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} />
          <StatCard label="Emails Sent" value={stats.emailsSent} />
          <StatCard label="Reply Rate" value={`${stats.replyRate}%`} />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-neutral-500 mt-1 text-sm">Welcome back. Here&apos;s your lead generation overview.</p>
          </div>
          <Link
            href="/lead-hunter"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
          >
            Open Lead Hunter
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Leads" value={stats.totalLeads} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} />
          <StatCard label="Emails Sent" value={stats.emailsSent} />
          <StatCard label="Reply Rate" value={`${stats.replyRate}%`} />
        </div>
      </div>
    </div>
  )
}
