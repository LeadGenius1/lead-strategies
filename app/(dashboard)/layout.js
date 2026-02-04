'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getNavigation } from '@/lib/platform-navigation';
import {
  BrainCircuit,
  MessageSquare,
  User,
  LogOut,
  Target,
  Mail,
  BarChart3,
  Settings,
  Globe,
  LayoutGrid,
  Users,
  DollarSign,
  PlayCircle,
  Upload,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

const ICON_MAP = {
  MagnifyingGlass: BrainCircuit,
  Target,
  Inbox: MessageSquare,
  User: User,
  UserCircle: User,
  Cog: Settings,
  Users,
  Envelope: Mail,
  ChatBubbleLeft: MessageSquare,
  ChartBar: BarChart3,
  Globe,
  Squares2X2: LayoutGrid,
  UserGroup: Users,
  CurrencyDollar: DollarSign,
  PlayCircle,
  ArrowUpTray: Upload,
  BankNotes: Wallet,
  ShieldCheck,
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const platform =
    typeof window !== 'undefined'
      ? getNavigation(window.location.hostname, user?.tier)
      : getNavigation('localhost', user?.tier);

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
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const isTrial = user?.subscriptionStatus === 'trial' && trialEndsAt;
  const daysLeft = isTrial ? Math.max(0, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Clean background - matches Lead Hunter chat */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          }}
        />
      </div>

      <div className="relative flex">
        {/* Sidebar - clean & simple */}
        <aside className="w-64 h-screen bg-black/50 backdrop-blur-md border-r border-white/5 fixed left-0 top-0 flex flex-col">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-white font-semibold text-sm">{platform.name.charAt(0)}</span>
              </div>
              <h1 className="text-base font-medium text-white">{platform.name}</h1>
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
                  className={`group flex items-center px-3 py-2.5 text-sm font-light rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-white border border-indigo-500/30'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  />
                  {item.name}
                  {item.unique && (
                    <span className="ml-auto text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Pro
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 bg-black/30">
            {user && (
              <div className="mb-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Signed in as</p>
                <p className="text-sm text-white font-light truncate">
                  {user.email || user.data?.email}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-neutral-400 capitalize">
                    {user.plan_tier || user.planTier || 'Free'} Plan
                  </span>
                  {daysLeft !== null && (
                    <span className="text-[10px] text-amber-400 font-medium">
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                router.push('/login');
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all group"
            >
              <LogOut className="mr-3 h-5 w-5 text-neutral-500 group-hover:text-red-400" />
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
