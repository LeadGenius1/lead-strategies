'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Website {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  theme: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WebsitesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/websites');
    } else if (user) {
      fetchWebsites();
    }
  }, [user, loading, router]);

  const fetchWebsites = async () => {
    setLoadingWebsites(true);
    try {
      const response = await fetch('/api/websites', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWebsites(result.data?.websites || result.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch websites error:', error);
    } finally {
      setLoadingWebsites(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        fetchWebsites();
      }
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  if (loading || loadingWebsites) {
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
            <Link href="/dashboard/websites" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Websites
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

      {/* Websites Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Website <span className="text-gradient">Builder</span>
              </h1>
              <p className="text-neutral-400 font-geist">Create and manage your landing pages</p>
            </div>
            <Link
              href="/dashboard/websites/new"
              className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
            >
              + New Website
            </Link>
          </div>

          {/* Websites Grid */}
          {websites.length === 0 ? (
            <div className="bg-[#050505] border border-subtle p-12 text-center">
              <p className="text-neutral-500 font-geist mb-4">No websites found.</p>
              <Link
                href="/dashboard/websites/new"
                className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest"
              >
                Create your first website →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-space-grotesk text-white group-hover:text-purple-400 transition-colors">
                      {website.name}
                    </h3>
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-geist ${
                      website.isPublished 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                    }`}>
                      {website.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-neutral-400 font-geist text-sm mb-4">
                    {website.subdomain && (
                      <span className="text-purple-400">leadsite.io/{website.subdomain}</span>
                    )}
                    {website.domain && (
                      <span className="text-purple-400 ml-2">{website.domain}</span>
                    )}
                  </p>
                  <div className="flex gap-2 pt-4 border-t border-subtle">
                    <Link
                      href={`/dashboard/websites/${website.id}`}
                      className="flex-1 bg-white text-black px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center"
                    >
                      Edit
                    </Link>
                    {!website.isPublished && (
                      <button
                        onClick={() => handlePublish(website.id)}
                        className="flex-1 bg-purple-500 text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-purple-600 transition-colors font-geist"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
