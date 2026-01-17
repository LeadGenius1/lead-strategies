'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import CreateCampaignModal from '@/components/CreateCampaignModal'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  function handleCampaignCreated() {
    loadCampaigns()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'draft': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Campaigns</h1>
          <p className="text-dark-textMuted mt-1">Manage your email outreach campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition"
        >
          + New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: '📧' },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, icon: '🚀' },
          { label: 'Emails Sent', value: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0), icon: '✉️' },
          { label: 'Reply Rate', value: '24%', icon: '💬' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-surface border border-dark-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-dark-text">{stat.value}</p>
                <p className="text-sm text-dark-textMuted">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
          <p className="text-dark-textMuted">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 text-center">
          <p className="text-dark-textMuted mb-4">No campaigns yet. Create your first campaign to start generating leads!</p>
          <button className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition">
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-surfaceHover">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Campaign</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Sent</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Opens</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-textMuted">Replies</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-textMuted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-dark-surfaceHover transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-dark-text">{campaign.name}</p>
                    <p className="text-sm text-dark-textMuted">{campaign.subject}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-text">{campaign.sentCount || campaign.sent_count || 0}</td>
                  <td className="px-6 py-4 text-dark-text">{campaign.openedCount || campaign.open_count || 0}</td>
                  <td className="px-6 py-4 text-dark-text">{campaign.replyCount || campaign.reply_count || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        // Navigate to campaign details or show modal
                        // For now, we'll show an alert with campaign details
                        alert(`Campaign: ${campaign.name}\nStatus: ${campaign.status}\nSent: ${campaign.sentCount || campaign.sent_count || 0}\nOpens: ${campaign.openedCount || campaign.open_count || 0}\nReplies: ${campaign.replyCount || campaign.reply_count || 0}`)
                      }}
                      className="text-dark-primary hover:text-dark-primaryHover text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCampaignCreated}
      />
    </div>
  )
}
