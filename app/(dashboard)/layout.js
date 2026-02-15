'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  getPlatformFeatures,
  PLATFORM_DISPLAY_NAMES,
  detectPlatformFromDomain,
  detectPlatformFromUser,
} from '@/lib/platformFeatures';
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
  Hash,
  Building,
  TrendingUp,
  Phone,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

const ICON_MAP = {
  Search: BrainCircuit,
  MagnifyingGlass: BrainCircuit,
  Target,
  Inbox: MessageSquare,
  User,
  UserCircle: User,
  Cog: Settings,
  Users,
  Envelope: Mail,
  Mail,
  MessageSquare,
  ChatBubbleLeft: MessageSquare,
  ChartBar: BarChart3,
  BarChart3,
  Globe,
  Hash,
  Squares2X2: LayoutGrid,
  UserGroup: Users,
  Building,
  CurrencyDollar: DollarSign,
  TrendingUp,
  PlayCircle,
  Video: PlayCircle,
  ArrowUpTray: Upload,
  Upload,
  BankNotes: DollarSign,
  DollarSign,
  ShieldCheck: Shield,
  Shield,
  Sparkles,
  Phone,
  Grid: LayoutGrid,
  Zap,
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestedHrefs, setSuggestedHrefs] = useState([]);

  // Detect platform: use user tier on main domain, else domain-based
  const getPlatform = () => {
    if (typeof window === 'undefined') return 'ultralead-ai';
    const host = window.location.hostname.replace(/^www\./, '').split(':')[0];
    const isMainDomain = host === 'aileadstrategies.com' || host === 'localhost' || host === '127.0.0.1';
    if (isMainDomain && user != null) {
      return detectPlatformFromUser(user);
    }
    return detectPlatformFromDomain();
  };
  const platformType = getPlatform();
  const platform = {
    name: PLATFORM_DISPLAY_NAMES[platformType],
    nav: getPlatformFeatures(platformType).map((f) => ({
      name: f.name,
      href: f.href,
      icon: f.icon,
      unique: f.tier === 'pro',
    })),
  };

  useEffect(() => {
    async function loadUser() {
      // Use same cookie reading as app/admin/layout.js (working reference)
      const adminToken = Cookies.get('admin_token');
      const adminUser = Cookies.get('admin_user');
      const token = Cookies.get('token');

      // DEBUG: log cookie presence when admin clicks F01-F18 (remove after fix verified)
      console.log('DASHBOARD AUTH:', {
        admin_token: !!adminToken,
        admin_user: !!adminUser,
        token: !!token,
        pathname: pathname,
      });

      // 1. Admin session first: if admin_token AND admin_user exist, allow access (skip auth/me)
      if (adminToken && adminUser) {
        try {
          const adminData = JSON.parse(adminUser);
          setUser({
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
            role: adminData.role || 'super_admin',
            tier: 5,
            plan_tier: 'UltraLead',
            planTier: 'UltraLead',
          });
          setLoading(false);
          return;
        } catch (e) {
          console.error('Admin session parse error:', e);
          router.push('/admin/login');
          return;
        }
      }

      // 2. User session: token exists → call auth/me
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

  // Fetch profile + stats to determine suggested next steps (pulsate guidance)
  useEffect(() => {
    if (!user) return;

    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
    const headers = { Authorization: `Bearer ${token}` };

    async function loadNextStep() {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/users/profile`, { headers }),
          fetch(`${apiUrl}/api/v1/dashboard/stats`, { headers }),
        ]);

        const profile = profileRes.ok ? (await profileRes.json()).data : null;
        const stats = statsRes.ok ? (await statsRes.json()).data?.stats : null;

        const productsOk = !!profile?.productsServices?.trim();
        const targetOk = !!profile?.targetAudience?.trim();
        const profileComplete = productsOk && targetOk;
        const leadsCount = stats?.leads ?? stats?.totalLeads ?? 0;
        const campaignsCount = stats?.campaigns ?? stats?.totalCampaigns ?? 0;
        const tier = Number(user?.tier);

        const hrefs = [];
        if (!profileComplete) {
          hrefs.push('/settings'); // Profile first - critical for Lead Hunter
        } else if (tier === 4) {
          hrefs.push('/videos/upload'); // VideoSite: upload first video
        } else if (leadsCount === 0) {
          hrefs.push('/lead-hunter'); // Find leads (or /proactive-hunter for 24/7 machine)
        } else if (campaignsCount === 0) {
          hrefs.push('/campaigns'); // Create campaign
        } else {
          hrefs.push('/lead-hunter'); // Ongoing: use Lead Hunter
        }
        setSuggestedHrefs(hrefs);
      } catch (e) {
        setSuggestedHrefs(['/settings']); // Default: complete profile
      }
    }

    loadNextStep();
  }, [user]);

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
        {/* Sidebar - responsive: narrow on mobile, full on md+ */}
        <aside className="w-16 sm:w-52 md:w-64 h-screen bg-black/50 backdrop-blur-md border-r border-white/5 fixed left-0 top-0 flex flex-col z-20">
          <div className="p-3 sm:p-6 border-b border-white/5 flex flex-col items-center sm:items-stretch">
            <div className="flex items-center justify-center sm:justify-start space-x-0 sm:space-x-3">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
                <span className="text-white font-semibold text-sm">{platform.name.charAt(0)}</span>
              </div>
              <h1 className="hidden sm:block text-base font-medium text-white truncate">{platform.name}</h1>
            </div>
          </div>

          <nav className="px-2 sm:px-3 py-4 space-y-1 flex-1 overflow-y-auto">
            {platform.nav.map((item) => {
              const Icon = ICON_MAP[item.icon] || BrainCircuit;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isSuggested = suggestedHrefs.includes(item.href) && !isActive;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`group flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2.5 text-sm font-light rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-500/10 text-white border border-indigo-500/30'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
                  } ${isSuggested ? 'nav-pulsate border-indigo-500/30' : ''}`}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 sm:mr-3 ${
                      isActive ? 'text-indigo-400' : 'text-neutral-500 group-hover:text-neutral-300'
                    }`}
                  />
                  <span className="hidden sm:inline truncate">{item.name}</span>
                  {item.unique && (
                    <span className="hidden sm:inline-flex ml-auto text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Pro
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-2 sm:p-4 border-t border-white/5 bg-black/30">
            {user && (
              <div className="hidden sm:block mb-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
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
                Cookies.remove('token');
                if (Cookies.get('admin_token')) {
                  Cookies.remove('admin_token');
                  Cookies.remove('admin_user');
                  router.push('/admin/login');
                } else {
                  router.push('/login');
                }
              }}
              title="Logout"
              className="w-full flex items-center justify-center sm:justify-start px-2 sm:px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all group"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 sm:mr-3 text-neutral-500 group-hover:text-red-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </aside>

        <main className="ml-16 sm:ml-52 md:ml-64 flex-1 min-h-screen overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
