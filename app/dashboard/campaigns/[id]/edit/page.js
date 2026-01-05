'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../../../lib/auth'
import { campaignAPI } from '../../../../../lib/api'
import { ArrowLeft } from 'lucide-react'

export default function EditCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    template: '',
    schedule: 'immediate',
    scheduledDate: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setFormData({
          name: data.name || '',
          subject: data.subject || '',
          template: data.template || '',
          schedule: data.schedule || 'immediate',
          scheduledDate: data.scheduledDate || '',
        })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      await campaignAPI.update(campaignId, formData)
      router.push(`/dashboard/campaigns/${campaignId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/campaigns/${campaignId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaign
          </Link>
          <h1 className="text-3xl font-bold mb-2">Edit Campaign</h1>
          <p className="text-slate-300">Update campaign details</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="My Email Campaign"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="input-field"
                placeholder="Subject line for your emails"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Template</label>
              <textarea
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="input-field min-h-[300px]"
                placeholder="Write your email template here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Schedule</label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="input-field"
              >
                <option value="immediate">Send Immediately</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>

            {formData.schedule === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium mb-2">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="input-field"
                  required={formData.schedule === 'scheduled'}
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href={`/dashboard/campaigns/${campaignId}`}
                className="btn-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

