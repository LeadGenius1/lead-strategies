'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Globe, Loader2, Zap, Target, Mail, TrendingUp, Play, Check, AlertCircle } from 'lucide-react'

const STYLE = {
  card: 'bg-neutral-900/50 border border-white/10 rounded-xl p-6',
  input: 'w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50',
  label: 'text-xs text-neutral-500 uppercase tracking-wide mb-2 block',
  btn: 'px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50',
}

export default function ProactiveHunterPage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState(null)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const res = await api.get('/api/v1/proactive-hunter/status')
      setStatus(res.data?.data || res.data)
    } catch (e) {
      setStatus({ hasICP: false })
    }
  }

  async function handleScan() {
    if (!websiteUrl.trim()) {
      toast.error('Enter your website URL')
      return
    }
    setScanning(true)
    try {
      await api.post('/api/v1/proactive-hunter/scan-website', { websiteUrl: websiteUrl.trim() })
      toast.success('Website scanned! Your ICP is ready.')
      loadStatus()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Scan failed')
    } finally {
      setScanning(false)
    }
  }

  async function handleTriggerRun() {
    setTriggering(true)
    try {
      const res = await api.post('/api/v1/proactive-hunter/trigger-run')
      if (res.data?.success) {
        toast.success(`Discovered ${res.data.discovery?.leadsDiscovered || 0} leads, sent ${res.data.outreach?.emailsSent || 0} emails`)
      } else {
        toast.error(res.data?.error || 'Run failed')
      }
      loadStatus()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Trigger failed')
    } finally {
      setTriggering(false)
    }
  }

  async function handleToggleScheduling(checked) {
    try {
      await api.put('/api/v1/proactive-hunter/icp', { isActive: checked })
      toast.success(checked ? 'Automatic scheduling is on' : 'Automatic scheduling is off')
      loadStatus()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update scheduling')
    }
  }

  const hasICP = status?.hasICP
  const icp = status?.icp
  const recentRuns = status?.recentRuns || []
  const weeklyStats = status?.weeklyStats || {}

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-indigo-400" />
            Proactive Lead Hunter
          </h1>
          <p className="text-neutral-500 mt-1">
            24/7 autonomous lead generation. Scan your website, set your ICP, and let AI find and email prospects daily.
          </p>
        </div>

        {!hasICP ? (
          <div className={STYLE.card}>
            <h2 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Step 1: Scan Your Website
            </h2>
            <p className="text-neutral-500 text-sm mb-4">
              We&apos;ll analyze your site to build your Ideal Customer Profile automatically.
            </p>
            <div className="flex gap-3">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className={STYLE.input}
                disabled={scanning}
              />
              <button onClick={handleScan} disabled={scanning} className={STYLE.btn}>
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {scanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className={STYLE.card}>
                <Target className="w-6 h-6 text-indigo-400 mb-2" />
                <p className="text-2xl font-medium text-white">{weeklyStats.totalLeads || 0}</p>
                <p className="text-xs text-neutral-500">Leads This Week</p>
              </div>
              <div className={STYLE.card}>
                <Mail className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-2xl font-medium text-white">{weeklyStats.totalEmails || 0}</p>
                <p className="text-xs text-neutral-500">Emails Sent</p>
              </div>
              <div className={STYLE.card}>
                <TrendingUp className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-2xl font-medium text-white">{weeklyStats.totalReplies || 0}</p>
                <p className="text-xs text-neutral-500">Replies</p>
              </div>
              <div className={STYLE.card}>
                <Check className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-sm font-medium text-white">{icp?.businessName || 'Active'}</p>
                <p className="text-xs text-neutral-500">ICP Status</p>
              </div>
            </div>

            <div className={STYLE.card}>
              <h2 className="text-lg font-medium text-white mb-4">Scheduling</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-neutral-300 text-sm">Automatic runs daily at 6 AM (discovery), 8 AM (outreach), and 6 PM (summary)</p>
                  <p className="text-neutral-500 text-xs mt-1">Toggle off to pause automatic runs.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={icp?.isActive !== false}
                  onClick={() => handleToggleScheduling(icp?.isActive === false)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black ${icp?.isActive !== false ? 'bg-indigo-500' : 'bg-neutral-600'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${icp?.isActive !== false ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className={STYLE.card}>
              <h2 className="text-lg font-medium text-white mb-4">Run Now</h2>
              <p className="text-neutral-500 text-sm mb-4">
                Manually trigger a discovery + outreach run.
              </p>
              <button onClick={handleTriggerRun} disabled={triggering} className={STYLE.btn}>
                {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {triggering ? 'Running...' : 'Trigger Run Now'}
              </button>
            </div>

            {recentRuns.length > 0 && (
              <div className={STYLE.card}>
                <h2 className="text-lg font-medium text-white mb-4">Recent Runs</h2>
                <div className="space-y-2">
                  {recentRuns.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-neutral-400 text-sm">
                        {new Date(r.date).toLocaleDateString()} — {r.leadsDiscovered} leads, {r.emailsSent} emails
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        r.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-neutral-500/20 text-neutral-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
          <p className="text-sm text-indigo-200">
            <strong>How it works:</strong> After scanning your website, use the scheduling toggle to turn automatic runs on or off. When on, the Proactive Lead Hunter runs daily at 6 AM (discovery), 8 AM (outreach), and 6 PM (summary email).
          </p>
        </div>
      </div>
    </div>
  )
}
