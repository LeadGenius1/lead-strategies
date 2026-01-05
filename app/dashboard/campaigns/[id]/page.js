'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../../lib/auth'
import { campaignAPI } from '../../../../lib/api'
import { ArrowLeft, Edit, Play, Pause, Trash2, Mail, Users, TrendingUp } from 'lucide-react'

export default function CampaignDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const fetchCampaign = async () => {
      try {
        setLoading(true)
        const data = await campaignAPI.getById(campaignId)
        setCampaign(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId, router])

  const handleToggle = async () => {
    try {
      if (campaign.status === 'active') {
        await campaignAPI.pause(campaignId)
      } else {
        await campaignAPI.start(campaignId)
      }
      const updated = await campaignAPI.getById(campaignId)
      setCampaign(updated)
    } catch (error) {
      alert('Failed to update campaign')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      await campaignAPI.delete(campaignId)
      router.push('/dashboard/campaigns')
    } catch (error) {
      alert('Failed to delete campaign')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
          <Link href="/dashboard/campaigns" className="btn-primary">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
              <p className="text-slate-300">Campaign details and analytics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggle}
                className={`btn-secondary flex items-center gap-2 ${
                  campaign.status === 'active' ? 'text-yellow-400' : 'text-green-400'
                }`}
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
              <Link
                href={`/dashboard/campaigns/${campaignId}/edit`}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-blue-400" />
              <span className="text-slate-400 text-sm">Emails Sent</span>
            </div>
            <p className="text-3xl font-bold">{campaign.sent_count || 0}</p>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-cyan-400" />
              <span className="text-slate-400 text-sm">Leads</span>
            </div>
            <p className="text-3xl font-bold">{campaign.leads_count || 0}</p>
          </div>
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-slate-400 text-sm">Reply Rate</span>
            </div>
            <p className="text-3xl font-bold">{campaign.reply_rate || 0}%</p>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Campaign Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <p className="text-white font-medium capitalize">{campaign.status || 'draft'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Subject</label>
                <p className="text-white">{campaign.subject || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Created</label>
                <p className="text-white">
                  {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Email Template</h2>
            <div className="bg-white/5 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                {campaign.template || 'No template set'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

