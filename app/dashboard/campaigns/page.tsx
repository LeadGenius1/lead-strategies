'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EmailCampaign } from '@/lib/campaigns';

export default function CampaignsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/campaigns');
    } else if (user) {
      fetchCampaigns();
    }
  }, [user, loading, router, filter]);

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter !== 'all') queryParams.append('status', filter);

      const response = await fetch(`/api/campaigns?${queryParams}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCampaigns(result.data?.campaigns || result.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  if (loading || loadingCampaigns) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-6xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Dashboard
            </Link>
            <Link href="/dashboard/leads" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/analytics" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Settings
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            {user.firstName}
          </div>

          <button
            onClick={logout}
            className="bg-transparent border border-subtle text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Campaigns Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Email <span className="text-gradient">Campaigns</span>
              </h1>
              <p className="text-neutral-400 font-geist">Create and manage your email campaigns</p>
            </div>
            <Link
              href="/dashboard/campaigns/new"
              className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
            >
              + New Campaign
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-8">
            {['all', 'draft', 'scheduled', 'sending', 'sent'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 text-xs uppercase tracking-widest font-geist transition-colors ${
                  filter === status
                    ? 'bg-white text-black'
                    : 'bg-transparent border border-subtle text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Campaigns Grid */}
          {campaigns.length === 0 ? (
            <div className="bg-[#050505] border border-subtle p-12 text-center">
              <p className="text-neutral-500 font-geist mb-4">No campaigns found.</p>
              <Link
                href="/dashboard/campaigns/new"
                className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest"
              >
                Create your first campaign →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-space-grotesk text-white group-hover:text-purple-400 transition-colors">
                      {campaign.name}
                    </h3>
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-geist ${
                      campaign.status === 'draft' ? 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30' :
                      campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      campaign.status === 'sent' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-neutral-400 font-geist text-sm mb-4">{campaign.subject}</p>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-subtle">
                    <div>
                      <div className="text-lg font-space-grotesk font-light text-white">{campaign.recipientCount}</div>
                      <div className="text-xs text-neutral-500 font-geist">Recipients</div>
                    </div>
                    <div>
                      <div className="text-lg font-space-grotesk font-light text-white">{campaign.openedCount}</div>
                      <div className="text-xs text-neutral-500 font-geist">Opened</div>
                    </div>
                    <div>
                      <div className="text-lg font-space-grotesk font-light text-white">{campaign.clickedCount}</div>
                      <div className="text-xs text-neutral-500 font-geist">Clicked</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
