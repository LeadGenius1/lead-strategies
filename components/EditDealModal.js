'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function EditDealModal({ isOpen, onClose, onSuccess, dealId }) {
  const [loading, setLoading] = useState(false)
  const [deal, setDeal] = useState(null)
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    contactEmail: '',
    value: '',
    stage: 'lead',
    expectedCloseDate: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen && dealId) {
      loadDeal()
    }
  }, [isOpen, dealId])

  async function loadDeal() {
    try {
      const response = await api.get(`/api/crm/deals/${dealId}`)
      const dealData = response.data.deal || response.data
      setDeal(dealData)
      setFormData({
        company: dealData.company || '',
        contact: dealData.contact || '',
        contactEmail: dealData.contact_email || '',
        value: dealData.value || '',
        stage: dealData.stage || 'lead',
        expectedCloseDate: dealData.expected_close_date ? dealData.expected_close_date.split('T')[0] : '',
        notes: dealData.notes || '',
      })
    } catch (error) {
      console.error('Error loading deal:', error)
      toast.error('Failed to load deal details')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.company || !formData.contact || !formData.value) {
      toast.error('Please fill in company, contact, and value')
      return
    }

    const value = parseFloat(formData.value)
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid deal value')
      return
    }

    setLoading(true)
    try {
      // Backend expects: name, value, stage, description, expectedClose
      await api.put(`/api/tackle/deals/${dealId}`, {
        name: `${formData.company} - ${formData.contact}`,
        value: value,
        stage: formData.stage,
        description: formData.notes,
        expectedClose: formData.expectedCloseDate || null,
      })
      toast.success('Deal updated successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update deal')
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
            <h2 className="text-2xl font-bold text-dark-text">Edit Deal</h2>
            <button
              onClick={onClose}
              className="text-dark-textMuted hover:text-dark-text transition"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Company *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="Contact Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
              placeholder="contact@company.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Deal Value ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition"
                placeholder="25000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Stage *
              </label>
              <select
                required
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary transition"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Expected Close Date
            </label>
            <input
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary transition resize-none"
              placeholder="Additional notes about this deal..."
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
              {loading ? 'Updating...' : 'Update Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
