'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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

    function startCounters(container: Element) {
      container.querySelectorAll('[data-target]').forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function update(t: number) {
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
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border pt-2 pr-2 pb-2 pl-2 shadow-2xl backdrop-blur-xl gap-x-1 gap-y-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/leadsite-ai" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.AI
            </Link>
            <Link href="/leadsite-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
              LeadSite.IO
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            AI LEAD
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              ClientContact
            </Link>
            <Link href="/videosite-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              VideoSite
            </Link>
          </div>

          <Link href="/signup" className="group relative bg-white text-black px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-transform overflow-hidden">
            <span className="relative z-10 font-geist">Start Free Trial</span>
            <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-neutral-200"></div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative max-w-7xl">
          <div className="flex flex-col text-center mb-24 relative space-y-0 items-center justify-center">
            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[0.85] flex flex-wrap justify-center gap-x-4 md:text-9xl md:gap-x-8 text-6xl font-semibold text-white tracking-tighter mt-8 mb-0">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light">
                  BUILD WEBSITES IN
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk">
                  3 MINUTES WITH AI
                </span>
              </h1>
            </div>

            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-lg text-neutral-400 tracking-tight font-space-grotesk md:text-3xl mt-8 mb-6">
              No-code landing page builder powered by Claude 4.1. Generate, customize, publish.
            </h2>

            {/* Animated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll mt-12">
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="10" data-suffix="K+">10K+</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Sites Built</h3>
              </div>
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="87" data-suffix="%">87%</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Conversion Rate</h3>
              </div>
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="3" data-prefix="< " data-suffix=" Min">3 Min</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Average</h3>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row gap-4 mt-12 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
              <Link href="/signup" className="bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
                Create Your First Site
              </Link>
              <Link href="#templates" className="bg-transparent border border-subtle text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist">
                Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Powerful <span className="text-gradient">Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'AI Site Generator',
                desc: 'Describe your offer, AI builds complete site with copy + images',
                icon: '🤖'
              },
              {
                title: 'Drag-and-Drop Editor',
                desc: 'Visual builder with 50+ pre-built sections',
                icon: '🎨'
              },
              {
                title: 'Lead Form Builder',
                desc: 'Unlimited forms with custom fields, auto-sync to CRM',
                icon: '📝'
              },
              {
                title: 'A/B Testing',
                desc: 'Test headlines, CTAs, layouts automatically',
                icon: '🧪'
              },
              {
                title: 'Mobile-Optimized',
                desc: 'Perfect on all devices, Google Core Web Vitals 95+',
                icon: '📱'
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Real-time visitor tracking, conversion funnels, heatmaps',
                icon: '📊'
              },
              {
                title: 'Custom Domains',
                desc: 'Connect your domain, auto-SSL, CDN hosting',
                icon: '🌐'
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
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Describe Your Offer', desc: 'AI generates complete site in 60 seconds' },
              { step: '02', title: 'Customize Design', desc: 'Drag-and-drop editor, unlimited revisions' },
              { step: '03', title: 'Connect Domain', desc: 'One-click publish, auto-SSL, global CDN' },
              { step: '04', title: 'Track Performance', desc: 'Real-time analytics, conversion tracking' }
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
              Simple <span className="text-gradient">Pricing</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $49<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  1,000 Leads/Month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  1 Free Website Built by AI
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  AI site generator
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Lead forms + Analytics
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Email support
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Popular
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $149<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  15 websites
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  A/B testing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited forms
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  100,000 visitors/month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Remove branding
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $1,999<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited websites
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  White-label option
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Dedicated IP
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited visitors
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  API access
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Dedicated CSM
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-transparent border border-purple-500/30 text-white px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-500/10 transition-colors font-geist text-center">
                Contact Sales
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
              { name: 'VideoSite.IO', desc: 'AI video marketing platform', href: '/videosite-io' }
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
            Build Your First Site <span className="text-gradient">in 3 Minutes</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Join 10,000+ businesses using AI to build high-converting websites
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link href="/signup" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Start Free 14-Day Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black pt-12 pb-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
              <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse"></div>
              AI LEAD STRATEGIES
            </div>
            <div className="flex gap-8 text-xs font-geist text-neutral-500 uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>

          <div className="border-t border-subtle pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors font-geist">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors font-geist">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition-colors font-geist">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
