'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Zap, Mail, Eye, MessageSquare, Plus, Loader2, Play, Pause, BarChart3 } from 'lucide-react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function loadCampaigns() {
    try {
      const response = await api.get('/api/campaigns')
      setCampaigns(response.data || [])
    } catch (error) {
      console.error('Error loading campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleCampaign(campaignId, currentStatus) {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      await api.put(`/api/campaigns/${campaignId}`, { status: newStatus })
      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
      loadCampaigns()
    } catch (error) {
      toast.error('Failed to update campaign')
    }
  }

  const stats = [
    { label: 'Total Campaigns', value: campaigns.length, icon: Zap, color: 'indigo' },
    { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, icon: Play, color: 'emerald' },
    { label: 'Emails Sent', value: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0), icon: Mail, color: 'cyan' },
    { label: 'Avg Reply Rate', value: '24%', icon: MessageSquare, color: 'purple' },
  ]

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'draft': return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Campaigns</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage your email outreach campaigns</p>
          </div>
          <button
            onClick={() => toast.success('Use Lead Hunter to create campaigns with AI!')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Campaigns Table */}
        {loading ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Zap className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No campaigns yet</p>
            <p className="text-neutral-600 text-sm mb-4">Create your first campaign to start generating leads</p>
            <button className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium transition-all">
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/50 border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Sent</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Opens</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Replies</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-neutral-500 truncate max-w-xs">{campaign.subject}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-500" />
                        {campaign.sent_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-neutral-500" />
                        {campaign.open_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-neutral-500" />
                        {campaign.reply_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleCampaign(campaign.id, campaign.status)}
                          className={`p-2 rounded-lg transition-all ${
                            campaign.status === 'active' 
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-all">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
