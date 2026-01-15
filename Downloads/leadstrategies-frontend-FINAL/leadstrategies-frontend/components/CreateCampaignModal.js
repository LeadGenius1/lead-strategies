'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function CreateCampaignModal({ isOpen, onClose, onSuccess, websiteProspects }) {
  const [loading, setLoading] = useState(false)
  const [prospects, setProspects] = useState([])
  const [selectedProspects, setSelectedProspects] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    scheduledFor: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadProspects()
      // Pre-select website prospects if provided
      if (websiteProspects && websiteProspects.length > 0) {
        setSelectedProspects(websiteProspects.map(p => p.id))
      }
    }
  }, [isOpen, websiteProspects])

  async function loadProspects() {
    try {
      const response = await api.get('/api/leads')
      // Backend returns { success: true, data: { leads: [...] } }
      const prospectsList = response.data?.leads || response.data?.prospects || response.data || []
      setProspects(prospectsList)
    } catch (error) {
      console.error('Error loading prospects:', error)
    }
  }

  function handleProspectToggle(prospectId) {
    setSelectedProspects(prev =>
      prev.includes(prospectId)
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Please fill in all required fields')
      return
    }

    if (selectedProspects.length === 0) {
      toast.error('Please select at least one prospect')
      return
    }

    setLoading(true)
    try {
      const campaignData = {
        name: formData.name,
        subject: formData.subject,
        htmlContent: formData.body, // Backend expects htmlContent
        leadIds: selectedProspects, // Backend uses leadIds, not prospectIds
        scheduledAt: formData.scheduledFor || null, // Backend expects scheduledAt
      }

      await api.post('/api/campaigns', campaignData)
      toast.success('Campaign created successfully!')
      onSuccess?.()
      onClose()
      
      // Reset form
      setFormData({ name: '', subject: '', body: '', scheduledFor: '' })
      setSelectedProspects([])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark-text">Create New Campaign</h2>
            <button
              onClick={onClose}
              className="text-dark-textMuted hover:text-dark-text transition"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
              placeholder="e.g., Q1 2024 Outreach Campaign"
            />
          </div>

          {/* Email Subject */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
              placeholder="Subject line for your emails"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Email Body *
            </label>
            <textarea
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition resize-none"
              placeholder="Write your email template here. Use {{name}} for personalization."
            />
            <p className="text-xs text-dark-textMuted mt-2">
              Tip: Use {'{{name}}'}, {'{{company}}'}, {'{{title}}'} for personalization
            </p>
          </div>

          {/* Prospect Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Select Prospects * ({selectedProspects.length} selected)
            </label>
            <div className="max-h-64 overflow-y-auto border border-dark-border rounded-lg p-4 bg-dark-bg">
              {prospects.length === 0 ? (
                <p className="text-dark-textMuted text-sm">No prospects available. Add prospects first.</p>
              ) : (
                <div className="space-y-2">
                  {prospects.map((prospect) => (
                    <label
                      key={prospect.id}
                      className="flex items-center gap-3 p-2 hover:bg-dark-surfaceHover rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProspects.includes(prospect.id)}
                        onChange={() => handleProspectToggle(prospect.id)}
                        className="w-4 h-4 rounded border-dark-border text-dark-primary focus:ring-dark-primary"
                      />
                      <div className="flex-1">
                        <p className="text-dark-text font-medium">{prospect.name || 'Unknown'}</p>
                        <p className="text-sm text-dark-textMuted">{prospect.email}</p>
                        {prospect.company && (
                          <p className="text-xs text-dark-textMuted">{prospect.company}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Schedule (Optional) */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Schedule Send (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary transition"
            />
            <p className="text-xs text-dark-textMuted mt-2">
              Leave empty to send immediately
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-dark-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-dark-surfaceHover hover:bg-dark-border text-dark-text rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
