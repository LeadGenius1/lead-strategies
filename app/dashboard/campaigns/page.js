'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../../lib/auth'
import { useCampaigns } from '../../../lib/hooks'
import { campaignAPI } from '../../../lib/api'
import CampaignList from '../../../components/Dashboard/CampaignList'
import { Plus, Search, Filter } from 'lucide-react'
import { useState } from 'react'

export default function CampaignsPage() {
  const router = useRouter()
  const { campaigns, loading, refetch } = useCampaigns()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleToggleCampaign = async (id, status) => {
    try {
      if (status === 'active') {
        await campaignAPI.pause(id)
      } else {
        await campaignAPI.start(id)
      }
      refetch()
    } catch (error) {
      alert('Failed to update campaign')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      await campaignAPI.delete(id)
      refetch()
    } catch (error) {
      alert('Failed to delete campaign')
    }
  }

  const filteredCampaigns = campaigns?.filter((campaign) => {
    const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus
    return matchesSearch && matchesFilter
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading campaigns...</p>
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
            <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
            <p className="text-slate-300">Manage your email campaigns</p>
          </div>
          <Link href="/dashboard/campaigns/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Campaign
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-auto min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Campaigns List */}
        <CampaignList
          campaigns={filteredCampaigns}
          onToggle={handleToggleCampaign}
          onView={(id) => router.push(`/dashboard/campaigns/${id}`)}
          onDelete={handleDeleteCampaign}
        />

        {filteredCampaigns.length === 0 && !loading && (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'No campaigns match your filters'
                : 'No campaigns yet. Create your first campaign!'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link href="/dashboard/campaigns/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Campaign
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

