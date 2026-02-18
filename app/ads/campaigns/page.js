'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BarChart3, Eye, MousePointer, DollarSign, TrendingUp, Plus,
  Play, Pause, Clock, CheckCircle, XCircle, ArrowLeft,
  Pencil, Trash2, MoreHorizontal, Search, Target,
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',   Icon: Clock },
  APPROVED:  { label: 'Active',    color: 'text-green-400 bg-green-400/10 border-green-400/20',    Icon: Play },
  PAUSED:    { label: 'Paused',    color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20', Icon: Pause },
  COMPLETED: { label: 'Completed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',      Icon: CheckCircle },
  REJECTED:  { label: 'Rejected',  color: 'text-red-400 bg-red-400/10 border-red-400/20',         Icon: XCircle },
};

export default function CampaignsList() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.get('/api/v1/advertiser/campaigns');
      const d = res.data?.data || res.data;
      setCampaigns(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/api/v1/advertiser/campaigns/${id}`, { status: 'PAUSED' });
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: 'PAUSED' } : c));
    } catch (err) {
      console.error('Failed to pause campaign:', err);
    }
    setActionMenu(null);
  };

  const handleResume = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/api/v1/advertiser/campaigns/${id}`, { status: 'APPROVED' });
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: 'APPROVED' } : c));
    } catch (err) {
      console.error('Failed to resume campaign:', err);
    }
    setActionMenu(null);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;
    try {
      await api.delete(`/api/v1/advertiser/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
    setActionMenu(null);
  };

  const filtered = campaigns
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
    });

  const formatMoney = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const calcCTR = (clicks, impressions) => {
    if (!impressions) return '0.00%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  // ── Summary stats ──
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetTotal || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.budgetSpent || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/ads/dashboard" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-3">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Campaigns
          </h1>
          <p className="text-neutral-400 text-sm font-light">Manage and monitor all your ad campaigns.</p>
        </div>
        <Link
          href="/ads/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-neutral-900/30 border border-white/10 p-5 animate-pulse">
                <div className="h-3 bg-neutral-800/50 rounded w-16 mb-3" />
                <div className="h-7 bg-neutral-800/50 rounded w-20" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-neutral-900/30 border border-white/10 p-5 animate-pulse">
            <div className="h-4 bg-neutral-800/50 rounded w-full mb-4" />
            <div className="h-4 bg-neutral-800/50 rounded w-full mb-4" />
            <div className="h-4 bg-neutral-800/50 rounded w-3/4" />
          </div>
        </>
      )}

      {!loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Budget', value: formatMoney(totalBudget), Icon: DollarSign },
              { label: 'Total Spent', value: formatMoney(totalSpent), Icon: TrendingUp },
              { label: 'Impressions', value: totalImpressions.toLocaleString(), Icon: Eye },
              { label: 'Avg CTR', value: calcCTR(totalClicks, totalImpressions), Icon: MousePointer },
            ].map((stat) => (
              <div key={stat.label} className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-5">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="flex items-center gap-2 mb-2">
                  <stat.Icon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-neutral-500">{stat.label}</span>
                </div>
                <div className="text-xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
            <div className="flex gap-2 flex-wrap flex-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'APPROVED', label: 'Active' },
                { key: 'PENDING', label: 'Pending' },
                { key: 'PAUSED', label: 'Paused' },
                { key: 'COMPLETED', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    filter === tab.key
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-neutral-900/30 text-neutral-400 border border-white/5 hover:border-white/10 hover:text-neutral-300'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'all' ? ` (${campaigns.length})` : ` (${campaigns.filter((c) => c.status === tab.key).length})`}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-lg bg-neutral-900/30 border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/30 transition-colors"
              />
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-16 text-center">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <Target className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-white mb-2">
                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
              </h2>
              <p className="text-neutral-400 text-sm mb-6">
                {campaigns.length === 0
                  ? 'Create your first campaign to start reaching viewers.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {campaigns.length === 0 && (
                <Link
                  href="/ads/campaigns/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </Link>
              )}
            </div>
          )}

          {/* Campaigns table */}
          {filtered.length > 0 && (
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-medium text-neutral-500 px-5 py-4">Campaign</th>
                      <th className="text-left text-xs font-medium text-neutral-500 px-5 py-4">Status</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">Budget</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">Spent</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">Impressions</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">Clicks</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">CTR</th>
                      <th className="text-right text-xs font-medium text-neutral-500 px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((campaign) => {
                      const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.PENDING;
                      const budgetPct = campaign.budgetTotal > 0
                        ? Math.min(100, Math.round((campaign.budgetSpent / campaign.budgetTotal) * 100))
                        : 0;

                      return (
                        <tr
                          key={campaign.id}
                          className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Campaign name */}
                          <td className="px-5 py-4">
                            <Link href={`/ads/campaigns/${campaign.id}`} className="group">
                              <div className="text-white font-medium group-hover:text-indigo-300 transition-colors truncate max-w-[200px]">
                                {campaign.name}
                              </div>
                              <div className="text-xs text-neutral-500 truncate max-w-[200px]">{campaign.title}</div>
                            </Link>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${sc.color}`}>
                              <sc.Icon className="w-3 h-3" />
                              {sc.label}
                            </span>
                          </td>

                          {/* Budget with progress bar */}
                          <td className="px-5 py-4 text-right">
                            <div className="text-white font-medium">{formatMoney(campaign.budgetTotal)}</div>
                            <div className="mt-1 w-20 ml-auto">
                              <div className="h-1 bg-neutral-800/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                  style={{ width: `${budgetPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Spent */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-white">{formatMoney(campaign.budgetSpent)}</span>
                          </td>

                          {/* Impressions */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-white">{(campaign.impressions || 0).toLocaleString()}</span>
                          </td>

                          {/* Clicks */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-white">{(campaign.clicks || 0).toLocaleString()}</span>
                          </td>

                          {/* CTR */}
                          <td className="px-5 py-4 text-right">
                            <span className="text-white">{calcCTR(campaign.clicks, campaign.impressions)}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActionMenu(actionMenu === campaign.id ? null : campaign.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>

                              {actionMenu === campaign.id && (
                                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-neutral-900 border border-white/10 shadow-2xl z-50 py-1">
                                  <Link
                                    href={`/ads/campaigns/${campaign.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                                    onClick={() => setActionMenu(null)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit Campaign
                                  </Link>
                                  {campaign.status === 'APPROVED' && (
                                    <button
                                      onClick={(e) => handlePause(e, campaign.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Pause className="w-3 h-3" />
                                      Pause Campaign
                                    </button>
                                  )}
                                  {campaign.status === 'PAUSED' && (
                                    <button
                                      onClick={(e) => handleResume(e, campaign.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-xs text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Play className="w-3 h-3" />
                                      Resume Campaign
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleDelete(e, campaign.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete Campaign
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

/** AETHER shell wrapper */
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </div>
    </div>
  );
}
