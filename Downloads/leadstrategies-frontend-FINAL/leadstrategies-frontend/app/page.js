'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const PLATFORMS = [
  {
    id: 'leadsite-ai',
    name: 'LeadSite.AI',
    badge: 'TIER 1 • EMAIL FOCUS',
    icon: '📧',
    headline: 'Stop Begging for Leads',
    description: 'Your website finds prospects, writes personalized emails, gets replies. Wake up to qualified leads every morning.',
    features: ['1 website analysis', '500 prospects/month', '3 email campaigns', 'AI content generation'],
    cta: 'Start Email Engine',
    price: '$49/mo',
    color: 'purple',
  },
  {
    id: 'leadsite-io',
    name: 'LeadSite.IO',
    badge: 'SPECIAL • WEBSITE BUILDER',
    icon: '🌐',
    headline: 'Build Sites That Convert',
    description: 'AI builds complete conversion-optimized websites in 3 minutes. Lead capture forms, analytics, mobile-responsive.',
    features: ['3 websites included', 'Lead capture forms', 'Real-time analytics', 'Mobile-optimized'],
    cta: 'Build Your Site',
    price: '$29/mo',
    color: 'blue',
  },
  {
    id: 'clientcontact-io',
    name: 'ClientContact.IO',
    badge: 'TIER 2 • OMNICHANNEL',
    icon: '💬',
    headline: 'One Inbox. 22 Platforms.',
    description: 'Stop losing leads in scattered inboxes. Unified inbox for Email, LinkedIn, Instagram, Twitter, WhatsApp, SMS + 16 more.',
    features: ['22+ channel integration', 'Unified inbox', 'AI auto-responder', 'Unlimited campaigns'],
    cta: 'Connect Channels',
    price: '$149/mo',
    color: 'green',
  },
  {
    id: 'tackle-io',
    name: 'Tackle.IO',
    badge: 'TIER 3 • ENTERPRISE',
    icon: '🚀',
    headline: 'Replace Your Tool Stack',
    description: 'Voice calling, full CRM, team collaboration, 7-agent AI dashboard. Replaces HubSpot + Gong + Outreach. Save $44,812/year.',
    features: ['Voice calling (Twilio)', 'Full CRM + pipeline', 'Team accounts', '7 AI agents dashboard'],
    cta: 'Book Enterprise Demo',
    price: '$499/mo',
    color: 'orange',
  },
  {
    id: 'videosite-io',
    name: 'VideoSite.IO',
    badge: 'COMING SOON • VIDEO',
    icon: '🎬',
    headline: 'Video Marketing at Scale',
    description: 'AI-powered video creation, hosting, and analytics. Turn prospects into customers with personalized video outreach.',
    features: ['AI video generation', 'Video hosting', 'Engagement analytics', 'Personalized videos'],
    cta: 'Join Waitlist',
    price: 'Coming Soon',
    color: 'pink',
  },
]

