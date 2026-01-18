'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  leads: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };
  campaigns: {
    total: number;
    sent: number;
    scheduled: number;
    draft: number;
  };
  emails: {
    sent: number;
    opened: number;
    clicked: number;
    bounced: number;
    openRate: number;
    clickRate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    customers: number;
  };
  leadGrowth?: Array<{ date: string; count: number }>;
  emailPerformance?: Array<{ date: string; sent: number; opened: number; clicked: number }>;
}

export default function AnalyticsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/analytics');
    } else if (user) {
      fetchAnalytics();
    }
  }, [user, loading, router]);

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // Fetch analytics and leads data in parallel
      const [analyticsRes, leadsRes, campaignsRes] = await Promise.all([
        fetch('/api/analytics', { credentials: 'include' }),
        fetch('/api/leads', { credentials: 'include' }),
        fetch('/api/campaigns', { credentials: 'include' }),
      ]);

      let overview = {};
      let campaignsArray: { sent?: number }[] = [];
      let leadsData = { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0 };
      let campaignsData = { total: 0, sent: 0, scheduled: 0, draft: 0 };

      if (analyticsRes.ok) {
        const result = await analyticsRes.json();
        if (result.success) {
          const responseData = result.data?.data || result.data;
          overview = responseData?.overview || {};
          campaignsArray = responseData?.campaigns || [];
        }
      }

      if (leadsRes.ok) {
        const result = await leadsRes.json();
        if (result.success) {
          const leads = result.data?.data?.leads || result.data?.leads || [];
          const total = result.data?.data?.total || result.data?.total || leads.length;
          leadsData = {
            total,
            new: leads.filter((l: { status?: string }) => l.status === 'new').length,
            contacted: leads.filter((l: { status?: string }) => l.status === 'contacted').length,
            qualified: leads.filter((l: { status?: string }) => l.status === 'qualified').length,
            converted: leads.filter((l: { status?: string }) => l.status === 'converted').length,
          };
        }
      }

      if (campaignsRes.ok) {
        const result = await campaignsRes.json();
        if (result.success) {
          const campaigns = result.data?.data?.campaigns || result.data?.campaigns || [];
          campaignsData = {
            total: campaigns.length,
            sent: campaigns.filter((c: { status?: string }) => c.status === 'sent').length,
            scheduled: campaigns.filter((c: { status?: string }) => c.status === 'scheduled').length,
            draft: campaigns.filter((c: { status?: string }) => c.status === 'draft').length,
          };
        }
      }

      // Generate lead growth data (last 30 days)
      const leadGrowthData = [];
      const emailPerformanceData = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Mock data - in production, this would come from database
        const dayLeads = Math.floor(Math.random() * 5) + (i > 20 ? 0 : Math.floor(Math.random() * 3));
        const cumulative = i === 29 ? dayLeads : (leadGrowthData[leadGrowthData.length - 1]?.count || 0) + dayLeads;
        
        leadGrowthData.push({
          date: dateStr,
          count: cumulative
        });

        emailPerformanceData.push({
          date: dateStr,
          sent: Math.floor(Math.random() * 50) + 10,
          opened: Math.floor(Math.random() * 30) + 5,
          clicked: Math.floor(Math.random() * 10) + 1
        });
      }

      const safeAnalytics: AnalyticsData = {
        leads: leadsData,
        campaigns: campaignsData,
        emails: {
          sent: (overview as { totalSent?: number })?.totalSent ?? 0,
          opened: (overview as { totalOpens?: number })?.totalOpens ?? 0,
          clicked: (overview as { totalClicks?: number })?.totalClicks ?? 0,
          bounced: (overview as { totalBounces?: number })?.totalBounces ?? 0,
          openRate: (overview as { openRate?: number })?.openRate ?? 0,
          clickRate: (overview as { clickRate?: number })?.clickRate ?? 0,
        },
        revenue: {
          mrr: 0,
          arr: 0,
          customers: 0,
        },
        leadGrowth: leadGrowthData,
        emailPerformance: emailPerformanceData,
      };
      setAnalytics(safeAnalytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading || loadingAnalytics) {
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
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/analytics" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
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

      {/* Analytics Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Analytics & <span className="text-gradient">Insights</span>
            </h1>
            <p className="text-neutral-400 font-geist">Track your performance and growth</p>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Leads Stats */}
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Total Leads</div>
                <div className="text-4xl font-space-grotesk font-light text-white mb-4">{analytics.leads.total}</div>
                <div className="space-y-2 text-sm font-geist">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">New</span>
                    <span className="text-white">{analytics.leads.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Contacted</span>
                    <span className="text-white">{analytics.leads.contacted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Qualified</span>
                    <span className="text-white">{analytics.leads.qualified}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Converted</span>
                    <span className="text-green-400">{analytics.leads.converted}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Campaigns</div>
                <div className="text-4xl font-space-grotesk font-light text-white mb-4">{analytics.campaigns.total}</div>
                <div className="space-y-2 text-sm font-geist">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Sent</span>
                    <span className="text-green-400">{analytics.campaigns.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Scheduled</span>
                    <span className="text-blue-400">{analytics.campaigns.scheduled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Draft</span>
                    <span className="text-neutral-400">{analytics.campaigns.draft}</span>
                  </div>
                </div>
              </div>

              {/* Email Stats */}
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Email Performance</div>
                <div className="text-4xl font-space-grotesk font-light text-white mb-4">{analytics.emails.sent}</div>
                <div className="space-y-2 text-sm font-geist">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Opened</span>
                    <span className="text-white">{analytics.emails.opened}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Clicked</span>
                    <span className="text-white">{analytics.emails.clicked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Open Rate</span>
                    <span className="text-purple-400">{analytics.emails.openRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Click Rate</span>
                    <span className="text-purple-400">{analytics.emails.clickRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6">
                <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">Revenue</div>
                <div className="text-4xl font-space-grotesk font-light text-white mb-4">${analytics.revenue.mrr}</div>
                <div className="space-y-2 text-sm font-geist">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">MRR</span>
                    <span className="text-white">${analytics.revenue.mrr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">ARR</span>
                    <span className="text-white">${analytics.revenue.arr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Customers</span>
                    <span className="text-green-400">{analytics.revenue.customers}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#050505] border border-subtle p-8">
              <h3 className="text-xl font-space-grotesk text-white mb-4">Lead Growth</h3>
              {analytics.leadGrowth && analytics.leadGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.leadGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: any) => [value, 'Leads']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7', r: 3 }}
                      name="Total Leads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-neutral-500 font-geist">
                  No data available
                </div>
              )}
            </div>
            <div className="bg-[#050505] border border-subtle p-8">
              <h3 className="text-xl font-space-grotesk text-white mb-4">Email Performance</h3>
              {analytics.emailPerformance && analytics.emailPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.emailPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="sent" fill="#6366f1" name="Sent" />
                    <Bar dataKey="opened" fill="#8b5cf6" name="Opened" />
                    <Bar dataKey="clicked" fill="#a855f7" name="Clicked" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-neutral-500 font-geist">
                  No data available
                </div>
              )}
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
