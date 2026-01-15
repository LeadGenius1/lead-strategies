'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function CallsPage() {
  const [dialNumber, setDialNumber] = useState('')
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [calling, setCalling] = useState(false)
  const [selectedCall, setSelectedCall] = useState(null)

  useEffect(() => {
    loadCalls()
  }, [])

  async function loadCalls() {
    try {
      const response = await api.get('/api/tackle/calls')
      const data = response.data
      // Backend returns { success: true, data: { calls: [...], pagination: {...} } }
      setCalls(data.calls || [])
      
      // Load stats separately
      try {
        const statsResponse = await api.get('/api/tackle/calls/stats/summary')
        const statsData = statsResponse.data
        setStats({
          callsToday: statsData.totalCalls || 0,
          avgDuration: formatDuration(statsData.avgDuration || 0),
          meetingsBooked: statsData.byOutcome?.meeting_booked || 0,
          talkTime: `${Math.floor((statsData.totalDuration || 0) / 3600)}hrs`,
        })
      } catch (err) {
        console.error('Error loading call stats:', err)
        setStats({})
      }
    } catch (error) {
      console.error('Error loading calls:', error)
      setCalls([])
    } finally {
      setLoading(false)
    }
  }

  async function handleMakeCall() {
    if (!dialNumber.trim()) {
      toast.error('Please enter a phone number')
      return
    }

    setCalling(true)
    try {
      // Backend expects: toNumber, contactId (optional), fromNumber (optional)
      const response = await api.post('/api/tackle/calls/initiate', {
        toNumber: dialNumber,
      })
      toast.success('Call initiated!')
      setDialNumber('')
      loadCalls()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to make call')
    } finally {
      setCalling(false)
    }
  }

  async function handleViewRecording(callId) {
    try {
      const response = await api.get(`/api/tackle/calls/${callId}/recording`)
      const data = response.data
      if (data.recordingUrl || data.data?.recordingUrl) {
        window.open(data.recordingUrl || data.data.recordingUrl, '_blank')
      } else {
        toast.error('Recording not available')
      }
    } catch (error) {
      toast.error('Failed to load recording')
    }
  }

  function formatDuration(seconds) {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Voice Calls</h1>
        <p className="text-dark-textMuted mt-1">Make and track sales calls with AI analysis</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Calls Today', value: stats.callsToday || '0', icon: '📞' },
          { label: 'Avg Duration', value: stats.avgDuration || '0:00', icon: '⏱️' },
          { label: 'Meetings Booked', value: stats.meetingsBooked || '0', icon: '📅' },
          { label: 'Talk Time', value: stats.talkTime || '0hrs', icon: '🎙️' },
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
          <button
            onClick={handleMakeCall}
            disabled={calling || !dialNumber.trim()}
            className="w-full mt-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium transition disabled:opacity-50"
          >
            {calling ? 'Calling...' : '📞 Call'}
          </button>
        </div>

        {/* Recent Calls */}
        <div className="lg:col-span-2 bg-dark-surface border border-dark-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-dark-text mb-4">Recent Calls</h2>
          {loading ? (
            <div className="text-center py-8 text-dark-textMuted">Loading calls...</div>
          ) : calls.length === 0 ? (
            <div className="text-center py-8 text-dark-textMuted">No calls yet. Make your first call!</div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-dark-surfaceHover rounded-full flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <p className="font-medium text-dark-text">
                        {call.contact?.firstName && call.contact?.lastName 
                          ? `${call.contact.firstName} ${call.contact.lastName}`
                          : call.contact?.email || call.toNumber || 'Unknown'}
                      </p>
                      <p className="text-sm text-dark-textMuted">
                        {call.toNumber || call.contact?.email || 'No number'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-dark-text">{formatDuration(call.duration)}</p>
                    <p className="text-sm text-dark-textMuted">{formatTime(call.startedAt || call.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    call.outcome === 'meeting_booked' ? 'bg-green-500/20 text-green-400' :
                    call.outcome === 'follow_up' ? 'bg-yellow-500/20 text-yellow-400' :
                    call.outcome === 'not_interested' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {call.outcome ? call.outcome.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : call.status || 'Pending'}
                  </span>
                  {call.recordingUrl && (
                    <button
                      onClick={() => handleViewRecording(call.id)}
                      className="text-dark-primary hover:text-dark-primaryHover text-sm"
                    >
                      View Recording
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
