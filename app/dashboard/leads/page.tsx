'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Lead, LeadFilters } from '@/lib/leads';

export default function LeadsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/leads');
    } else if (user) {
      fetchLeads();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [filters, search]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (search) queryParams.append('search', search);

      const response = await fetch(`/api/leads?${queryParams}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLeads(result.data?.leads || result.data || []);
          setStats({
            total: result.data?.total || leads.length,
            new: leads.filter(l => l.status === 'new').length,
            contacted: leads.filter(l => l.status === 'contacted').length,
            qualified: leads.filter(l => l.status === 'qualified').length,
            converted: leads.filter(l => l.status === 'converted').length,
          });
        }
      }
    } catch (error) {
      console.error('Fetch leads error:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (search) queryParams.append('search', search);

      const response = await fetch(`/api/leads/export?${queryParams}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading || loadingLeads) {
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
            <Link href="/dashboard/leads" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
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

      {/* Leads Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Lead <span className="text-gradient">Management</span>
              </h1>
              <p className="text-neutral-400 font-geist">Manage and track your prospects</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/dashboard/leads/import"
                className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
              >
                Import CSV
              </Link>
              <button
                onClick={handleExport}
                className="bg-transparent border border-subtle text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-[#050505] border border-subtle p-4">
              <div className="text-2xl font-space-grotesk font-light text-white mb-1">{stats.total}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Total</div>
            </div>
            <div className="bg-[#050505] border border-subtle p-4">
              <div className="text-2xl font-space-grotesk font-light text-white mb-1">{stats.new}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">New</div>
            </div>
            <div className="bg-[#050505] border border-subtle p-4">
              <div className="text-2xl font-space-grotesk font-light text-white mb-1">{stats.contacted}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Contacted</div>
            </div>
            <div className="bg-[#050505] border border-subtle p-4">
              <div className="text-2xl font-space-grotesk font-light text-white mb-1">{stats.qualified}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Qualified</div>
            </div>
            <div className="bg-[#050505] border border-subtle p-4">
              <div className="text-2xl font-space-grotesk font-light text-white mb-1">{stats.converted}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Converted</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#050505] border border-subtle p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
              </div>
              <div>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Source"
                  value={filters.source || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value || undefined }))}
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Industry"
                  value={filters.industry || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value || undefined }))}
                  className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-[#050505] border border-subtle overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-subtle">
                <tr>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Name</th>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Email</th>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Company</th>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Status</th>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Source</th>
                  <th className="text-left p-4 text-xs uppercase tracking-widest text-neutral-500 font-geist">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500 font-geist">
                      No leads found. <Link href="/dashboard/leads/import" className="text-purple-400 hover:text-purple-300">Import your first leads</Link>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-subtle hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-geist">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="p-4 text-neutral-300 font-geist">{lead.email}</td>
                      <td className="p-4 text-neutral-300 font-geist">{lead.company || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs uppercase tracking-wider font-geist ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          lead.status === 'qualified' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          lead.status === 'converted' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-300 font-geist text-sm">{lead.source || '-'}</td>
                      <td className="p-4">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
