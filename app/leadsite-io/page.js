'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function LeadSiteIOPage() {
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

  const templates = [
    { name: 'SaaS Product Launch', desc: 'Perfect for launching new products' },
    { name: 'Lead Magnet Download', desc: 'Capture leads with valuable content' },
    { name: 'Webinar Registration', desc: 'Drive webinar sign-ups' },
    { name: 'Consultation Booking', desc: 'Book discovery calls automatically' },
    { name: 'eBook Landing Page', desc: 'Promote downloadable content' },
    { name: 'Agency Portfolio', desc: 'Showcase your work and services' }
  ];

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
            <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
              LeadSite.IO
            </Link>
          </div>

          <div className="px-2 sm:px-6 text-lg sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            <span className="hidden sm:inline">LEAD</span>SITE
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              ClientContact
            </Link>
            <Link href="/tackle-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              TackleAI
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
            <source src="/meeting-handshake.mp4" type="video/mp4" />
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

        {/* Hero Content */}
        <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
          <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
            {/* Price Badge */}
            <div className="[animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll mb-6 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-space-grotesk">
                $39/month
              </span>
              <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-space-grotesk">
                + 1 FREE AI Website
              </span>
            </div>

            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-3 sm:gap-y-5 md:gap-y-6 text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-semibold text-white tracking-tighter mt-4 mb-8">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                  BUILD AI WEBSITES THAT
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                  GENERATE LEADS 24/7
                </span>
              </h1>
            </div>

            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-base sm:text-lg md:text-2xl lg:text-3xl text-neutral-400 tracking-tight font-space-grotesk mt-4 mb-6 max-w-4xl px-4">
              AI-powered prospect discovery and personalized outreach. Install once, generate qualified leads forever.
            </h2>

            <p className="[animation:animationIn_0.8s_ease-out_0.45s_both] animate-on-scroll text-sm sm:text-base md:text-xl text-green-400 tracking-tight font-space-grotesk mb-8 px-4">
              Includes an AI website builder — launch your first lead-generating website FREE.
            </p>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              AI-POWERED LEAD GENERATION LIVE
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto px-4 sm:px-0 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
              <Link href="/signup?tier=leadsite-io" className="bg-white text-black px-8 sm:px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Free Trial
              </Link>
              <Link href="#demo" className="bg-transparent border border-subtle text-white px-8 sm:px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist text-center">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Core <span className="text-gradient">Capabilities</span>
            </h2>
            <p className="text-neutral-400 font-geist">Designed for autonomous lead generation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI Prospect Discovery',
                desc: 'Our AI finds 20-50 qualified prospects daily using Google Maps and Apollo.io, perfectly matched to your business.',
                icon: '🎯'
              },
              {
                title: 'Automated Outreach',
                desc: 'Personalized emails written by AI and sent automatically. Replies go directly to your inbox.',
                icon: '📧'
              },
              {
                title: 'Multi-Tenant Security',
                desc: 'Enterprise-grade data isolation. Your prospects and campaigns remain completely private and secure.',
                icon: '🔒'
              },
              {
                title: 'AI Website Builder',
                desc: 'Generate a high-converting website in minutes. AI designs the layout, writes copy, and embeds lead capture automatically.',
                icon: '🌐'
              },
              {
                title: 'Lead Form Builder',
                desc: 'Unlimited forms with custom fields, auto-sync to CRM',
                icon: '📝'
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Real-time visitor tracking, conversion funnels, heatmaps',
                icon: '📊'
              },
              {
                title: 'Custom Domains',
                desc: 'Connect your domain, auto-SSL, CDN hosting',
                icon: '🔗'
              },
              {
                title: 'SEO Optimization',
                desc: 'Auto-generates meta tags, schema markup, sitemaps',
                icon: '🔍'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-space-grotesk text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              The Integration <span className="text-gradient">Process</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Build Your Website', desc: 'Answer a few questions and let AI generate your website. Your first website is free. Publish instantly and start capturing leads.' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI analyzes your business and builds your ideal customer profile in minutes.' },
              { step: '03', title: 'Generate Leads', desc: 'Sit back and watch as qualified prospects appear in your dashboard daily, with automated outreach.' },
              { step: '04', title: 'Close Deals', desc: 'High scorers go directly to your inbox ready to convert.' }
            ].map((item, index) => (
              <div
                key={index}
                className="relative [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }}></div>
                )}
                <div className="relative z-10 bg-[#050505] border border-purple-500/20 p-8">
                  <div className="text-purple-400 text-sm font-geist mb-4">{item.step}</div>
                  <h3 className="text-xl font-space-grotesk text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-neutral-400 font-geist">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section id="templates" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Professional <span className="text-gradient">Templates</span>
            </h2>
            <p className="text-neutral-400 font-geist">Start with a template, customize to perfection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle overflow-hidden hover:border-purple-500/30 transition-all group [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-950/20 to-neutral-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                  <div className="relative z-10 text-4xl">{template.name === 'SaaS Product Launch' ? '🚀' : template.name === 'Lead Magnet Download' ? '📥' : template.name === 'Webinar Registration' ? '📹' : template.name === 'Consultation Booking' ? '📅' : template.name === 'eBook Landing Page' ? '📚' : '🎨'}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-space-grotesk text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-neutral-400 font-geist mb-4">{template.desc}</p>
                  <Link href="#" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest">
                    Preview Template →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Before vs <span className="text-gradient">After</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-[#050505] border border-red-500/20 p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-6">Before LeadSite.IO</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">2 weeks with developer</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">$5K cost</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Generic template</span>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-[#050505] border border-green-500/20 p-8 [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-6">With LeadSite.IO</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">3 minutes with AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">$29/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <span className="text-neutral-300 font-geist">Custom design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
          </div>

          <div className="flex justify-center max-w-6xl mx-auto">
            {/* Single Plan - $49/mo */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll max-w-md w-full">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">LeadSite.IO</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $49<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  1 AI-generated website included (free)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  2,000 qualified leads/month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited AI personalized emails
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Automated prospect discovery
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Real-time analytics dashboard
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              See LeadSite.IO <span className="text-gradient">in Action</span>
            </h2>
          </div>

          <div className="relative aspect-video bg-[#050505] border border-subtle [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-500/30 transition-colors">
                <svg className="w-10 h-10 text-purple-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Integrations <span className="text-gradient">Showcase</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-7 gap-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            {['Google Analytics', 'Facebook Pixel', 'Hotjar', 'Mailchimp', 'Zapier', 'Stripe', 'Calendly'].map((name, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 flex items-center justify-center hover:border-purple-500/30 transition-colors"
              >
                <span className="text-neutral-400 font-geist text-sm uppercase tracking-wider text-center">{name}</span>
              </div>
            ))}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'LeadSite.AI', desc: 'AI lead scoring and enrichment', href: '/leadsite-ai' },
              { name: 'ClientContact.IO', desc: 'Unified inbox for follow-up', href: '/clientcontact-io' },
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

      {/* Final CTA Section */}
      <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mb-8 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to scale your <span className="text-gradient">outreach?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-4 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Start free — build your first website and activate AI lead generation in minutes.
          </p>
          <p className="text-sm text-neutral-500 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.35s_both] animate-on-scroll">
            No credit card required • Cancel anytime
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link href="/signup" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="LEADSITE.IO" />
    </div>
  );
}
