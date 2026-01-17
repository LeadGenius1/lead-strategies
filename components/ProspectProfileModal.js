'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function ProspectProfileModal({ isOpen, onClose, prospectId }) {
  const [prospect, setProspect] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emails, setEmails] = useState([])
  const [notes, setNotes] = useState([])

  useEffect(() => {
    if (isOpen && prospectId) {
      loadProspectDetails()
    }
  }, [isOpen, prospectId])

  async function loadProspectDetails() {
    if (!prospectId) return
    
    setLoading(true)
    try {
      const response = await api.get(`/api/leads/${prospectId}`)
      const data = response.data
      // Backend returns lead data directly or in data.lead
      setProspect(data.lead || data.prospect || data)
      setEmails(data.emails || [])
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Error loading prospect details:', error)
      // Fallback: if endpoint doesn't exist, use basic prospect data
      setProspect({ id: prospectId })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface border border-dark-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark-text">Prospect Profile</h2>
            <button
              onClick={onClose}
              className="text-dark-textMuted hover:text-dark-text transition"
            >
              ✕
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-dark-textMuted">Loading prospect details...</p>
          </div>
        ) : prospect ? (
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-dark-textMuted">Name</p>
                  <p className="text-dark-text font-medium">{prospect.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-textMuted">Email</p>
                  <p className="text-dark-text font-medium">{prospect.email || 'N/A'}</p>
                </div>
                {prospect.company && (
                  <div>
                    <p className="text-sm text-dark-textMuted">Company</p>
                    <p className="text-dark-text font-medium">{prospect.company}</p>
                  </div>
                )}
                {prospect.title && (
                  <div>
                    <p className="text-sm text-dark-textMuted">Title</p>
                    <p className="text-dark-text font-medium">{prospect.title}</p>
                  </div>
                )}
                {prospect.phone && (
                  <div>
                    <p className="text-sm text-dark-textMuted">Phone</p>
                    <p className="text-dark-text font-medium">{prospect.phone}</p>
                  </div>
                )}
                {prospect.website && (
                  <div>
                    <p className="text-sm text-dark-textMuted">Website</p>
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark-primary hover:text-dark-primaryHover"
                    >
                      {prospect.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Stats */}
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-4">Engagement</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-dark-bg rounded-lg">
                  <p className="text-sm text-dark-textMuted">Emails Sent</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">
                    {prospect.emails_sent || emails.length || 0}
                  </p>
                </div>
                <div className="p-4 bg-dark-bg rounded-lg">
                  <p className="text-sm text-dark-textMuted">Opens</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">
                    {prospect.opens || 0}
                  </p>
                </div>
                <div className="p-4 bg-dark-bg rounded-lg">
                  <p className="text-sm text-dark-textMuted">Replies</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">
                    {prospect.replies || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Email History */}
            {emails.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Email History</h3>
                <div className="space-y-3">
                  {emails.map((email) => (
                    <div key={email.id} className="p-4 bg-dark-bg rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-dark-text">{email.subject}</p>
                        <span className="text-xs text-dark-textMuted">
                          {new Date(email.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-dark-textMuted line-clamp-2">{email.body}</p>
                      {email.opened_at && (
                        <p className="text-xs text-green-400 mt-2">✓ Opened</p>
                      )}
                      {email.replied_at && (
                        <p className="text-xs text-blue-400 mt-1">✓ Replied</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Notes</h3>
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-dark-bg rounded-lg">
                      <p className="text-dark-text">{note.note || note}</p>
                      <p className="text-xs text-dark-textMuted mt-2">
                        {new Date(note.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-dark-textMuted">Prospect not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
