'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function NewWebsitePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [theme, setTheme] = useState('default');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/dashboard/websites/new');
    return null;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Website name is required');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          subdomain: subdomain.trim() || undefined,
          theme,
          pages: [
            {
              id: 'home',
              name: 'Home',
              sections: [
                {
                  type: 'hero',
                  content: {
                    title: 'Welcome to ' + name,
                    subtitle: 'Get started today',
                    cta: 'Sign Up'
                  }
                }
              ]
            }
          ],
          settings: {}
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/dashboard/websites/${result.data.website?.id || result.data.id}`);
      } else {
        setError(result.error || 'Failed to create website');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

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
            <Link href="/dashboard/websites" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Websites
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

      {/* Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <Link href="/dashboard/websites" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest mb-4 inline-block">
              ← Back to Websites
            </Link>
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              New <span className="text-gradient">Website</span>
            </h1>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          <div className="bg-[#050505] border border-subtle p-8 space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                Website Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Landing Page"
                className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                Subdomain (optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-website"
                  className="flex-1 bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                />
                <span className="text-neutral-400 font-geist">.leadsite.io</span>
              </div>
              <p className="text-xs text-neutral-500 font-geist mt-2">
                Leave empty to auto-generate
              </p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
              >
                <option value="default">Default</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full bg-white text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Website'
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
