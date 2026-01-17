'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

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

          <Link href="/signup" className="group relative bg-white text-black px-3 sm:px-6 py-2 text-[10px] sm:text-xs font-semibold tracking-widest uppercase transition-transform overflow-hidden">
            <span className="relative z-10 font-geist">Start Free</span>
            <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-neutral-200"></div>
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
        <div className="relative z-10 pt-28 pb-16 sm:pt-40 sm:pb-20 md:pt-52 md:pb-32">
          <div className="container mx-auto px-4 sm:px-6 relative max-w-7xl">
            <div className="flex flex-col text-center mb-12 sm:mb-24 relative space-y-0 items-center justify-center">
              {/* Enterprise Badge */}
              <div className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll mb-4 sm:mb-6">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs uppercase tracking-wider font-geist">
                  ENTERPRISE PLATFORM
                </span>
              </div>

              <div className="flex flex-col z-10 w-full items-center justify-center">
                <h1 className="uppercase leading-[0.9] sm:leading-[0.85] flex flex-wrap justify-center gap-x-2 sm:gap-x-4 md:gap-x-8 text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-semibold text-white tracking-tighter mt-4 sm:mt-8 mb-0">
                  <span className="[animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light">
                    REPLACE HUBSPOT
                  </span>
                  <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk">
                    + GONG + OUTREACH
                  </span>
                </h1>
              </div>

              <h2 className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll text-base sm:text-lg md:text-2xl lg:text-3xl text-neutral-300 tracking-tight font-space-grotesk mt-6 sm:mt-8 mb-4 sm:mb-6 max-w-4xl px-2">
                Full CRM, voice calling, 7 AI agents, 22-channel outreach. Save $44,812/year.
              </h2>

              {/* Animated Metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-4xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll mt-8 sm:mt-12">
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="44" data-prefix="$" data-suffix="K+">$44K+</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Saved/Year</h3>
                </div>
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="7">7</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">AI Agents</h3>
                </div>
                <div className="bg-[#050505]/80 backdrop-blur-sm border border-purple-500/20 p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-purple-400 mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="99.9" data-suffix="%">99.9%</span>
                  </div>
                  <h3 className="text-[8px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Uptime</h3>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 sm:mt-12 w-full sm:w-auto px-4 sm:px-0 [animation:animationIn_0.8s_ease-out_0.7s_both] animate-on-scroll">
                <Link href="/signup" className="bg-white text-black px-6 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                  Schedule Enterprise Demo
                </Link>
                <Link href="#pricing" className="bg-transparent border border-purple-500/30 text-white px-6 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-widest uppercase hover:bg-purple-500/10 transition-colors font-geist text-center">
                  See Pricing Calculator
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Comparison Table */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Save <span className="text-gradient">$44,700</span> Per Year
            </h2>
            <p className="text-neutral-400 font-geist">Replace 5 tools with one unified platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Traditional Stack */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-6">Traditional Stack</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">HubSpot Sales Pro</span>
                  <span className="text-white font-space-grotesk">$1,200/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Gong</span>
                  <span className="text-white font-space-grotesk">$1,200/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Outreach</span>
                  <span className="text-white font-space-grotesk">$1,800/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Calendly</span>
                  <span className="text-white font-space-grotesk">$16/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-3">
                  <span className="text-neutral-400 font-geist">Slack</span>
                  <span className="text-white font-space-grotesk">$8/mo</span>
                </div>
              </div>
              <div className="pt-4 border-t border-subtle">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-400 font-geist">Total Monthly</span>
                  <span className="text-white font-space-grotesk text-xl">$4,224</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist">Total Yearly</span>
                  <span className="text-white font-space-grotesk text-xl">$50,688</span>
                </div>
              </div>
            </div>

            {/* TackleAI */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Everything Included
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-6">TackleAI</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Full CRM + Pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Voice Calling (Twilio)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">22-Channel Outreach</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">7 Self-Healing AI Agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Meeting Scheduler</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Document Management</span>
                </div>
              </div>
              <div className="pt-4 border-t border-purple-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-400 font-geist">Monthly</span>
                  <span className="text-purple-400 font-space-grotesk text-xl">$499</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-geist">Yearly</span>
                  <span className="text-purple-400 font-space-grotesk text-xl">$5,988</span>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="text-3xl text-green-400 font-space-grotesk font-light">
                    SAVINGS: $44,700/year
                  </div>
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
              7 Self-Healing <span className="text-gradient">AI Agents</span>
            </h2>
            <p className="text-neutral-400 font-geist">Autonomous agents that learn, adapt, and self-correct</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Campaign AI',
                description: 'Orchestrates multi-channel campaigns across 22 platforms. Generates personalized messages per platform. Self-healing: detects spam flags, rewrites with warmer tone.',
                icon: '📧'
              },
              {
                name: 'Social Syncs AI',
                description: 'Monitors 8 social platforms 24/7. Auto-generates contextual replies. Self-healing: missed reply? Responds within 5 minutes.',
                icon: '📱'
              },
              {
                name: 'Voice AI',
                description: 'Transcribes calls, extracts pain points, budget, timeline. Auto-updates CRM. Self-healing: transcription error? Reruns with higher accuracy.',
                icon: '🎤'
              },
              {
                name: 'LeadGen AI',
                description: 'Scores leads 0-100 based on behavior. Enriches profiles with external data. Self-healing: low conversion on high scores? Recalibrates model.',
                icon: '🎯'
              },
              {
                name: 'Analytics AI',
                description: 'Analyzes A/B tests, identifies conversion bottlenecks. Natural language insights. Self-healing: data anomalies? Flags for review.',
                icon: '📊'
              },
              {
                name: 'Integration AI',
                description: 'Syncs data between all platforms. Handles OAuth refresh automatically. Self-healing: sync failure? Retries with exponential backoff.',
                icon: '🔗'
              },
              {
                name: 'CleanOS AI',
                description: 'Monitors system health, database performance. Self-healing: slow queries? Adds indexes automatically. High errors? Restarts services.',
                icon: '⚙️'
              }
            ].map((agent, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 hover:border-purple-500/50 transition-all group relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4 animate-pulse">{agent.icon}</div>
                  <h3 className="text-xl font-space-grotesk text-white mb-3">{agent.name}</h3>
                  <p className="text-sm text-neutral-400 font-geist leading-relaxed">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Enterprise <span className="text-gradient">Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Full CRM + Pipeline', desc: 'Deals, contacts, activities, custom fields, reporting' },
              { title: 'Voice Calling', desc: 'Twilio integration, call recording, transcription, sentiment' },
              { title: '22-Channel Outreach', desc: 'LinkedIn, FB, IG, Twitter, TikTok, YouTube, Email, SMS, WhatsApp' },
              { title: 'Meeting Scheduler', desc: 'Calendly-like booking, timezone detection, automated reminders' },
              { title: 'Document Management', desc: 'Proposals, contracts, e-signatures via DocuSign' },
              { title: 'Revenue Forecasting', desc: 'AI predicts close dates, deal probability, quarterly targets' },
              { title: 'Team Performance', desc: 'Leaderboards, activity tracking, coaching insights' },
              { title: 'White-Label Option', desc: 'Custom domain, logo, branding for agencies' }
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

      {/* Pricing Tiers */}
      <section id="pricing" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Enterprise <span className="text-gradient">Pricing</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Professional */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $249<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  2,000 Leads/Month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Full CRM + Pipeline
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  All 22 channels
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  7 AI Agents
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited Team
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Popular
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $2,999<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited team seats
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited contacts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  All 7 AI agents
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  White-label option
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Custom integrations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Dedicated CSM
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Custom */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Custom</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                Custom<span className="text-sm text-neutral-500"> pricing</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Multi-tenant
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  On-premise deployment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  SOC 2 Type II
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  HIPAA compliance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Annual contracts
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-transparent border border-purple-500/30 text-white px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-500/10 transition-colors font-geist text-center">
                Contact Sales
              </Link>
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

      {/* Enterprise CTA Section */}
      <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative bg-gradient-to-b from-purple-950/10 to-black">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mb-8 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to Transform <span className="text-gradient">Your Sales Ops?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-4 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Schedule a personalized demo with our enterprise team
          </p>
          <p className="text-sm text-neutral-500 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            30-day pilot program • Dedicated onboarding • Migration support included
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
            <Link href="/signup" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Book Enterprise Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="TACKLEAI" />
    </div>
  );
}
