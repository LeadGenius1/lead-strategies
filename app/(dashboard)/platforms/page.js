'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  MessageSquare,
  PlayCircle,
  UserGroup,
  Target,
  ArrowTopRightOnSquare,
} from 'lucide-react';

const PLATFORMS = [
  {
    tier: 1,
    name: 'LeadSite.AI',
    domain: 'leadsite.ai',
    tagline: 'AI Lead Scoring & Email Outreach',
    icon: Target,
    href: '/prospects',
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
  },
  {
    tier: 2,
    name: 'LeadSite.IO',
    domain: 'leadsite.io',
    tagline: 'AI Website Builder + Lead Gen',
    icon: Globe,
    href: '/websites',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
  },
  {
    tier: 3,
    name: 'ClientContact.IO',
    domain: 'clientcontact.io',
    tagline: '22+ Channel Unified Inbox',
    icon: MessageSquare,
    href: '/inbox',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
  },
  {
    tier: 4,
    name: 'VideoSite.AI',
    domain: 'videosite.ai',
    tagline: 'Free Video Monetization',
    icon: PlayCircle,
    href: '/videos',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
  },
  {
    tier: 5,
    name: 'UltraLead',
    domain: 'ultralead.ai',
    tagline: 'Full CRM + 7 AI Agents',
    icon: UserGroup,
    href: '/crm',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
  },
];

export default function PlatformsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const u = json.data?.user || json.user || json;
        setUser(u);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const userTier = user?.tier != null ? Number(user.tier) : null;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Platform Overview</h1>
          <p className="text-neutral-400 text-sm">
            AI Lead Strategies portfolio — switch to your platform or explore others.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const isUserPlatform = userTier === p.tier;
            return (
              <Link
                key={p.tier}
                href={p.href}
                className={`block rounded-xl border p-6 bg-gradient-to-br ${p.color} ${p.border} hover:border-white/30 transition-all group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-black/30">
                      <Icon className="w-5 h-5 text-white/90" />
                    </div>
                    <div>
                      <h2 className="text-white font-semibold">{p.name}</h2>
                      <p className="text-neutral-400 text-xs">{p.domain}</p>
                    </div>
                  </div>
                  <ArrowTopRightOnSquare className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
                <p className="text-neutral-400 text-sm mb-4">{p.tagline}</p>
                {isUserPlatform && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded bg-indigo-500/30 text-indigo-300">
                    Your plan
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
