'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '../../../../lib/auth'
import { campaignAPI } from '../../../../lib/api'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCampaignPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    template: '',
    schedule: 'immediate',
    scheduledDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await campaignAPI.create(formData)
      router.push('/dashboard/campaigns')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-slate-300">Set up a new email campaign</p>
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
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <Link
                href="/dashboard/campaigns"
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



