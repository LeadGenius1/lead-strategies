'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    goal: '',
    targetLeads: '',
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      // This would call your backend API
      // const response = await apiClient.get('/api/v1/campaigns');
      // setCampaigns(response.data);
      
      // Mock data for now
      setCampaigns([
        {
          id: '1',
          name: 'SaaS CTO Outreach',
          status: 'active',
          leads: 150,
          emailsSent: 120,
          replies: 15,
          openRate: 65,
        },
      ]);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      // Use copilot to create campaign
      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: `Create a campaign: ${newCampaign.name} with goal: ${newCampaign.goal} for ${newCampaign.targetLeads} leads`,
      });

      // Handle response and create campaign
      console.log('Campaign created:', response);
      setShowCreateModal(false);
      setNewCampaign({ name: '', goal: '', targetLeads: '' });
      loadCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-space-grotesk text-white">Campaigns</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-geist text-sm font-medium transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 font-geist">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 font-geist">
          No campaigns yet. Create your first campaign!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-[#050505] border border-subtle rounded-lg p-6 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-space-grotesk text-white">{campaign.name}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded font-geist ${
                    campaign.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>

              <div className="space-y-2 text-sm font-geist text-neutral-400">
                <div className="flex justify-between">
                  <span>Leads:</span>
                  <span className="text-white">{campaign.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emails Sent:</span>
                  <span className="text-white">{campaign.emailsSent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Replies:</span>
                  <span className="text-white">{campaign.replies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Rate:</span>
                  <span className="text-white">{campaign.openRate}%</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-subtle">
                <button className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-geist text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#050505] border border-subtle rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-space-grotesk text-white mb-4">Create New Campaign</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-geist text-neutral-400 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g., SaaS CTO Outreach"
                />
              </div>

              <div>
                <label className="block text-sm font-geist text-neutral-400 mb-2">Campaign Goal</label>
                <input
                  type="text"
                  value={newCampaign.goal}
                  onChange={(e) => setNewCampaign({ ...newCampaign, goal: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="e.g., Book demos with CTOs"
                />
              </div>

              <div>
                <label className="block text-sm font-geist text-neutral-400 mb-2">Target Leads</label>
                <input
                  type="number"
                  value={newCampaign.targetLeads}
                  onChange={(e) => setNewCampaign({ ...newCampaign, targetLeads: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-geist text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-geist text-sm font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
