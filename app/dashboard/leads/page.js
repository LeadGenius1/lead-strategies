'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../lib/auth'
import { useLeads } from '../../../lib/hooks'
import { leadAPI } from '../../../lib/api'
import LeadTable from '../../../components/Dashboard/LeadTable'
import { Plus, Upload, Search, Download } from 'lucide-react'

export default function LeadsPage() {
  const router = useRouter()
  const { leads, loading, refetch } = useLeads(100) // Get more leads for full list
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const filteredLeads = leads?.filter((lead) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower)
    )
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leads</h1>
            <p className="text-slate-300">
              Manage your leads ({filteredLeads.length} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/leads/import" className="btn-secondary flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import CSV
            </Link>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Leads Table */}
        <LeadTable
          leads={filteredLeads}
          onLeadClick={(id) => router.push(`/dashboard/leads/${id}`)}
        />

        {filteredLeads.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 mb-4">
              {searchTerm ? 'No leads match your search' : 'No leads yet. Import or create your first lead!'}
            </p>
            {!searchTerm && (
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/leads/import" className="btn-primary inline-flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import CSV
                </Link>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

