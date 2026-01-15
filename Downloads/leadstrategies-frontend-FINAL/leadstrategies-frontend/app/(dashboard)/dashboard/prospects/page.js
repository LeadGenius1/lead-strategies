'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import AddProspectModal from '@/components/AddProspectModal'
import ProspectProfileModal from '@/components/ProspectProfileModal'
import SendEmailModal from '@/components/SendEmailModal'

export default function ProspectsPage() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState(null)

  useEffect(() => {
    loadProspects()
  }, [filter])

  async function loadProspects() {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await api.get(`/api/leads${params}`)
      // Backend returns { success: true, data: { leads: [...] } }
      setProspects(response.data?.leads || response.data?.prospects || response.data || [])
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400'
      case 'contacted': return 'bg-yellow-500/20 text-yellow-400'
      case 'qualified': return 'bg-green-500/20 text-green-400'
      case 'converted': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Prospects</h1>
          <p className="text-dark-textMuted mt-1">Manage and track your prospects</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition"
        >
          + Add Prospect
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'new', 'contacted', 'qualified', 'converted'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === status
                ? 'bg-dark-primary text-white'
                : 'bg-dark-surface border border-dark-border text-dark-textMuted hover:text-dark-text'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Prospects Grid */}
      {loading ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
          <p className="text-dark-textMuted">Loading prospects...</p>
        </div>
      ) : prospects.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
          <p className="text-dark-textMuted mb-4">No prospects found. Analyze a website to discover prospects!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prospects.map((prospect) => (
            <div
              key={prospect.id}
              className="bg-dark-surface border border-dark-border rounded-xl p-6 hover:border-dark-primary transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-dark-surfaceHover rounded-full flex items-center justify-center text-xl">
                    {prospect.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-text">{prospect.name || 'Unknown'}</h3>
                    <p className="text-sm text-dark-textMuted">{prospect.email}</p>
                    {prospect.company && (
                      <p className="text-sm text-dark-textMuted">{prospect.title} at {prospect.company}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prospect.status)}`}>
                  {prospect.status || 'new'}
                </span>
              </div>
              
              <div className="flex gap-4 mt-4 pt-4 border-t border-dark-border">
                <span className="text-sm text-dark-textMuted">📧 {prospect.emails_sent || 0} emails</span>
                <span className="text-sm text-dark-textMuted">👁️ {prospect.opens || 0} opens</span>
                <span className="text-sm text-dark-textMuted">💬 {prospect.replies || 0} replies</span>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    setSelectedProspect(prospect)
                    setShowEmailModal(true)
                  }}
                  className="px-4 py-2 bg-dark-primary hover:bg-dark-primaryHover text-white text-sm rounded-lg transition"
                >
                  Send Email
                </button>
                <button 
                  onClick={() => {
                    setSelectedProspect(prospect)
                    setShowProfileModal(true)
                  }}
                  className="px-4 py-2 bg-dark-surfaceHover hover:bg-dark-border text-dark-text text-sm rounded-lg transition"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddProspectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleProspectAdded}
      />

      <ProspectProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false)
          setSelectedProspect(null)
        }}
        prospectId={selectedProspect?.id}
      />

      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false)
          setSelectedProspect(null)
        }}
        onSuccess={handleEmailSent}
        prospect={selectedProspect}
      />
    </div>
  )

  function handleProspectAdded() {
    loadProspects()
  }

  function handleEmailSent() {
    loadProspects()
  }
}
