'use client'

import Navigation from '../../../components/Navigation'
import { Briefcase, TrendingUp, Phone, Users, Mail, MessageSquare, Video, Globe, Plus } from 'lucide-react'

export default function UltraLeadDashboard() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">UltraLead</h1>
                <p className="text-neutral-500 text-sm">Full Suite Dashboard - Voice + CRM + All Platforms</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Voice Calls', value: '1,247', change: '+342 this month', icon: Phone, color: 'indigo' },
              { label: 'CRM Contacts', value: '18.5K', change: '+2.3K', icon: Users, color: 'purple' },
              { label: 'Email Campaigns', value: '156', change: '+23', icon: Mail, color: 'cyan' },
              { label: 'Social Posts', value: '892', change: '+127', icon: MessageSquare, color: 'pink' }
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Mail, label: 'LeadSite.AI', color: 'indigo' },
              { icon: Globe, label: 'LeadSite.IO', color: 'purple' },
              { icon: MessageSquare, label: 'ClientContact.IO', color: 'cyan' },
              { icon: Video, label: 'VideoSite.IO', color: 'pink' }
            ].map((platform, idx) => {
              const Icon = platform.icon
              return (
                <div key={idx} className={`p-4 rounded-lg bg-neutral-900/40 border border-white/10 hover:border-${platform.color}-500/50 transition-all`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 text-${platform.color}-400`} />
                    <div>
                      <div className="text-sm font-medium text-white">{platform.label}</div>
                      <div className="text-xs text-emerald-400">Active</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium mb-4">Enterprise Marketing Automation Suite</h2>
            <p className="text-neutral-500 text-sm mb-6">Access all features from all platforms + AI Voice Calls + Advanced CRM</p>
            <button className="relative group inline-flex overflow-hidden rounded-lg p-[1px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl">
                <Plus className="w-4 h-4" />
                <span>Launch Campaign</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
