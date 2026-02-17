'use client';

import Link from 'next/link';
import { BarChart3, Target, Zap, DollarSign, Eye, MousePointer } from 'lucide-react';

const TIERS = [
  {
    name: 'Starter',
    cpv: '$0.05',
    price: 'From $100',
    features: ['Sidebar placement', 'Basic analytics', 'Up to 2,000 views'],
    color: 'border-neutral-500/30',
    highlight: false,
  },
  {
    name: 'Professional',
    cpv: '$0.10',
    price: 'From $100',
    features: ['Sidebar + in-feed placement', 'Category targeting', 'Advanced analytics', 'Up to 1,000 views'],
    color: 'border-indigo-500/50',
    highlight: true,
  },
  {
    name: 'Premium',
    cpv: '$0.20',
    price: 'From $100',
    features: ['Pre-roll + all placements', 'Advanced targeting', 'Priority delivery', 'Up to 500 views'],
    color: 'border-purple-500/50',
    highlight: false,
  },
];

export default function AdsLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Aether Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-4">
            Advertise on VideoSite.AI
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-8">
            Reach engaged viewers with video ads. Pay only when people watch.
            Start from just $0.05 per view.
          </p>
          <Link
            href="/signup?tier=videosite&role=advertiser"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-base transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { icon: Eye, label: 'Views Delivered', value: '10,000+' },
            { icon: MousePointer, label: 'Avg CTR', value: '3.2%' },
            { icon: DollarSign, label: 'Starting CPV', value: '$0.05' },
          ].map((stat) => (
            <div key={stat.label} className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 text-center">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <stat.icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <div className="text-2xl font-semibold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-neutral-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-white text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'Create Campaign', desc: 'Upload your video ad, set your budget, and choose your targeting.' },
              { icon: Zap, title: 'Reach Viewers', desc: 'Your ad appears alongside popular creator content on VideoSite.AI.' },
              { icon: BarChart3, title: 'Track Results', desc: 'Monitor impressions, views, clicks, and spend in real-time.' },
            ].map((step, i) => (
              <div key={step.title} className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-white text-center mb-10">Pricing Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-neutral-900/30 border ${tier.color} p-6 ${tier.highlight ? 'ring-1 ring-indigo-500/30' : ''}`}
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-1">{tier.name}</h3>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                  {tier.cpv}
                </div>
                <div className="text-xs text-neutral-500 mb-4">per qualified view &middot; {tier.price}</div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                      <span className="text-indigo-400 mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup?tier=videosite&role=advertiser"
                  className={`block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                      : 'bg-neutral-800/50 border border-white/10 text-neutral-300 hover:border-indigo-500/30 hover:text-white'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="relative rounded-2xl overflow-hidden text-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-700/20" />
          <div className="absolute inset-0 border border-white/10 rounded-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-semibold text-white mb-3">Ready to grow your audience?</h2>
            <p className="text-neutral-400 mb-6">Start your first campaign in minutes.</p>
            <Link
              href="/signup?tier=videosite&role=advertiser"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-base transition-all"
            >
              Create Your Campaign
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
