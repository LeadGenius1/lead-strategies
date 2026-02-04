'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getNavigation } from '@/lib/platform-navigation';
import { BrainCircuit, MessageSquare, Settings, LogOut } from 'lucide-react';

const ICON_MAP = {
  MagnifyingGlass: BrainCircuit,
  Inbox: MessageSquare,
  Cog6Tooth: Settings,
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const platform =
    typeof window !== 'undefined'
      ? getNavigation(window.location.hostname)
      : getNavigation('localhost');

  useEffect(() => {
    async function loadUser() {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
        const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Auth failed');

        const json = await res.json();
        const userData = json.data?.user || json.user || json;
        setUser(userData);
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500" />
          <div className="mt-4 text-purple-300 text-sm font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* AETHER BACKGROUND - Ambient mystical glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative flex">
        {/* AETHER SIDEBAR */}
        <aside className="w-64 h-screen bg-gray-900/30 backdrop-blur-xl border-r border-purple-500/20 fixed left-0 top-0 shadow-2xl shadow-purple-900/20 flex flex-col">
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{platform.name.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {platform.name}
              </h1>
            </div>
          </div>

          <nav className="px-3 py-4 space-y-1 flex-1">
            {platform.nav.map((item) => {
              const Icon = ICON_MAP[item.icon] || BrainCircuit;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-300 hover:bg-purple-500/10 hover:text-white hover:shadow-lg hover:shadow-purple-500/20'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-purple-400'
                    }`}
                  />
                  {item.name}
                  {item.unique && (
                    <span className="ml-auto text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                      Pro
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-purple-500/20 bg-gray-900/50 backdrop-blur-xl">
            {user && (
              <div className="mb-3 px-3 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm text-white font-medium truncate">
                  {user.email || user.data?.email}
                </p>
                <p className="text-xs text-purple-400 mt-1 capitalize">
                  {user.plan_tier || user.planTier || 'Free'} Plan
                </p>
              </div>
            )}

            <button
              onClick={() => {
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                router.push('/login');
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-300" />
              Logout
            </button>
          </div>
        </aside>

        <main className="ml-64 flex-1 min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
