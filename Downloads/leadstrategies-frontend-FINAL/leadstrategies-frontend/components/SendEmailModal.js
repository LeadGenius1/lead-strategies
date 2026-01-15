'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function SendEmailModal({ isOpen, onClose, onSuccess, prospect }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
  })

  useEffect(() => {
    if (isOpen && prospect) {
      // Pre-fill subject with prospect name if available
      if (prospect.name) {
        setFormData(prev => ({
          ...prev,
          subject: prev.subject || `Re: ${prospect.name} - ${prospect.company || 'Inquiry'}`,
        }))
      }
    }
  }, [isOpen, prospect])

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.subject || !formData.body) {
      toast.error('Please fill in subject and body')
      return
    }

    if (!prospect?.id) {
      toast.error('Prospect information missing')
      return
    }

    setLoading(true)
    try {
      // Note: Backend doesn't have this endpoint yet, using campaigns as workaround
      // TODO: Implement /api/leads/:id/send-email in backend
      // For now, create a single-recipient campaign and send it
      await api.post('/api/campaigns', {
        name: `Email to ${prospect.name || prospect.email}`,
        subject: formData.subject,
        htmlContent: formData.body,
        leadIds: [prospect.id],
        status: 'draft'
      }).then(async (campaignRes) => {
        // Send the campaign immediately
        const campaignId = campaignRes.data?.campaign?.id || campaignRes.data?.id
        if (campaignId) {
          await api.post(`/api/campaigns/${campaignId}/send`)
        }
      })
      toast.success('Email sent successfully!')
      onSuccess?.()
      onClose()
      
      // Reset form
      setFormData({ subject: '', body: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark-text">Send Email</h2>
              {prospect && (
                <p className="text-sm text-dark-textMuted mt-1">
                  To: {prospect.name} &lt;{prospect.email}&gt;
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-dark-textMuted hover:text-dark-text transition"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Message *
            </label>
            <textarea
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition resize-none"
              placeholder="Write your email message here..."
            />
          </div>

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
              {loading ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
