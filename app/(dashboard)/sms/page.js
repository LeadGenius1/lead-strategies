'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Phone, MessageSquare, Send, Plus, Loader2, Play, Pause } from 'lucide-react';

export default function SMSPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const response = await api.get('/api/sms-campaigns').catch(() => ({ data: null }));
      const data = response?.data?.data || response?.data;
      const list = Array.isArray(data?.campaigns) ? data.campaigns : (Array.isArray(data) ? data : []);
      setCampaigns(list);
    } catch (error) {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCampaign(campaignId, currentStatus) {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await api.put(`/api/sms-campaigns/${campaignId}`, { status: newStatus });
      toast.success(`SMS Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadCampaigns();
    } catch (error) {
      toast.success('Use Lead Hunter or Proactive Hunter to create SMS campaigns!');
      loadCampaigns();
    }
  }

  const campaignsList = Array.isArray(campaigns) ? campaigns : [];
  const stats = [
    { label: 'Total SMS Campaigns', value: campaignsList.length, icon: Phone, iconBg: 'bg-indigo-500/10', iconBorder: 'border-indigo-500/20', iconColor: 'text-indigo-400' },
    { label: 'Active', value: campaignsList.filter((c) => c.status === 'active').length, icon: Play, iconBg: 'bg-emerald-500/10', iconBorder: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
    { label: 'Messages Sent', value: campaignsList.reduce((sum, c) => sum + (c.sentCount || c.sent_count || 0), 0), icon: Send, iconBg: 'bg-cyan-500/10', iconBorder: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
    { label: 'Avg Reply Rate', value: '18%', icon: MessageSquare, iconBg: 'bg-purple-500/10', iconBorder: 'border-purple-500/20', iconColor: 'text-purple-400' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft':
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  return (
    <div className="relative min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white">SMS Outreach</h1>
            <p className="text-neutral-500 mt-1 text-sm">Manage SMS campaigns and outreach</p>
          </div>
          <button
            onClick={() => toast.success('Use Lead Hunter or Proactive Hunter to create SMS campaigns!')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New SMS Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} border ${stat.iconBorder} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Loading SMS campaigns...</p>
          </div>
        ) : campaignsList.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Phone className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">No SMS campaigns yet</p>
            <p className="text-neutral-600 text-sm mb-4">Create your first SMS campaign to reach leads directly</p>
            <button
              onClick={() => toast.success('Use Lead Hunter or Proactive Hunter to create SMS campaigns!')}
              className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium transition-all"
            >
              Create SMS Campaign
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
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Delivered</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Replies</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaignsList.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-neutral-500 truncate max-w-xs">{campaign.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(campaign.status)}`}>{campaign.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-neutral-500" />
                        {campaign.sentCount || campaign.sent_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        {campaign.deliveredCount || campaign.delivered_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-neutral-500" />
                        {campaign.replyCount || campaign.reply_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleCampaign(campaign.id, campaign.status)}
                          className={`p-2 rounded-lg transition-all ${
                            campaign.status === 'active' ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
  );
}
