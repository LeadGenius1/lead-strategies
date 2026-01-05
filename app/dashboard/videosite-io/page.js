'use client'

import Navigation from '../../../components/Navigation'
import { Video, TrendingUp, Play, DollarSign, Users, Plus } from 'lucide-react'

export default function VideoSiteIODashboard() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 border border-pink-500/50 flex items-center justify-center">
                <Video className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">VideoSite.IO</h1>
                <p className="text-neutral-500 text-sm">Video Platform Dashboard</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Videos', value: '347', change: '+42 this month', icon: Video, color: 'pink' },
              { label: 'Total Views', value: '892K', change: '+156K', icon: Play, color: 'purple' },
              { label: 'Creator Revenue', value: '$12.4K', change: '+$3.2K', icon: DollarSign, color: 'emerald' },
              { label: 'Subscribers', value: '45.2K', change: '+8.7K', icon: Users, color: 'indigo' }
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className={`group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-${stat.color}-500/50 transition-all duration-300`}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">{stat.label}</div>
                      <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium mb-4">YouTube Alternative with Creator Payments</h2>
            <p className="text-neutral-500 text-sm mb-6">Host, monetize, and distribute video content globally</p>
            <button className="relative group inline-flex overflow-hidden rounded-lg p-[1px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#ec4899_50%,#000000_100%)]"></span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl">
                <Plus className="w-4 h-4" />
                <span>Upload Video</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
