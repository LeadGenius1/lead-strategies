'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../lib/auth'
import { useDashboardStats, useCampaigns, useLeads } from '../../lib/hooks'
import { campaignAPI } from '../../lib/api'
import StatsCard from '../../components/Dashboard/StatsCard'
import CampaignList from '../../components/Dashboard/CampaignList'
import LeadTable from '../../components/Dashboard/LeadTable'
import QuickActions from '../../components/Dashboard/QuickActions'
import { Users, Mail, TrendingUp, BarChart3, Plus, Upload, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { stats, loading: statsLoading } = useDashboardStats()
  const { campaigns, loading: campaignsLoading, refetch: refetchCampaigns } = useCampaigns()
  const { leads, loading: leadsLoading } = useLeads(10)

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
      refetchCampaigns()
    } catch (error) {
      alert('Failed to update campaign')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      await campaignAPI.delete(id)
      refetchCampaigns()
    } catch (error) {
      alert('Failed to delete campaign')
    }
  }

  const quickActions = [
    {
      icon: Plus,
      label: 'New Campaign',
      description: 'Create email campaign',
      onClick: () => router.push('/dashboard/campaigns/new')
    },
    {
      icon: Upload,
      label: 'Import Leads',
      description: 'Upload CSV file',
      onClick: () => router.push('/dashboard/leads/import')
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed reports',
      onClick: () => router.push('/dashboard/analytics')
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Account settings',
      onClick: () => router.push('/dashboard/settings')
    },
  ]

  if (statsLoading || campaignsLoading || leadsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-300">Welcome back! Here&apos;s your campaign overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Leads"
            value={stats?.total_leads || 0}
            change="+12%"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.active_campaigns || 0}
            change="+3"
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Emails Sent"
            value={stats?.emails_sent || 0}
            change="+24%"
            icon={Mail}
            trend="up"
          />
          <StatsCard
            title="Reply Rate"
            value={`${stats?.reply_rate || 0}%`}
            change="+2.1%"
            icon={BarChart3}
            trend="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions actions={quickActions} />
        </div>

        {/* Campaigns and Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CampaignList
            campaigns={campaigns}
            onToggle={handleToggleCampaign}
            onView={(id) => router.push(`/dashboard/campaigns/${id}`)}
            onDelete={handleDeleteCampaign}
          />
          <LeadTable
            leads={leads}
            onLeadClick={(id) => router.push(`/dashboard/leads/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}