const STATS = [
  { value: '+400%', label: 'Average ROI' },
  { value: '97%', label: 'Profit Margin' },
  { value: '12', label: 'Customers to Break Even' },
]

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-lg tracking-tight">AI LEAD STRATEGIES</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#platforms" className="text-neutral-400 hover:text-white transition">Platform</Link>
            <Link href="#pricing" className="text-neutral-400 hover:text-white transition">Pricing</Link>
            <Link href="#proof" className="text-neutral-400 hover:text-white transition">Case Studies</Link>
            <Link href="/login" className="text-neutral-400 hover:text-white transition">Login</Link>
          </div>
          <Link
            href="/signup"
            className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-8 font-mono">
            Ver. 4.5
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-none">
            <span className="text-white">ONE PLATFORM</span>
            <br />
            <span className="bg-gradient-to-b from-white to-neutral-600 bg-clip-text text-transparent">
              INFINITE REVENUE
            </span>
          </h1>

          {/* AI Status Badge */}
          <div className={`inline-flex items-center gap-3 mt-8 px-5 py-3 rounded-full border border-white/10 bg-white/5 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
            <span className="text-xl">🤖</span>
            <span className="text-sm font-mono text-neutral-300">AI_STATUS: OPTIMIZING 7 AGENTS</span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
          </div>

          <p className="text-2xl md:text-3xl text-neutral-200 mt-8 font-light">
            The Only Growth Engine You'll Ever Need
          </p>

          <p className="text-lg text-neutral-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Stop paying for 10 tools. Get email campaigns, website builder, 22-channel outreach, 
            voice calling, and full CRM in one unified platform. Powered by 7 self-healing AI agents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link
              href="/signup"
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="#platforms"
              className="px-8 py-4 border border-white/20 hover:border-white/40 text-white rounded-lg font-medium transition"
            >
              Explore Platforms
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="p-8 bg-[#050505] border border-white/5 rounded-xl hover:border-white/10 transition text-center"
            >
              <p className="text-4xl font-bold text-purple-400">{stat.value}</p>
              <p className="text-neutral-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight uppercase">
              Five Tiers. One Platform.
            </h2>
            <p className="text-neutral-400 mt-4 text-lg">
              Same dashboard. Different features unlocked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="group p-6 bg-[#050505] border border-white/5 rounded-xl hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-wider px-3 py-1 bg-purple-900/20 text-purple-400 border border-purple-800/30 rounded-full">
                    {platform.badge}
                  </span>
                  <span className="text-2xl">{platform.icon}</span>
                </div>

                <h3 className="text-xl font-semibold text-white mt-4">{platform.headline}</h3>
                <p className="text-neutral-400 mt-2 text-sm leading-relaxed">{platform.description}</p>

                <ul className="mt-4 space-y-2">
                  {platform.features.map((feature) => (
                    <li key={feature} className="text-sm text-neutral-500 flex items-center gap-2">
                      <span className="text-purple-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-purple-400 font-semibold">{platform.price}</span>
                  <Link
                    href={`/signup?tier=${platform.id}`}
                    className="text-sm text-white hover:text-purple-400 transition group-hover:translate-x-1 inline-flex items-center gap-1"
                  >
                    {platform.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight uppercase text-center mb-16">
            Growth Protocol
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'AI FINDS PROSPECTS', description: 'Our neural networks scan 50M+ profiles daily, identifying decision-makers who match your ideal customer profile.' },
              { step: '02', title: 'AI WRITES CONTENT', description: 'AI writes personalized emails for each prospect using their LinkedIn activity, company news, and pain points.' },
              { step: '03', title: 'AI CONVERTS LEADS', description: 'Automated DM agents engage with comments, qualify leads, and book meetings into your calendar 24/7.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-purple-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="text-neutral-400 mt-2 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight uppercase">
            Ready to 10x Your Growth?
          </h2>
          <p className="text-neutral-400 mt-4 text-lg">
            Join 500+ founders who stopped overpaying for scattered tools.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-8 px-10 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold uppercase tracking-wider transition"
          >
            Start 14-Day Free Trial
          </Link>
          <p className="text-neutral-500 text-sm mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="font-bold text-white">AI LEAD STRATEGIES LLC</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                600 Eagleview Blvd Suite 317<br />
                Exton, PA 19341
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <div className="space-y-2 text-neutral-400 text-sm">
                <p>
                  <span className="text-neutral-500">Phone:</span>{' '}
                  <a href="tel:6107571587" className="hover:text-white transition">610.757.1587</a>
                </p>
                <p>
                  <span className="text-neutral-500">Email:</span>{' '}
                  <a href="mailto:info@aileadstrategies.com" className="hover:text-white transition">info@aileadstrategies.com</a>
                </p>
                <p>
                  <a href="mailto:aileadstrategies@gmail.com" className="hover:text-white transition">aileadstrategies@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-neutral-400 hover:text-white transition text-sm">Privacy Policy</Link>
                <Link href="/terms" className="block text-neutral-400 hover:text-white transition text-sm">Terms of Service</Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="#platforms" className="block text-neutral-400 hover:text-white transition text-sm">Platforms</Link>
                <Link href="/login" className="block text-neutral-400 hover:text-white transition text-sm">Login</Link>
                <Link href="/signup" className="block text-neutral-400 hover:text-white transition text-sm">Sign Up</Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-neutral-600 text-sm">© 2026 AI Lead Strategies LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
