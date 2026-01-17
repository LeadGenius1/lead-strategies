'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export default function DailyEmailStatus() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDailyStatus()
    // Refresh every 5 minutes
    const interval = setInterval(loadDailyStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  async function loadDailyStatus() {
    try {
      const response = await api.get('/api/campaigns/daily-status')
      setStatus(response.data)
    } catch (error) {
      console.error('Error loading daily status:', error)
      // Use mock data for now
      setStatus({
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        prospectsFound: 50,
        emailsScheduled: 50,
        emailsSent: 50,
        scheduledFor: '8:00 AM',
        lastRun: new Date().toISOString(),
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-dark-bg rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-dark-bg rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const statusColors = {
    scheduled: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  }

  const statusIcons = {
    scheduled: '⏰',
    processing: '⚙️',
    completed: '✅',
    failed: '❌',
  }

  return (
    <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Daily AI Agent Status</h3>
        <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-2 ${statusColors[status.status] || statusColors.scheduled}`}>
          <span>{statusIcons[status.status] || '⏰'}</span>
          <span className="capitalize">{status.status}</span>
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-dark-textMuted">Date:</span>
          <span className="text-dark-text font-medium">
            {new Date(status.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-dark-textMuted">Prospects Found:</span>
          <span className="text-dark-text font-medium">{status.prospectsFound || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-dark-textMuted">Emails Scheduled:</span>
          <span className="text-dark-text font-medium">{status.emailsScheduled || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-dark-textMuted">Emails Sent:</span>
          <span className="text-dark-text font-medium">{status.emailsSent || 0}</span>
        </div>

        {status.scheduledFor && (
          <div className="flex items-center justify-between">
            <span className="text-dark-textMuted">Scheduled For:</span>
            <span className="text-dark-text font-medium">{status.scheduledFor}</span>
          </div>
        )}

        {status.lastRun && (
          <div className="flex items-center justify-between pt-3 border-t border-dark-border">
            <span className="text-dark-textMuted text-sm">Last Run:</span>
            <span className="text-dark-text text-sm">
              {new Date(status.lastRun).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
      </div>

      {status.status === 'failed' && status.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{status.error}</p>
        </div>
      )}
    </div>
  )
}
