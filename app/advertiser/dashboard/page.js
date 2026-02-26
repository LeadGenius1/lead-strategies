'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Eye, DollarSign, Zap, Plus, X, LogOut } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

const CATEGORIES = ['Technology', 'Health', 'Finance', 'Education', 'Entertainment', 'Food', 'Travel', 'Other'];
const TIERS = [
  { value: 'starter', label: 'Starter', cpv: '$0.05/view' },
  { value: 'professional', label: 'Professional', cpv: '$0.10/view' },
  { value: 'premium', label: 'Premium', cpv: '$0.20/view' },
];
const CPV_MAP = { starter: 5, professional: 10, premium: 20 };

export default function AdvertiserDashboardPage() {
  const router = useRouter();
  const [advertiser, setAdvertiser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', videoUrl: '', landingUrl: '', category: '', tier: 'starter', budgetCents: 10000, targeting: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('advertiser_token');
    if (!token) { router.replace('/advertiser/login'); return; }
    fetchProfile(token);
  }, [router]);

  const getToken = () => localStorage.getItem('advertiser_token');

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/advertiser/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem('advertiser_token'); router.replace('/advertiser/login'); return; }
      const data = await res.json();
      if (data.success) {
        setAdvertiser(data.data);
        setCampaigns(data.data.campaigns || []);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('advertiser_token');
    router.replace('/advertiser/login');
  };

  const updateCreate = (field) => (e) => setCreateForm({ ...createForm, [field]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/advertiser/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...createForm, budgetCents: parseInt(createForm.budgetCents) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
      setCreateResult({ success: true, score: data.reviewScore, details: data.reviewDetails, status: data.campaign?.status });
      // Refresh campaigns
      fetchProfile(token);
    } catch (err) {
      setCreateResult({ success: false, error: err.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const estimatedViews = Math.floor(parseInt(createForm.budgetCents || 0) / (CPV_MAP[createForm.tier] || 5));

  // Stats
  const totalCampaigns = campaigns.length;
  const totalViews = campaigns.reduce((s, c) => s + (c.qualifiedViews || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (c.budgetSpentCents || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const statusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Active</span>;
    if (s === 'pending') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>;
    if (s === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Rejected</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <span className="text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white antialiased">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
              VideoSite.AI Advertiser Dashboard
            </h1>
            {advertiser && (
              <p className="text-gray-400 text-sm mt-1">{advertiser.businessName}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Campaigns', value: totalCampaigns, icon: BarChart3 },
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye },
            { label: 'Total Spent', value: `$${(totalSpent / 100).toFixed(2)}`, icon: DollarSign },
            { label: 'Active Campaigns', value: activeCampaigns, icon: Zap },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Campaign List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Campaigns</h2>
            <button
              onClick={() => { setShowCreate(true); setCreateResult(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No campaigns yet — create your first ad</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-6 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Campaign Name</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Status</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Tier</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Budget</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Spent</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Views</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Clicks</th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    let reviewTip = '';
                    if (c.status === 'rejected' && c.reviewDetails) {
                      try {
                        const checks = JSON.parse(c.reviewDetails);
                        const failed = checks.filter(ch => !ch.pass).map(ch => ch.name);
                        reviewTip = `Failed: ${failed.join(', ')}`;
                      } catch { reviewTip = 'Review details unavailable'; }
                    }
                    return (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-3 text-white font-medium">{c.name}</td>
                        <td className="px-4 py-3" title={reviewTip}>{statusBadge(c.status)}</td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{c.tier}</td>
                        <td className="px-4 py-3 text-gray-400">${(c.budgetCents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-400">${(c.budgetSpentCents / 100).toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-400">{(c.qualifiedViews || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400">{(c.clicks || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600 py-4">
          <span>Policy Center</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>

      {/* Create Campaign Slide-over */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-white">Create Campaign</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              {/* Result Banner */}
              {createResult && (
                <div className={`px-4 py-3 rounded-xl text-sm ${
                  createResult.success && createResult.status === 'active'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : createResult.success && createResult.status === 'rejected'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {createResult.success && createResult.status === 'active' && (
                    <p className="font-medium">Campaign Approved &amp; Live! Score: {createResult.score}/10</p>
                  )}
                  {createResult.success && createResult.status === 'rejected' && (
                    <>
                      <p className="font-medium mb-2">Campaign Rejected (Score: {createResult.score}/10)</p>
                      {createResult.details && (
                        <ul className="space-y-0.5 text-xs text-red-400/80">
                          {createResult.details.filter(d => !d.pass).map((d, i) => (
                            <li key={i}>Failed: {d.name.replace(/_/g, ' ')}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  {!createResult.success && <p>{createResult.error}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Campaign Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={updateCreate('name')}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Summer Product Launch"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Video Ad URL *</label>
                <input
                  type="url"
                  value={createForm.videoUrl}
                  onChange={updateCreate('videoUrl')}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://example.com/ad-video.mp4"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Landing Page URL *</label>
                <input
                  type="url"
                  value={createForm.landingUrl}
                  onChange={updateCreate('landingUrl')}
                  required
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="https://yoursite.com/offer"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <select
                  value={createForm.category}
                  onChange={updateCreate('category')}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tier *</label>
                <div className="space-y-2">
                  {TIERS.map(t => (
                    <label
                      key={t.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        createForm.tier === t.value
                          ? 'bg-purple-500/10 border-purple-500/30 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={t.value}
                        checked={createForm.tier === t.value}
                        onChange={updateCreate('tier')}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        createForm.tier === t.value ? 'border-purple-500' : 'border-gray-600'
                      }`}>
                        {createForm.tier === t.value && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                      </div>
                      <span className="font-medium text-sm">{t.label}</span>
                      <span className="text-xs text-gray-500 ml-auto">{t.cpv}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Budget (cents) * <span className="text-gray-600">min $100</span></label>
                <input
                  type="number"
                  value={createForm.budgetCents}
                  onChange={updateCreate('budgetCents')}
                  required
                  min={10000}
                  step={100}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  ${(parseInt(createForm.budgetCents || 0) / 100).toFixed(2)} budget — est. {estimatedViews.toLocaleString()} views
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Targeting Notes <span className="text-gray-600">(optional)</span></label>
                <textarea
                  value={createForm.targeting}
                  onChange={updateCreate('targeting')}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Target audience, demographics, interests..."
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                {createLoading ? 'Submitting...' : 'Submit Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
