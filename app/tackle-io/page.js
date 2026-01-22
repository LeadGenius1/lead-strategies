'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO Component for TackleAI
function TackleAISEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'TackleAI',
    description: 'AI-powered sales CRM with 7 self-healing AI agents and 22-channel omnichannel outreach',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/tackle-io',
      price: '549',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '458' }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is TackleAI?', acceptedAnswer: { '@type': 'Answer', text: 'TackleAI is a comprehensive AI sales CRM that combines full pipeline management, 7 self-healing AI agents, and 22-channel outreach in one platform for $99/month.' } },
      { '@type': 'Question', name: 'What are the 7 AI agents in TackleAI?', acceptedAnswer: { '@type': 'Answer', text: 'TackleAI includes Campaign AI, Social Syncs AI, Voice AI, LeadGen AI, Analytics AI, Integration AI, and CleanOS AI - all self-healing agents that learn and adapt automatically.' } },
      { '@type': 'Question', name: 'What channels does TackleAI support?', acceptedAnswer: { '@type': 'Answer', text: 'TackleAI supports 22 outreach channels including Email, LinkedIn, SMS, WhatsApp, Facebook, Instagram, Twitter, TikTok, YouTube, phone calls, and more.' } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>TackleAI - AI Sales CRM with 22-Channel Outreach</h1>
        <p>TackleAI is the future of outreach marketing by AI Lead Strategies LLC, priced at $99/month (no tiers). Features: Full CRM with pipeline management, 7 self-healing AI agents (Campaign AI, Social Syncs AI, Voice AI, LeadGen AI, Analytics AI, Integration AI, CleanOS AI), 22-channel omnichannel outreach (LinkedIn, Email, SMS, WhatsApp, social media), AI prospect scraping, automated personalized email writing, follow-up tracking, voice calling with transcription, meeting scheduler, team collaboration, revenue forecasting. Wake up every morning with an inbox full of warmed-up, perfectly targeted leads. Stop the manual hustle and put your sales floor on intelligent autopilot. Best for B2B sales teams wanting to scale beyond manual outreach. Alternatives: HubSpot, Salesforce, Outreach.io, Salesloft. Contact: support@aileadstrategies.com | (855) 506-8886</p>
        <h2>TackleAI Features</h2>
        <ul>
          <li>Full CRM with pipeline management</li>
          <li>7 self-healing AI agents</li>
          <li>22-channel omnichannel outreach</li>
          <li>AI prospect discovery</li>
          <li>Automated personalized emails</li>
          <li>Voice calling with transcription</li>
          <li>Team collaboration tools</li>
        </ul>
      </div>
    </>
  );
}

