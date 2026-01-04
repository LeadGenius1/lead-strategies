'use client'

import { useState } from 'react'

const MOCK_CALLS = [
  { id: 1, contact: 'John Smith', company: 'TechCorp', duration: '12:34', outcome: 'Meeting Booked', time: 'Today, 2:30 PM' },
  { id: 2, contact: 'Sarah Johnson', company: 'Startup.io', duration: '8:22', outcome: 'Follow Up', time: 'Today, 11:00 AM' },
  { id: 3, contact: 'Mike Chen', company: 'Enterprise Inc', duration: '15:47', outcome: 'Not Interested', time: 'Yesterday, 4:15 PM' },
]

export default function CallsPage() {
  const [dialNumber, setDialNumber] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Voice Calls</h1>
        <p className="text-dark-textMuted mt-1">Make and track sales calls with AI analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Calls Today', value: '12', icon: '📞' },
          { label: 'Avg Duration', value: '8:45', icon: '⏱️' },
          { label: 'Meetings Booked', value: '4', icon: '📅' },
          { label: 'Talk Time', value: '2.5hrs', icon: '🎙️' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-dark-text">{stat.value}</p>
                <p className="text-sm text-dark-textMuted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dialer */}
        <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Quick Dial</h2>
          <input
            type="tel"
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text text-center text-xl placeholder-dark-textMuted focus:outline-none focus:border-dark-primary"
          />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <button
                key={key}
                onClick={() => setDialNumber(dialNumber + key)}
                className="py-4 bg-dark-surfaceHover hover:bg-dark-border text-dark-text text-xl rounded-lg transition"
              >
                {key}
              </button>
            ))}
          </div>
          <button className="w-full mt-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition">
            📞 Call
          </button>
        </div>

        {/* Recent Calls */}
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Recent Calls</h2>
          <div className="space-y-4">
            {MOCK_CALLS.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dark-surfaceHover rounded-full flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <p className="font-medium text-dark-text">{call.contact}</p>
                    <p className="text-sm text-dark-textMuted">{call.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-dark-text">{call.duration}</p>
                  <p className="text-sm text-dark-textMuted">{call.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  call.outcome === 'Meeting Booked' ? 'bg-green-500/20 text-green-400' :
                  call.outcome === 'Follow Up' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {call.outcome}
                </span>
                <button className="text-dark-primary hover:text-dark-primaryHover text-sm">
                  View Recording
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">🤖 AI Call Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-dark-bg rounded-lg">
            <p className="text-dark-textMuted text-sm">Top Objection</p>
            <p className="text-dark-text mt-1">"Need to check with my team"</p>
            <p className="text-xs text-dark-textMuted mt-2">Mentioned 6 times today</p>
          </div>
          <div className="p-4 bg-dark-bg rounded-lg">
            <p className="text-dark-textMuted text-sm">Best Performing Script</p>
            <p className="text-dark-text mt-1">ROI-focused opener</p>
            <p className="text-xs text-green-400 mt-2">45% booking rate</p>
          </div>
          <div className="p-4 bg-dark-bg rounded-lg">
            <p className="text-dark-textMuted text-sm">Suggested Improvement</p>
            <p className="text-dark-text mt-1">Ask discovery questions earlier</p>
            <p className="text-xs text-dark-textMuted mt-2">Based on 23 calls analyzed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
