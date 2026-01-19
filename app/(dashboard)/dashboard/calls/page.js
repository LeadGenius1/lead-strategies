'use client'

import { useState } from 'react'
import { Phone, PhoneCall, PhoneOff, Clock, Calendar, User, Play, Loader2 } from 'lucide-react'

export default function CallsPage() {
  const [calls, setCalls] = useState([
    {
      id: 1,
      contact: 'Sarah Chen',
      company: 'CloudScale Inc',
      phone: '+1 (555) 123-4567',
      time: '2:30 PM Today',
      duration: '12:45',
      status: 'completed',
      outcome: 'Meeting scheduled'
    },
    {
      id: 2,
      contact: 'Michael Torres',
      company: 'DataFlow AI',
      phone: '+1 (555) 987-6543',
      time: '11:00 AM Today',
      duration: '8:22',
      status: 'completed',
      outcome: 'Follow-up email'
    },
    {
      id: 3,
      contact: 'Jennifer Park',
      company: 'TechStartup Co',
      phone: '+1 (555) 456-7890',
      time: '3:00 PM Tomorrow',
      duration: '-',
      status: 'scheduled',
      outcome: '-'
    }
  ])

  const stats = [
    { label: 'Calls Today', value: 12, icon: Phone, color: 'indigo' },
    { label: 'Avg Duration', value: '8:34', icon: Clock, color: 'cyan' },
    { label: 'Scheduled', value: 5, icon: Calendar, color: 'purple' },
    { label: 'Connection Rate', value: '68%', icon: PhoneCall, color: 'emerald' },
  ]

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'missed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Voice Calls</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage AI-powered voice outreach</p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Phone className="w-4 h-4" />
            New Call
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Calls Table */}
        <div className="rounded-2xl bg-neutral-900/50 border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Outcome</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {calls.map((call) => (
                <tr key={call.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-medium text-indigo-400">
                        {call.contact.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{call.contact}</p>
                        <p className="text-sm text-neutral-500">{call.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300">{call.time}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      {call.duration}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400">{call.outcome}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {call.status === 'completed' && (
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-all">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