export default function TackleAIPage() {
  useEffect(() => {
    // Animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Counter animation
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.counter-trigger').forEach((el) => {
      counterObserver.observe(el);
    });

    function startCounters(container) {
      container.querySelectorAll('[data-target]').forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const duration = 1500;
        const startTime = performance.now();

        function update(t) {
          const p = Math.min((t - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          counter.innerHTML = prefix + (target * ease).toFixed(target % 1 === 0 ? 0 : 1) + suffix;
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <>
      <TackleAISEO />
      <div className="relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl gap-x-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/leadsite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.AI
            </Link>
            <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.IO
            </Link>
          </div>

          <div className="px-2 sm:px-6 text-lg sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            <span className="hidden sm:inline">TACKLE</span>AI
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              ClientContact
            </Link>
            <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              VideoSite
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Full-Page Video Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute w-full h-full object-cover"
          >
            <source src="/office-bldg.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70"></div>
          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black"></div>
        </div>

        {/* Grid Background (over video) */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="grid-overlay">
            <div className="grid-inner">
              <div className="grid-line-v"></div>
              <div className="grid-line-v hidden md:block"></div>
              <div className="grid-line-v hidden lg:block"></div>
              <div className="grid-line-v"></div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
            <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                AI-POWERED SALES CRM
              </div>

              <div className="flex flex-col z-10 w-full items-center justify-center">
                <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-4 md:gap-y-5 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter mt-4 mb-6">
                  <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                    THE FUTURE OF
                  </span>
                  <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                    OUTREACH MARKETING
                  </span>
                </h1>
              </div>

              <h2 className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll text-sm sm:text-base md:text-xl lg:text-2xl text-neutral-300 tracking-tight font-space-grotesk mt-4 mb-6 max-w-3xl px-4">
                The future of lead generation isn't about sending more messages—it's about orchestrating smarter conversations across every channel your buyers use.
              </h2>

              {/* Animated Metrics */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll mt-6 px-4 sm:px-0">
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-lg sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="22">22</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Channels</h3>
                </div>
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-lg sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="7">7</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">AI Agents</h3>
                </div>
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-4 sm:p-6">
                  <div className="text-lg sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="1">1</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Platform</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="features" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Stop The <span className="text-gradient">Manual Hustle</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">Your CRM, sequences, pipeline, and team are all in different tools—and your revenue shows it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* The Problem */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-6">Without TackleAI</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Manual list-building</span>
                  <span className="text-red-400 font-space-grotesk">Hours wasted</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Copywriting stress</span>
                  <span className="text-red-400 font-space-grotesk">Low engagement</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Fragmented tools</span>
                  <span className="text-red-400 font-space-grotesk">Data silos</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Cold outreach</span>
                  <span className="text-red-400 font-space-grotesk">Low conversion</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Manual follow-ups</span>
                  <span className="text-red-400 font-space-grotesk">Lost deals</span>
                </div>
              </div>
              <div className="pt-4 border-t border-subtle">
                <div className="text-xl text-red-400 font-space-grotesk">
                  = Money left on the table
                </div>
              </div>
            </div>

            {/* TackleAI Solution */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Intelligent Autopilot
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-6">With TackleAI</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">AI scrapes your ideal prospects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">Writes personalized emails automatically</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">Sends follow-ups & tracks responses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">Full CRM + Pipeline in one place</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">Omnichannel outreach (22 channels)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  <span className="text-neutral-300 font-geist">Team collaboration built-in</span>
                </div>
              </div>
              <div className="pt-4 border-t border-purple-500/20">
                <div className="text-xl text-green-400 font-space-grotesk font-light">
                  Warmed-up leads delivered daily
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 AI Agents Showcase */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              One Intelligent <span className="text-gradient">Control Center</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">TackleAI synchronizes outreach, content, and scheduling into one intelligent system with 7 self-healing AI agents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Campaign AI',
                description: 'Orchestrates multi-channel campaigns across 22 platforms. Generates personalized messages per platform. Self-healing: detects spam flags, rewrites with warmer tone.',
                Icon: Icons.Mail,
                color: 'text-sky-400'
              },
              {
                name: 'Social Syncs AI',
                description: 'Monitors 8 social platforms 24/7. Auto-generates contextual replies. Self-healing: missed reply? Responds within 5 minutes.',
                Icon: Icons.Smartphone,
                color: 'text-purple-400'
              },
              {
                name: 'Voice AI',
                description: 'Transcribes calls, extracts pain points, budget, timeline. Auto-updates CRM. Self-healing: transcription error? Reruns with higher accuracy.',
                Icon: Icons.Mic,
                color: 'text-pink-400'
              },
              {
                name: 'LeadGen AI',
                description: 'Scores leads 0-100 based on behavior. Enriches profiles with external data. Self-healing: low conversion on high scores? Recalibrates model.',
                Icon: Icons.Target,
                color: 'text-red-400'
              },
              {
                name: 'Analytics AI',
                description: 'Analyzes A/B tests, identifies conversion bottlenecks. Natural language insights. Self-healing: data anomalies? Flags for review.',
                Icon: Icons.BarChart,
                color: 'text-emerald-400'
              },
              {
                name: 'Integration AI',
                description: 'Syncs data between all platforms. Handles OAuth refresh automatically. Self-healing: sync failure? Retries with exponential backoff.',
                Icon: Icons.Link2,
                color: 'text-blue-400'
              },
              {
                name: 'CleanOS AI',
                description: 'Monitors system health, database performance. Self-healing: slow queries? Adds indexes automatically. High errors? Restarts services.',
                Icon: Icons.Settings,
                color: 'text-amber-400'
              }
            ].map((agent, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all group relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${agent.color}`}>
                    <agent.Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-space-grotesk text-white mb-3">{agent.name}</h3>
                  <p className="text-sm text-neutral-400 font-geist leading-relaxed">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connected Growth Engine Section */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Your Connected <span className="text-gradient">Growth Engine</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">Move past fragmented tools into a truly connected system. If you sell B2B, your funnel should run on autopilot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Full CRM + Pipeline', desc: 'Deals, contacts, activities, custom fields—all synced in real-time' },
              { title: 'AI Prospect Discovery', desc: 'Scrapes ideal prospects, writes emails, sends follow-ups automatically' },
              { title: '22-Channel Outreach', desc: 'LinkedIn, Email, SMS, WhatsApp, and 18 more—all from one dashboard' },
              { title: 'Voice Intelligence', desc: 'Call recording, transcription, sentiment analysis built-in' },
              { title: 'Automated Follow-ups', desc: 'Never miss a lead. AI tracks responses and re-engages automatically' },
              { title: 'Team Collaboration', desc: 'Your sales floor on intelligent autopilot with shared pipelines' },
              { title: 'Revenue Forecasting', desc: 'AI predicts close dates and deal probability in real-time' },
              { title: 'Meeting Scheduler', desc: 'Calendly-like booking with timezone detection and reminders' }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <h3 className="text-lg font-space-grotesk text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400 font-geist">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section id="pricing" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Simple <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-neutral-400 font-geist">One price. Everything included. No tiers. No surprises.</p>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Single Plan */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-10 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Full Suite
              </div>
              <h3 className="text-3xl font-space-grotesk text-white mb-2">TackleAI</h3>
              <div className="text-6xl font-space-grotesk font-light text-white mb-2">
                $99<span className="text-xl text-neutral-500">/mo</span>
              </div>
              <p className="text-neutral-400 font-geist mb-8">Your complete AI-driven sales control center</p>
              <ul className="space-y-4 font-geist text-sm text-neutral-300 mb-10">
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  Full CRM + Pipeline Management
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  7 Self-Healing AI Agents
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  22-Channel Omnichannel Outreach
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  AI Prospect Discovery & Personalized Emails
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  Automated Follow-ups & Response Tracking
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  Voice Calling with Transcription
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  Team Collaboration & Shared Pipelines
                </li>
                <li className="flex items-center gap-3">
                  <Icons.Check className="w-5 h-5 text-purple-500" />
                  Meeting Scheduler Built-in
                </li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?tier=tackle">
                  Start Free Trial
                </ShinyButton>
              </div>
              <p className="text-center text-neutral-500 text-xs font-geist mt-4">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Platforms */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Complete <span className="text-gradient">Ecosystem</span>
            </h2>
            <p className="text-neutral-400 font-geist">TackleAI works seamlessly with all our platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'LeadSite.AI', desc: 'AI lead scoring and enrichment', href: '/leadsite-ai' },
              { name: 'LeadSite.IO', desc: 'AI website builder', href: '/leadsite-io' },
              { name: 'ClientContact.IO', desc: 'Unified inbox for 22+ channels', href: '/clientcontact-io' },
              { name: 'VideoSite.AI', desc: 'AI video marketing platform', href: '/videosite-ai' }
            ].map((platform, index) => (
              <Link
                key={index}
                href={platform.href}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h3 className="text-lg font-space-grotesk text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-neutral-400 font-geist mb-4">{platform.desc}</p>
                <span className="text-purple-400 font-geist text-sm uppercase tracking-widest">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative bg-gradient-to-b from-purple-950/10 to-black">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-6xl uppercase text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to Scale Beyond <span className="text-gradient">Manual Hustle?</span>
          </h2>
          <p className="text-lg text-neutral-400 font-geist [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            See pricing above to get started with your 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="TACKLEAI" />
    </div>
    </>
  );
}
