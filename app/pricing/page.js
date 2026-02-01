'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

const pricingPlans = [
  {
    name: 'LeadSite.AI',
    price: '$49',
    period: '/mo',
    description: 'AI Email Lead Generation',
    features: ['1,000 Leads/Month', 'AI-Generated Emails', 'Campaign Analytics', 'A/B Testing'],
    href: '/signup?tier=leadsite-ai',
    cta: 'Start Free Trial',
  },
  {
    name: 'LeadSite.IO',
    price: '$49',
    period: '/mo',
    description: 'AI Website Builder + Lead Gen',
    badge: '+FREE SITE',
    features: ['1 Free AI Website', 'Lead Capture Forms', 'Visitor Analytics', 'Custom Domains'],
    href: '/signup?tier=leadsite-io',
    cta: 'Start Free Trial',
  },
  {
    name: 'ClientContact.IO',
    price: '$79',
    period: '/mo',
    description: '22+ Channel Unified Inbox',
    features: ['22+ Channels', 'AI Auto-Responder', 'Team Collaboration', '3 Seats Included'],
    href: '/signup?tier=clientcontact',
    cta: 'Start Free Trial',
  },
  {
    name: 'UltraLead',
    price: '$99',
    period: '/mo',
    description: 'Full CRM + 7 AI Agents',
    featured: true,
    badge: 'FLAGSHIP',
    features: ['7 Self-Healing AI Agents', 'Full CRM Pipeline', 'Voice + Transcription', '2,000 Leads/Month', 'Unlimited Seats'],
    href: '/signup?tier=ultralead',
    cta: 'Start Free Trial',
  },
  {
    name: 'VideoSite.AI',
    price: 'FREE',
    period: '',
    description: 'Creator Monetization',
    features: ['$1/Qualified View', 'Instant Stripe Payouts', 'Unlimited Hosting', '0% Platform Fees'],
    href: '/signup?tier=videosite',
    cta: 'Get Started Free',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-5xl border p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl gap-x-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/leadsite-ai" className="hover:text-white px-2 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.AI</Link>
            <Link href="/leadsite-io" className="hover:text-white px-2 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.IO</Link>
            <Link href="/clientcontact-io" className="hover:text-white px-2 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">ClientContact</Link>
            <Link href="/ultralead" className="hover:text-white px-2 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">UltraLead</Link>
            <Link href="/videosite-ai" className="hover:text-white px-2 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">VideoSite</Link>
          </div>
          <Link href="/signup" className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 px-3 sm:px-4 py-2 text-[10px] sm:text-xs tracking-widest uppercase text-purple-300 font-geist transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase font-light text-white tracking-tighter font-space-grotesk mb-4">
            Simple <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-neutral-400 font-geist max-w-2xl mx-auto">
            5 platforms, 5 dashboards. Choose your product — start with one, scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.featured
                    ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-2 border-purple-500/50'
                    : 'bg-[#050505] border border-subtle'
                } hover:border-purple-500/30 transition-all`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      plan.featured ? 'bg-purple-500 text-white' : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className={`text-3xl font-bold ${plan.price === 'FREE' ? 'text-green-400' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm text-neutral-400">{plan.period}</span>
                </div>
                <p className="text-neutral-400 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-2 text-sm text-neutral-300 mb-8 flex-grow">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className={plan.featured ? 'text-purple-400' : 'text-green-400'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 text-sm font-bold tracking-widest uppercase transition-colors ${
                    plan.featured
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : plan.price === 'FREE'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                      : 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
