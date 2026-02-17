'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO Component for Homepage
function HomeSEO() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Lead Strategies',
    url: 'https://aileadstrategies.com',
    description: 'AI-powered B2B lead generation and sales automation platform with 5 integrated products',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://aileadstrategies.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Lead Strategies LLC',
      logo: 'https://aileadstrategies.com/logo.png'
    }
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AI Lead Strategies?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI Lead Strategies is a comprehensive B2B sales automation platform offering 4 integrated products: LeadSite.AI for lead scoring, LeadSite.IO for AI website building, ClientContact.IO for unified inbox and CRM (22+ channels, 7 AI agents), and VideoSite.AI for video monetization.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does AI Lead Strategies cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Pricing varies by platform: LeadSite.AI is $49/mo, LeadSite.IO is $49/mo with a free website, ClientContact.IO is $99–$399/mo (3 tiers), UltraLead is $499/mo, VideoSite.AI is FREE (earn $1 per viewer).'
        }
      },
      {
        '@type': 'Question',
        name: 'What AI features does the platform include?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI Lead Strategies includes AI prospect discovery, automated lead scoring, AI-generated personalized emails, 7 self-healing AI agents, AI website generation, and intelligent follow-up automation across 22 communication channels.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* Hidden SEO content for LLM discovery */}
      <div className="sr-only" aria-hidden="true" role="presentation">
        <h1>AI Lead Strategies - B2B Lead Generation Platform</h1>
        <p>AI Lead Strategies offers 5 integrated AI-powered platforms for B2B sales automation: LeadSite.AI ($49/mo) for lead scoring and enrichment. LeadSite.IO ($49/mo + Free website) for AI website building. ClientContact.IO ($99–$399/mo) for 22+ channel unified inbox and full CRM with 7 AI agents. UltraLead ($499/mo) full CRM + 7 AI agents. VideoSite.AI (FREE - earn $1/viewer) for video monetization. Contact: support@aileadstrategies.com | (855) 506-8886 | 600 Eagleview Blvd, Suite 317, Exton PA 19341.</p>
      </div>
    </>
  );
}

export default function HomePage() {
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
        let start = 0;
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
      <HomeSEO />
      <div className="relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
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

          <div className="px-2 sm:px-4 text-base sm:text-xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            <span className="text-neutral-400 font-geist normal-case text-[10px] sm:text-xs hidden sm:inline">aileadstrategies.com</span>
          </div>

          <Link href="/signup" className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 px-3 sm:px-4 py-2 text-[10px] sm:text-xs tracking-widest uppercase text-purple-300 font-geist transition-all">
            Get Started
          </Link>
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black"></div>
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

        {/* Hero Content - font sizes reduced 15% for readability, responsive */}
        <div className="relative z-10 pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-44 md:pb-28 lg:pt-52 lg:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
          <div className="flex flex-col text-center mb-12 sm:mb-20 relative items-center justify-center">
            {/* Version Tag */}
            <div className="absolute -left-4 md:left-20 top-0 flex flex-col gap-2 opacity-30 hidden lg:flex [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Est. 2024</span>
              <div className="w-px h-12 bg-gradient-to-b to-transparent from-neutral-500"></div>
            </div>

            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold text-white tracking-tighter mt-2 sm:mt-6 mb-4 sm:mb-6">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                  ONE PLATFORM
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                  INFINITE REVENUE
                </span>
              </h1>
            </div>

            <div className="flex flex-col z-10 w-full mt-6 mb-6 gap-y-3 items-center justify-center">
              {/* Future of Outreach Marketing Badge */}
              <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[9px] sm:text-[10px] uppercase tracking-wider font-geist">
                  THE FUTURE OF OUTREACH MARKETING
                </span>
              </div>

              <h2 className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll text-sm sm:text-base md:text-xl lg:text-2xl text-neutral-400 tracking-tight font-space-grotesk">
                Automated B2B Marketing Ecosystem
              </h2>
            </div>

            <div className="leading-relaxed [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-500 font-space-grotesk text-center max-w-2xl px-4 mt-2">
              Stop juggling 10 tools. One unified platform for lead generation, website building, omnichannel outreach, and enterprise sales automation.
            </div>
          </div>

          {/* Stats Grid - modern flat icon style (dark grey square) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            {/* Card 1 */}
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Grid className="w-5 h-5 text-purple-400" />
                </div>
                <div className="px-2 py-0.5 border border-purple-900/30 bg-purple-900/10 text-purple-400 text-[10px] uppercase tracking-wider font-geist">
                  Live
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="400" data-prefix="+" data-suffix="%">+400%</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Average ROI</h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Users className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="97" data-suffix="%">97%</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Profit Margin</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="12">12</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Customers to Break Even</h3>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Platform Tiers */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Choose Your <span className="text-neutral-600">Stack</span>
            </h2>
            <p className="text-neutral-400 font-geist">Unified SaaS ecosystem. Start with one, scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 1: LeadSite.AI */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">LeadSite.AI</h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Email lead generation on autopilot. AI scrapes prospects, writes emails, manages follow-ups.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>1,000 Leads/Month</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>Email Campaigns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                  <span>Lead Scoring & Analytics</span>
                </div>
              </div>
              <Link href="/leadsite-ai" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Explore LeadSite.AI
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>

            {/* 2: LeadSite.IO */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.466.733-3.559" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">LeadSite.IO</h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                AI website builder + lead generation. Includes 1 free AI-built website.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>1 Free Website Included</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>AI Site Generator</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>Lead Forms + Analytics</span>
                </div>
              </div>
              <Link href="/leadsite-io" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Explore LeadSite.IO
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>

            {/* 3: ClientContact.IO */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">ClientContact.IO</h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Unified inbox for 22+ channels. AI auto-responds and books meetings.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>22+ Channels Unified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>AI Auto-Responder</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  <span>3 Team Seats</span>
                </div>
              </div>
              <Link href="/clientcontact-io" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Explore ClientContact.IO
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>

            {/* 4: UltraLead.AI */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">UltraLead.AI</h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Full CRM with 7 self-healing AI agents working around the clock to close deals for you.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                  <span>7 Self-Healing AI Agents</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                  <span>Full CRM Pipeline</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                  <span>Voice + AI Transcription</span>
                </div>
              </div>
              <Link href="/ultralead" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Explore UltraLead.AI
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>

            {/* 5: VideoSite.AI */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 tracking-tight">VideoSite.AI</h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Monetize your video content. Earn per qualified view with instant Stripe payouts.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Earn Per Qualified View</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Instant Stripe Payouts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Unlimited Video Hosting</span>
                </div>
              </div>
              <Link href="/videosite-ai" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
                Explore VideoSite.AI
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Final Section */}
      <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-6xl uppercase text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6">
            Ready to <span className="text-neutral-600">Scale?</span>
          </h2>
          <p className="text-lg text-neutral-400 font-geist max-w-xl mx-auto mb-8">
            5 platforms, 5 dashboards. Choose your product above — after signup you go straight to that product&apos;s dashboard. 14-day free trial. No credit card required.
          </p>
          <Link href="/signup" className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase font-geist transition-colors">
            Sign up at aileadstrategies.com
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
}
