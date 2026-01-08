'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../../lib/auth'
import { leadAPI } from '../../../../lib/api'
import { ArrowLeft, Edit, Mail, Building, Phone, Calendar, Trash2 } from 'lucide-react'

export default function LeadDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const leadId = params.id
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    const fetchLead = async () => {
      try {
        setLoading(true)
        const data = await leadAPI.getById(leadId)
        setLead(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load lead')
      } finally {
        setLoading(false)
      }
    }

    if (leadId) {
      fetchLead()
    }
  }, [leadId, router])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    try {
      await leadAPI.delete(leadId)
      router.push('/dashboard/leads')
    } catch (error) {
      alert('Failed to delete lead')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Lead not found'}</p>
          <Link href="/dashboard/leads" className="btn-primary">
            Back to Leads
          </Link>
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
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lead.name || 'Unnamed Lead'}</h1>
              <p className="text-slate-300">Lead details and information</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/leads/${leadId}/edit`}
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

        {/* Lead Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-white">{lead.email || 'N/A'}</p>
              </div>
              {lead.phone && (
                <div>
                  <label className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <p className="text-white">{lead.phone}</p>
                </div>
              )}
              {lead.company && (
                <div>
                  <label className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4" />
                    Company
                  </label>
                  <p className="text-white">{lead.company}</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Lead Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1">Status</label>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    lead.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'replied' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {lead.status || 'new'}
                  </span>
                </div>
              </div>
              {lead.created_at && (
                <div>
                  <label className="text-sm text-slate-400 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Added
                  </label>
                  <p className="text-white">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {lead.notes && (
          <div className="glass-card p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

