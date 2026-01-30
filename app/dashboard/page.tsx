'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [stats, setStats] = useState({
    leads: 0,
    campaigns: 0,
    websites: 0,
    conversions: 0,
  });

  useEffect(() => {
    // Only redirect once, after loading is complete and no user found
    if (!loading && !user && !hasRedirected) {
      setHasRedirected(true);
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white font-geist">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show redirecting message - useEffect handles the actual redirect
    // Do NOT use window.location.href here as it causes redirect loops
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white font-geist mb-4">Redirecting to login...</div>
          <a href="/login" className="text-purple-400 hover:text-purple-300 underline">Click here if not redirected</a>
        </div>
      </div>
    );
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
            <Link href="/dashboard" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Dashboard
            </Link>
            <Link href="/dashboard/leads" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Campaigns
            </Link>
            {(Number(user.tier) || 0) >= 3 && (
              <Link href="/dashboard/inbox" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
                Inbox
              </Link>
            )}
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

      {/* Dashboard Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Welcome Back, <span className="text-gradient">{user.firstName}</span>
            </h1>
            <p className="text-neutral-400 font-geist">
              {user.company || user.email?.split('@')[1] || 'Your Company'} • {user.tierName || 'Free Trial'}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Leads */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <div className="px-2 py-0.5 border border-green-900/30 bg-green-900/10 text-green-400 text-[10px] uppercase tracking-wider font-geist">
                  Active
                </div>
              </div>
              <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                {stats.leads}
              </div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Total Leads</h3>
            </div>

            {/* Active Campaigns */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                {stats.campaigns}
              </div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Active Campaigns</h3>
            </div>

            {/* Websites Built */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                {stats.websites}
              </div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Websites Built</h3>
            </div>

            {/* Conversions */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                {stats.conversions}
              </div>
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">This Month</h3>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-space-grotesk text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/analytics" className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-space-grotesk text-white group-hover:text-purple-400 transition-colors">View Analytics</h3>
                    <p className="text-sm text-neutral-400 font-geist">Performance insights</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/leads/import" className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-space-grotesk text-white group-hover:text-purple-400 transition-colors">Import Leads</h3>
                    <p className="text-sm text-neutral-400 font-geist">Upload CSV or connect source</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/campaigns/new" className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-space-grotesk text-white group-hover:text-purple-400 transition-colors">New Campaign</h3>
                    <p className="text-sm text-neutral-400 font-geist">Create email sequence</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/websites/new" className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-space-grotesk text-white group-hover:text-purple-400 transition-colors">Build Website</h3>
                    <p className="text-sm text-neutral-400 font-geist">AI site generator</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/inbox" className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-space-grotesk text-white group-hover:text-purple-400 transition-colors">Unified Inbox</h3>
                    <p className="text-sm text-neutral-400 font-geist">All conversations in one place</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-12">
            <h2 className="text-2xl font-space-grotesk text-white mb-6">Recent Activity</h2>
            <div className="bg-[#050505] border border-subtle">
              <div className="p-6 text-center text-neutral-500 font-geist">
                No recent activity. Start by importing leads or creating a campaign.
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Info */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8">
              <h3 className="text-xl font-space-grotesk text-white mb-4">Your Plan</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-1">Current Tier</div>
                  <div className="text-2xl font-space-grotesk text-white">
                    {user.tierName || 'Free Trial'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-geist">Free Trial Active</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-1">Trial Ends</div>
                  <div className="text-white font-geist">14 days remaining</div>
                </div>
                <Link href="/dashboard/billing" className="inline-block bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist mt-4">
                  Manage Subscription
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#050505] border border-subtle p-8">
              <h3 className="text-xl font-space-grotesk text-white mb-4">Usage This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist text-sm">Leads Generated</span>
                  <span className="text-white font-space-grotesk text-xl">{stats.leads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist text-sm">Emails Sent</span>
                  <span className="text-white font-space-grotesk text-xl">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist text-sm">Websites Created</span>
                  <span className="text-white font-space-grotesk text-xl">{stats.websites}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist text-sm">API Calls</span>
                  <span className="text-white font-space-grotesk text-xl">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors font-geist">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors font-geist">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors font-geist">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}






