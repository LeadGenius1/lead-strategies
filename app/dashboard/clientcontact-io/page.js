'use client'

import Navigation from '../../../components/Navigation'
import { MessageSquare, TrendingUp, Send, Users, Plus } from 'lucide-react'

export default function ClientContactIODashboard() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">ClientContact.IO</h1>
                <p className="text-neutral-500 text-sm">Omnichannel Marketing Dashboard - 22+ Platforms</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Messages Sent', value: '127.5K', change: '+34.2%', icon: Send, color: 'cyan' },
              { label: 'Active Channels', value: '18', change: '+3 platforms', icon: MessageSquare, color: 'purple' },
              { label: 'Engagement Rate', value: '42.3%', change: '+12.8%', icon: TrendingUp, color: 'pink' },
              { label: 'Total Reach', value: '2.4M', change: '+28.5%', icon: Users, color: 'indigo' }
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {['LinkedIn', 'Instagram', 'Facebook', 'Twitter', 'TikTok', 'YouTube', 'Email', 'SMS', 'WhatsApp', 'Telegram', 'Discord', 'Slack'].map((platform) => (
              <div key={platform} className="p-4 rounded-lg bg-neutral-900/40 border border-white/10 hover:border-cyan-500/50 transition-all text-center">
                <div className="text-sm font-medium text-white mb-1">{platform}</div>
                <div className="text-xs text-emerald-400">Active</div>
              </div>
            ))}
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium mb-4">Unified Omnichannel Dashboard</h2>
            <p className="text-neutral-500 text-sm mb-6">Manage all 22+ social platforms from one interface</p>
            <button className="relative group inline-flex overflow-hidden rounded-lg p-[1px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#06b6d4_50%,#000000_100%)]"></span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl">
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
