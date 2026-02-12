'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO: UltraLead - AI Sales Command Center
function UltraLeadSEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'UltraLead',
    description: 'Your Complete AI Sales Command Center. Full CRM, 7 self-healing AI agents, 22+ channel unified inbox, voice calling with AI transcription. $499/mo.',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/ultralead',
      price: '499',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>UltraLead - Your Complete AI Sales Command Center | $499/mo</h1>
        <p>Full CRM and pipeline management. 7 self-healing AI agents. 22+ channel unified inbox. Voice calling with AI transcription. 2,000 leads/month. Unlimited team seats. Enterprise sales automation. Contact: support@aileadstrategies.com | (855) 506-8886</p>
      </div>
    </>
  );
}

export default function UltraLeadPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate');
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const agents = [
    { name: 'Lead Hunter', icon: '🎯', description: 'Finds and enriches prospects automatically' },
    { name: 'Copy Writer', icon: '✍️', description: 'Generates personalized email content' },
    { name: 'Compliance Guardian', icon: '⚖️', description: 'Ensures CAN-SPAM/GDPR compliance' },
    { name: 'Warmup Conductor', icon: '🔥', description: 'Manages domain warming and deliverability' },
    { name: 'Engagement Analyzer', icon: '📊', description: 'Tracks opens, clicks, and replies' },
    { name: 'Analytics Brain', icon: '🧠', description: 'Predicts and reports on performance' },
    { name: 'Healing Sentinel', icon: '🛡️', description: 'Auto-fixes failing campaigns' },
  ];

  const features = [
    { title: 'Full CRM + Pipeline Management', desc: 'Deals, stages, and forecasting in one place. Never drop a lead again.', Icon: Icons.TrendingUp, color: 'text-purple-400' },
    { title: '7 Self-Healing AI Agents', desc: 'Campaign, Social Syncs, Voice, LeadGen, Analytics, Integration, and CleanOS AI—always on.', Icon: Icons.Brain, color: 'text-sky-400' },
    { title: '22+ Channel Unified Inbox', desc: 'Email, LinkedIn, SMS, WhatsApp, and every channel your buyers use—one inbox.', Icon: Icons.MessageSquare, color: 'text-emerald-400' },
    { title: 'Voice Calling + AI Transcription', desc: 'Click-to-call with real-time transcription and AI summaries.', Icon: Icons.Phone, color: 'text-amber-400' },
    { title: '2,000 Leads/Month', desc: 'High-volume prospecting with enrichment and scoring built in.', Icon: Icons.Target, color: 'text-green-400' },
    { title: 'Unlimited Team Seats', desc: 'Scale your entire revenue team on one platform.', Icon: Icons.Users, color: 'text-blue-400' },
  ];

  return (
    <>
      <UltraLeadSEO />
      <div className="relative overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
          <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl gap-x-1 items-center justify-between">
            <Link href="/" className="bg-white/5 hover:bg-white/10 px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
              AI LEAD
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/leadsite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.AI</Link>
              <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.IO</Link>
              <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">ClientContact</Link>
            </div>
            <div className="px-2 sm:px-6 text-lg sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true" />
              ULTRALEAD
            </div>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">VideoSite</Link>
            </div>
          </div>
        </nav>

        {/* Hero: video background + headline + price + stats + CTA */}
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
              <source src="/office-bldg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
          </div>
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <div className="grid-overlay">
              <div className="grid-inner">
                <div className="grid-line-v" />
                <div className="grid-line-v hidden md:block" />
                <div className="grid-line-v hidden lg:block" />
                <div className="grid-line-v" />
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
              <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  ENTERPRISE SALES AUTOMATION
                </div>

                <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter mt-2 mb-4 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
                  <span className="tracking-tighter font-space-grotesk font-light block">Your Complete</span>
                  <span className="text-gradient font-light tracking-tighter font-space-grotesk block">AI Sales Command Center</span>
                </h1>

                <p className="[animation:animationIn_0.8s_ease-out_0.35s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-400 tracking-tight font-space-grotesk mt-2 mb-4 max-w-3xl px-4">
                  Full CRM. 7 AI agents. 22+ channels. Voice + pipeline. One platform.
                </p>

                <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-4xl sm:text-5xl font-space-grotesk font-light text-white mb-2">
                  $499<span className="text-lg sm:text-xl text-neutral-500">/mo</span>
                </div>
                <p className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-xs text-neutral-500 font-geist mb-8">Everything included. Unlimited team seats.</p>
              </div>

              {/* Stats: 22 CHANNELS | 7 AI AGENTS | 1 PLATFORM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
                <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                  <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Icons.MessageSquare className="w-5 h-5 text-sky-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">22</div>
                    <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Channels</h3>
                  </div>
                </div>
                <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                  <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Icons.Brain className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">7</div>
                    <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">AI Agents</h3>
                  </div>
                </div>
                <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                  <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                      <Icons.Layers className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">1</div>
                    <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Platform</h3>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 mt-10 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
                <ShinyButton href="/signup?tier=ultralead">Start Free Trial</ShinyButton>
                <p className="text-xs sm:text-sm text-neutral-500 font-geist">No credit card required • 14-day free trial</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7 AI Agents Section */}
        <section className="py-24 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
              <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                7 AI <span className="text-gradient">Agents</span>
              </h2>
              <p className="text-neutral-400 font-geist max-w-3xl mx-auto">
                Self-healing AI agents that run your sales automation 24/7
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-24">
              {agents.map((agent, index) => (
                <div
                  key={index}
                  className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                >
                  <span className="text-2xl mb-2 block">{agent.icon}</span>
                  <h3 className="text-lg font-space-grotesk text-white mb-2">{agent.name}</h3>
                  <p className="text-sm text-neutral-400 font-geist">{agent.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
              <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Everything Included in <span className="text-gradient">One Platform</span>
              </h2>
              <p className="text-neutral-400 font-geist max-w-3xl mx-auto">
                The flagship product for teams who want full CRM, AI agents, and omnichannel in one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div className={`w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-space-grotesk text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-400 font-geist leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mb-8 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
              Ready to Run Your Sales on <span className="text-gradient">Autopilot?</span>
            </h2>
            <p className="text-xl text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              Join teams who use UltraLead as their single AI sales command center
            </p>
            <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <Link href="/signup?tier=ultralead" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        <Footer brandName="ULTRALEAD" />
      </div>
    </>
  );
}
