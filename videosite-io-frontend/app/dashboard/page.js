'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../lib/auth'
import { dashboardAPI } from '../../lib/api'
import { Video, TrendingUp, Users, Play } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-void px-6 py-24">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-beige-100 mb-2 tracking-tight">Dashboard</h1>
          <p className="text-beige-200/60">Welcome back! Here&apos;s your video campaign overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-6 h-6 text-gold-500" />
            </div>
            <div className="text-3xl font-serif text-gold-500 mb-1">0</div>
            <div className="text-xs uppercase tracking-widest text-beige-200/60">Total Videos</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Play className="w-6 h-6 text-gold-500" />
            </div>
            <div className="text-3xl font-serif text-gold-500 mb-1">0</div>
            <div className="text-xs uppercase tracking-widest text-beige-200/60">Total Views</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-gold-500" />
            </div>
            <div className="text-3xl font-serif text-gold-500 mb-1">0%</div>
            <div className="text-xs uppercase tracking-widest text-beige-200/60">Engagement Rate</div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-6 h-6 text-gold-500" />
            </div>
            <div className="text-3xl font-serif text-gold-500 mb-1">0</div>
            <div className="text-xs uppercase tracking-widest text-beige-200/60">Leads Generated</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/videos/upload"
            className="bg-white/5 border border-white/10 p-8 hover:border-gold-500/50 transition-all group"
          >
            <h3 className="font-serif text-xl text-beige-100 mb-2 group-hover:text-gold-300 transition-colors">
              Upload Video
            </h3>
            <p className="text-beige-200/60 text-sm">Create a new video campaign</p>
          </Link>

          <Link
            href="/dashboard/videos"
            className="bg-white/5 border border-white/10 p-8 hover:border-gold-500/50 transition-all group"
          >
            <h3 className="font-serif text-xl text-beige-100 mb-2 group-hover:text-gold-300 transition-colors">
              View All Videos
            </h3>
            <p className="text-beige-200/60 text-sm">Manage your video library</p>
          </Link>
        </div>
      </div>
    </div>
  )
}



