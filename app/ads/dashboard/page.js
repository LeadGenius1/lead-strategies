'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BarChart3, Eye, MousePointer, DollarSign, TrendingUp, Plus,
  Play, Pause, Clock, CheckCircle, XCircle, ArrowLeft,
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',   Icon: Clock },
  APPROVED:  { label: 'Active',    color: 'text-green-400 bg-green-400/10 border-green-400/20',    Icon: Play },
  PAUSED:    { label: 'Paused',    color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20', Icon: Pause },
  COMPLETED: { label: 'Completed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',      Icon: CheckCircle },
  REJECTED:  { label: 'Rejected',  color: 'text-red-400 bg-red-400/10 border-red-400/20',         Icon: XCircle },
};

export default function AdvertiserDashboard() {
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(null); // null=loading, true/false
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [profileRes, analyticsRes, campaignsRes] = await Promise.allSettled([
        api.get('/api/v1/advertiser/profile'),
        api.get('/api/v1/advertiser/analytics'),
        api.get('/api/v1/advertiser/campaigns'),
      ]);

      if (profileRes.status === 'fulfilled') {
        setRegistered(true);
      } else {
        setRegistered(false);
        return;
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data?.data || analyticsRes.value.data);
      }

      if (campaignsRes.status === 'fulfilled') {
        const d = campaignsRes.value.data?.data || campaignsRes.value.data;
        setCampaigns(Array.isArray(d) ? d : []);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? campaigns
    : campaigns.filter((c) => c.status === filter);

  const formatMoney = (n) => `$${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Not registered state ──
  if (!loading && registered === false) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-3">Create Your Advertiser Account</h2>
          <p className="text-neutral-400 text-sm mb-8">
            Register as an advertiser to start creating campaigns and reaching viewers on VideoSite.AI.
          </p>
          <Link
            href="/ads/register"
            className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium transition-all"
          >
            Register as Advertiser
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/ads" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-3">
            <ArrowLeft className="w-3 h-3" /> Back to Advertise
          </Link>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Advertiser Dashboard
          </h1>
          <p className="text-neutral-400 text-sm font-light">Manage campaigns and track performance.</p>
        </div>
        <Link
          href="/ads/campaigns/create"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-neutral-900/30 border border-white/10 p-5 animate-pulse">
              <div className="h-3 bg-neutral-800/50 rounded w-16 mb-3" />
              <div className="h-7 bg-neutral-800/50 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Analytics cards */}
      {!loading && analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Campaigns', value: analytics.totalCampaigns, Icon: BarChart3 },
            { label: 'Total Spent', value: formatMoney(analytics.totalSpent), Icon: DollarSign },
            { label: 'Views', value: (analytics.totalViews || 0).toLocaleString(), Icon: Eye },
            { label: 'Clicks', value: (analytics.totalClicks || 0).toLocaleString(), Icon: MousePointer },
            { label: 'CTR', value: `${analytics.ctr || 0}%`, Icon: TrendingUp },
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
      )}

      {/* Campaign filter tabs */}
      {!loading && (
        <div className="flex gap-2 mb-6 flex-wrap">
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
      )}

      {/* Campaign list */}
      {!loading && filtered.length === 0 && (
        <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-16 text-center">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <BarChart3 className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">
            {filter === 'all' ? 'No campaigns yet' : `No ${filter.toLowerCase()} campaigns`}
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            {filter === 'all'
              ? 'Create your first campaign to start reaching viewers.'
              : 'No campaigns match this filter.'}
          </p>
          {filter === 'all' && (
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

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((campaign) => {
            const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.PENDING;
            const budgetPct = campaign.budgetTotal > 0
              ? Math.min(100, Math.round((campaign.budgetSpent / campaign.budgetTotal) * 100))
              : 0;

            return (
              <Link
                key={campaign.id}
                href={`/ads/campaigns/${campaign.id}`}
                className="group relative block rounded-2xl bg-neutral-900/30 border border-white/10 p-5 hover:border-indigo-500/30 transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">
                        {campaign.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${sc.color}`}>
                        <sc.Icon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{campaign.title}</p>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-6 text-xs text-neutral-400">
                    <div className="text-center">
                      <div className="text-white font-medium">{(campaign.impressions || 0).toLocaleString()}</div>
                      <div className="text-neutral-500">Impressions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">{(campaign.views || 0).toLocaleString()}</div>
                      <div className="text-neutral-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">{(campaign.clicks || 0).toLocaleString()}</div>
                      <div className="text-neutral-500">Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">{campaign.tier}</div>
                      <div className="text-neutral-500">Tier</div>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="w-full lg:w-40">
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
                      <span>{formatMoney(campaign.budgetSpent)}</span>
                      <span>{formatMoney(campaign.budgetTotal)}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
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
