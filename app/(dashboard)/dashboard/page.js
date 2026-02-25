'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Target,
  Zap,
  Mail,
  TrendingUp,
} from 'lucide-react'
import { PLATFORM_DISPLAY_NAMES, detectPlatformFromUser, detectPlatformFromDomain } from '@/lib/platformFeatures'

const DEFAULT_STATS = {
  totalLeads: 0,
  activeCampaigns: 0,
  emailsSent: 0,
  replyRate: 0,
}

const STAT_ICONS = [Target, Zap, Mail, TrendingUp]

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl md:text-3xl font-medium text-white mt-2 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [platformName, setPlatformName] = useState('')

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

        const [statsRes, meRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (meRes.ok) {
          const meJson = await meRes.json()
          const u = meJson.data?.user || meJson.user || meJson
          setUser(u)
          const host = typeof window !== 'undefined' ? window.location.hostname.replace(/^www\./, '').split(':')[0] : ''
          const isMain = host === 'aileadstrategies.com' || host === 'localhost' || host === '127.0.0.1'
          const platformType = (isMain && u) ? detectPlatformFromUser(u) : (typeof window !== 'undefined' ? detectPlatformFromDomain() : 'ultralead-ai')
          setPlatformName(PLATFORM_DISPLAY_NAMES[platformType])
        }

        if (!statsRes.ok) throw new Error(`Stats API failed: ${statsRes.status}`)

        const json = await statsRes.json()
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
        <div className="relative rounded-2xl bg-red-900/10 border border-red-500/30 p-4 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <p className="text-red-400">Dashboard API Error: {error}</p>
          <p className="text-sm text-neutral-500 mt-2 font-light">Check Railway logs for backend issues.</p>
          <p className="text-sm text-neutral-500 mt-1 font-light">Showing default stats.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <StatCard label="Total Leads" value={stats.totalLeads} icon={STAT_ICONS[0]} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} icon={STAT_ICONS[1]} />
          <StatCard label="Emails Sent" value={stats.emailsSent} icon={STAT_ICONS[2]} />
          <StatCard label="Reply Rate" value={`${stats.replyRate}%`} icon={STAT_ICONS[3]} />
        </div>
      </div>
    )
  }

  const tier = user?.tier != null ? Number(user.tier) : null
  const isVideoSite = tier === 4
  const isUltraLead = tier === 5
  const isClientContact = tier === 3

  const primaryCta = isVideoSite
    ? { href: '/videos/upload', label: 'Upload Video' }
    : isUltraLead
      ? { href: '/crm', label: 'Open CRM' }
      : isClientContact
        ? { href: '/inbox', label: 'Open Inbox' }
        : { href: '/lead-hunter', label: 'Open Lead Hunter' }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* AETHER Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-delay" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
              {platformName || 'Dashboard'}
            </h1>
            <p className="text-neutral-400 text-sm font-light">
              {isVideoSite ? 'Video monetization overview.' : isUltraLead ? 'CRM pipeline overview.' : isClientContact ? 'Unified inbox overview.' : 'Lead generation overview.'}
            </p>
          </div>
          <Link
            href={primaryCta.href}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            {primaryCta.label}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Leads" value={stats.totalLeads} icon={STAT_ICONS[0]} />
          <StatCard label="Active Campaigns" value={stats.activeCampaigns} icon={STAT_ICONS[1]} />
          <StatCard label="Emails Sent" value={stats.emailsSent} icon={STAT_ICONS[2]} />
          <StatCard label="Reply Rate" value={`${stats.replyRate}%`} icon={STAT_ICONS[3]} />
        </div>
      </div>
    </div>
  )
}
