'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
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
          text: 'Pricing varies by platform: LeadSite.AI is $49/mo, LeadSite.IO is $49/mo with a free website, ClientContact.IO is $79–$299/mo (3 tiers), VideoSite.AI is FREE (earn $1 per viewer).'
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
        <p>AI Lead Strategies offers 4 integrated AI-powered platforms for B2B sales automation: LeadSite.AI ($49/mo) for lead scoring and enrichment. LeadSite.IO ($49/mo + Free website) for AI website building. ClientContact.IO ($99–$299/mo) for 22+ channel unified inbox and full CRM with 7 AI agents. VideoSite.AI (FREE - earn $1/viewer) for video monetization. Contact: support@aileadstrategies.com | (855) 506-8886 | 600 Eagleview Blvd, Suite 317, Exton PA 19341.</p>
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
            <p className="text-neutral-400 font-geist">Unified SaaS ecosystem. Start with one tier, scale to enterprise.</p>
          </div>

          <p className="text-neutral-500 font-geist text-sm mb-10 max-w-2xl mx-auto">5 platforms, 5 separate dashboards. Choose one — after signup you go straight to that product&apos;s dashboard.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 1: LeadSite.AI */}
            <div className="group bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all flex flex-col">
              <Link href="/leadsite-ai" className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-space-grotesk text-white">LeadSite.AI</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white">$49<span className="text-sm text-neutral-500">/mo</span></div>
                </div>
                <p className="text-neutral-400 font-geist mb-6 text-sm">Email lead generation on autopilot. AI scrapes prospects, writes emails, manages follow-ups.</p>
                <ul className="space-y-3 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>1,000 Leads/Month</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Email Campaigns</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Lead Scoring & Analytics</li>
                </ul>
              </Link>
              <Link href="/signup?tier=leadsite-ai" className="mt-6 inline-block w-full text-center bg-purple-500/20 border border-purple-500/30 text-purple-300 py-3 text-xs uppercase tracking-widest font-geist hover:bg-purple-500/30 transition-colors">Get started → LeadSite.AI dashboard</Link>
            </div>

            {/* 2: LeadSite.IO */}
            <div className="group bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all flex flex-col">
              <Link href="/leadsite-io" className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-space-grotesk text-white">LeadSite.IO</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white">$49<span className="text-sm text-neutral-500">/mo</span></div>
                </div>
                <p className="text-neutral-400 font-geist mb-6 text-sm">AI website builder + lead generation. Includes 1 free AI-built website.</p>
                <ul className="space-y-3 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>1 Free Website Included</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>AI Site Generator</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Lead Forms + Analytics</li>
                </ul>
              </Link>
              <Link href="/signup?tier=leadsite-io" className="mt-6 inline-block w-full text-center bg-purple-500/20 border border-purple-500/30 text-purple-300 py-3 text-xs uppercase tracking-widest font-geist hover:bg-purple-500/30 transition-colors">Get started → LeadSite.IO dashboard</Link>
            </div>

            {/* 3: ClientContact.IO */}
            <div className="group bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all flex flex-col">
              <Link href="/clientcontact-io" className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-space-grotesk text-white">ClientContact.IO</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white">$79<span className="text-sm text-neutral-500">/mo</span></div>
                </div>
                <p className="text-neutral-400 font-geist mb-6 text-sm">Unified inbox for 22+ channels. AI auto-responds and books meetings.</p>
                <ul className="space-y-3 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>22+ Channels Unified</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>AI Auto-Responder</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>3 Team Seats</li>
                </ul>
              </Link>
              <Link href="/signup?tier=clientcontact-io" className="mt-6 inline-block w-full text-center bg-purple-500/20 border border-purple-500/30 text-purple-300 py-3 text-xs uppercase tracking-widest font-geist hover:bg-purple-500/30 transition-colors">Get started → ClientContact dashboard</Link>
            </div>

            {/* 4: UltraLead */}
            <div className="group bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all flex flex-col">
              <Link href="/ultralead" className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-space-grotesk text-white">UltraLead</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white">$99<span className="text-sm text-neutral-500">/mo</span></div>
                </div>
                <p className="text-neutral-400 font-geist mb-6 text-sm">Full CRM, 7 AI agents, voice + pipeline. Enterprise sales automation.</p>
                <ul className="space-y-3 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>7 Self-Healing AI Agents</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Voice + CRM + Pipeline</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>API Access</li>
                </ul>
              </Link>
              <Link href="/signup?tier=ultralead" className="mt-6 inline-block w-full text-center bg-purple-500/20 border border-purple-500/30 text-purple-300 py-3 text-xs uppercase tracking-widest font-geist hover:bg-purple-500/30 transition-colors">Get started → UltraLead CRM dashboard</Link>
            </div>

            {/* 5: VideoSite.AI */}
            <div className="group bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all flex flex-col">
              <Link href="/videosite-ai" className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-space-grotesk text-white">VideoSite.AI</h3>
                  <div className="text-3xl font-space-grotesk font-light text-white">FREE</div>
                </div>
                <p className="text-neutral-400 font-geist mb-6 text-sm">Earn $1 per viewer. Video monetization for content creators.</p>
                <ul className="space-y-3 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full"></div>Earn $1/View</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Stripe Payouts</li>
                  <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Upload & Monetize</li>
                </ul>
              </Link>
              <Link href="/signup?tier=videosite" className="mt-6 inline-block w-full text-center bg-purple-500/20 border border-purple-500/30 text-purple-300 py-3 text-xs uppercase tracking-widest font-geist hover:bg-purple-500/30 transition-colors">Get started → VideoSite dashboard</Link>
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
