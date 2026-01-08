'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  tier: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function BillingPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/billing');
    } else if (user) {
      fetchSubscription();
    }
  }, [user, loading, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscription(result.data);
        }
      }
    } catch (error) {
      console.error('Fetch subscription error:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleUpgrade = (newTier: string) => {
    // TODO: Implement Stripe checkout
    console.log('Upgrade to:', newTier);
  };

  if (loading || loadingSubscription) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tiers = [
    {
      id: 'leadsite-ai',
      name: 'LeadSite.AI',
      price: 49,
      features: ['500 Prospects/Month', '3 Email Campaigns', 'AI-Generated Content', '1 Website Analysis'],
    },
    {
      id: 'leadsite-io',
      name: 'LeadSite.IO',
      price: 29,
      features: ['3 Websites', 'AI Site Generator', 'Lead Forms + Analytics', 'Mobile-Optimized'],
    },
    {
      id: 'clientcontact-io',
      name: 'ClientContact.IO',
      price: 149,
      features: ['22+ Channels Unified', 'AI Auto-Responder', 'Unlimited Campaigns', '3 Team Seats'],
    },
    {
      id: 'tackle-io',
      name: 'Tackle.IO',
      price: 499,
      features: ['Voice Calling (Twilio)', 'Full CRM + Pipeline', '7 AI Agents', 'Unlimited Team'],
      enterprise: true,
    },
  ];

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

      {/* Billing Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Billing & <span className="text-gradient">Subscription</span>
            </h1>
            <p className="text-neutral-400 font-geist">Manage your subscription and payment methods</p>
          </div>

          {/* Current Subscription */}
          <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-space-grotesk text-white mb-2">
                  {user.tier.replace('-', ' ').toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-geist">Free Trial Active</span>
                </div>
                <p className="text-neutral-400 font-geist text-sm">
                  Trial ends in 14 days. Add payment method to continue after trial.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-space-grotesk font-light text-white mb-2">
                  $0<span className="text-sm text-neutral-500">/mo</span>
                </div>
                <p className="text-xs text-neutral-500 font-geist">During trial period</p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="mb-12">
            <h2 className="text-2xl font-space-grotesk text-white mb-6">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`bg-[#050505] border p-6 transition-all ${
                    user.tier === tier.id
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-subtle hover:border-purple-500/30'
                  } ${tier.enterprise ? 'bg-gradient-to-br from-purple-950/20 to-[#050505]' : ''}`}
                >
                  {tier.enterprise && (
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                        Enterprise
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-space-grotesk text-white mb-2">{tier.name}</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white mb-6">
                    ${tier.price}<span className="text-sm text-neutral-500">/mo</span>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-neutral-300 font-geist">
                        <div className="w-1 h-1 bg-purple-500 rounded-full flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {user.tier === tier.id ? (
                    <div className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-300 px-6 py-3 text-xs font-bold tracking-widest uppercase text-center font-geist">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tier.id)}
                      className="w-full bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                    >
                      {tier.enterprise ? 'Contact Sales' : 'Upgrade'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-space-grotesk text-white mb-6">Payment Methods</h2>
            <div className="bg-[#050505] border border-subtle p-8">
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                </svg>
                <p className="text-neutral-400 font-geist mb-6">No payment method on file</p>
                <button className="bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div>
            <h2 className="text-2xl font-space-grotesk text-white mb-6">Billing History</h2>
            <div className="bg-[#050505] border border-subtle">
              <div className="p-6 text-center text-neutral-500 font-geist">
                No billing history yet. You're on a free trial.
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
