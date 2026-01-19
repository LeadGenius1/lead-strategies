'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function WarmupStatus() {
  const [warmupCampaigns, setWarmupCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWarmup, setNewWarmup] = useState({
    domain: '',
    senderEmail: '',
  });

  useEffect(() => {
    loadWarmupCampaigns();
  }, []);

  const loadWarmupCampaigns = async () => {
    try {
      // Request warmup status via copilot
      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: 'Show my warmup campaigns status',
      });

      // Extract warmup data from response
      // For now, use mock data
      setWarmupCampaigns([
        {
          id: '1',
          domain: 'example.com',
          status: 'active',
          startDate: new Date().toISOString(),
          emailsSent: 450,
          opensReceived: 280,
          repliesReceived: 45,
          openRate: 62,
          replyRate: 10,
          currentVolume: 30,
          maxVolume: 50,
        },
      ]);
    } catch (error) {
      console.error('Failed to load warmup campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarmup = async () => {
    try {
      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: `Start a warmup campaign for domain ${newWarmup.domain} with sender ${newWarmup.senderEmail}`,
      });

      console.log('Warmup created:', response);
      setShowCreateModal(false);
      setNewWarmup({ domain: '', senderEmail: '' });
      loadWarmupCampaigns();
    } catch (error) {
      console.error('Failed to create warmup campaign:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-space-grotesk text-white">Domain Warmup</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-geist text-sm font-medium transition-colors"
        >
          + New Warmup Campaign
        </button>
      </div>

      {/* Warmup Campaigns */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 font-geist">Loading warmup campaigns...</div>
      ) : warmupCampaigns.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 font-geist">
          No warmup campaigns. Create your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {warmupCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-[#050505] border border-subtle rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-space-grotesk text-white mb-1">{campaign.domain}</h3>
                  <p className="text-sm font-geist text-neutral-400">
                    Started {new Date(campaign.startDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded font-geist ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm font-geist text-neutral-400 mb-2">
                  <span>Volume Progress</span>
                  <span>{campaign.currentVolume} / {campaign.maxVolume} emails/day</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(campaign.currentVolume / campaign.maxVolume) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm font-geist text-neutral-400">Emails Sent</div>
                  <div className="text-xl font-space-grotesk text-white">{campaign.emailsSent}</div>
                </div>
                <div>
                  <div className="text-sm font-geist text-neutral-400">Open Rate</div>
                  <div className="text-xl font-space-grotesk text-white">{campaign.openRate}%</div>
                </div>
                <div>
                  <div className="text-sm font-geist text-neutral-400">Replies</div>
                  <div className="text-xl font-space-grotesk text-white">{campaign.repliesReceived}</div>
                </div>
                <div>
                  <div className="text-sm font-geist text-neutral-400">Reply Rate</div>
                  <div className="text-xl font-space-grotesk text-white">{campaign.replyRate}%</div>
                </div>
              </div>

              <div className="pt-4 border-t border-subtle">
                <button className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-geist text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Warmup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#050505] border border-subtle rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-space-grotesk text-white mb-4">Create Warmup Campaign</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-geist text-neutral-400 mb-2">Domain</label>
                <input
                  type="text"
                  value={newWarmup.domain}
                  onChange={(e) => setNewWarmup({ ...newWarmup, domain: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-geist text-neutral-400 mb-2">Sender Email</label>
                <input
                  type="email"
                  value={newWarmup.senderEmail}
                  onChange={(e) => setNewWarmup({ ...newWarmup, senderEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="sender@example.com"
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
                onClick={handleCreateWarmup}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-geist text-sm font-medium transition-colors"
              >
                Start Warmup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
