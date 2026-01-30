'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EmailCampaign, CampaignAnalytics } from '@/lib/campaigns';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/dashboard/campaigns/${params.id}`);
    } else if (user) {
      fetchCampaign();
      fetchAnalytics();
    }
  }, [user, loading, router, params.id]);

  const fetchCampaign = async () => {
    setLoadingCampaign(true);
    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCampaign(result.data);
        }
      }
    } catch (error) {
      console.error('Fetch campaign error:', error);
    } finally {
      setLoadingCampaign(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/campaigns/${params.id}/analytics`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    }
  };

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${params.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        alert('Campaign sent successfully!');
        fetchCampaign();
        fetchAnalytics();
      } else {
        setError(result.error || 'Failed to send campaign');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSending(false);
    }
  };

  if (loading || loadingCampaign) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user || !campaign) {
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

      {/* Campaign Detail Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Link href="/dashboard/campaigns" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest mb-4 inline-block">
              ← Back to Campaigns
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                  {campaign.name}
                </h1>
                <span className={`px-3 py-1 text-xs uppercase tracking-wider font-geist ${
                  campaign.status === 'draft' ? 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30' :
                  campaign.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  campaign.status === 'sending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  campaign.status === 'sent' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                  {campaign.status}
                </span>
              </div>
              {campaign.status === 'draft' && (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Campaign'
                  )}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaign Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#050505] border border-subtle p-6">
                <h3 className="text-sm uppercase tracking-widest text-white font-geist mb-4">Email Preview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Subject</div>
                    <div className="text-white font-geist">{campaign.subject}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Body</div>
                    <div className="text-neutral-300 font-geist whitespace-pre-wrap">{campaign.template}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-6">
              {analytics && (
                <div className="bg-[#050505] border border-subtle p-6">
                  <h3 className="text-sm uppercase tracking-widest text-white font-geist mb-4">Analytics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-space-grotesk font-light text-white">{analytics.sent}</div>
                      <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Sent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-space-grotesk font-light text-white">{analytics.opened}</div>
                      <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Opened</div>
                      <div className="text-xs text-purple-400 font-geist">{analytics.openRate.toFixed(1)}% open rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-space-grotesk font-light text-white">{analytics.clicked}</div>
                      <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Clicked</div>
                      <div className="text-xs text-purple-400 font-geist">{analytics.clickRate.toFixed(1)}% click rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-space-grotesk font-light text-white">{analytics.bounced}</div>
                      <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Bounced</div>
                      <div className="text-xs text-red-400 font-geist">{analytics.bounceRate.toFixed(1)}% bounce rate</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#050505] border border-subtle p-6">
                <h3 className="text-sm uppercase tracking-widest text-white font-geist mb-4">Campaign Info</h3>
                <div className="space-y-3 text-sm font-geist">
                  <div>
                    <div className="text-neutral-500 mb-1">Recipients</div>
                    <div className="text-white">{campaign.recipientCount}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 mb-1">Created</div>
                    <div className="text-white">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                  </div>
                  {campaign.sentAt && (
                    <div>
                      <div className="text-neutral-500 mb-1">Sent</div>
                      <div className="text-white">{new Date(campaign.sentAt).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
