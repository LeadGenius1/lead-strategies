'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO Component for LeadSite.IO
function LeadSiteIOSEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'LeadSite.IO',
    description: 'AI website builder with integrated lead generation - build websites that convert visitors to leads 24/7',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/leadsite-io',
      price: '114',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '1023' }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is LeadSite.IO?', acceptedAnswer: { '@type': 'Answer', text: 'LeadSite.IO is an AI-powered website builder that creates lead-generating websites in minutes. It includes AI design, lead capture forms, analytics, and automated prospect discovery.' } },
      { '@type': 'Question', name: 'Is the free website really free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, LeadSite.IO includes one completely free AI-generated website with your $114/month subscription. Additional websites can be added for a small fee.' } },
      { '@type': 'Question', name: 'How does the AI website builder work?', acceptedAnswer: { '@type': 'Answer', text: 'Answer a few questions about your business and LeadSite.IO AI generates a complete website with optimized copy, lead capture forms, and conversion-focused design in under 3 minutes.' } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>LeadSite.IO - AI Website Builder with Lead Generation</h1>
        <p>LeadSite.IO is an AI website builder by AI Lead Strategies LLC, priced at $114/month plus 1 free AI website included. Features: AI-powered website generation in under 3 minutes, lead capture forms with custom fields, real-time analytics and heatmaps, custom domain with auto-SSL, SEO optimization with meta tags and sitemaps, automated prospect discovery, CRM sync, premium templates from Aura.build. Best for businesses needing lead-generating websites without developers. Alternatives: Wix, Squarespace, Leadpages, Unbounce. Contact: support@aileadstrategies.com | 610-757-1587</p>
        <h2>AI Website Builder Features</h2>
        <ul>
          <li>AI generates complete website in minutes</li>
          <li>Lead capture forms with CRM integration</li>
          <li>Premium templates from Aura.build</li>
          <li>Custom domains with SSL</li>
          <li>Built-in SEO optimization</li>
        </ul>
      </div>
    </>
  );
}

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
    { 
      name: 'AI Image Generation Landing Page', 
      desc: 'Modern AI-powered design with stunning visuals and conversion-focused layout',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/auragen.png',
      remixes: '43k',
      isPro: true
    },
    { 
      name: 'Creative Portfolio Landing Page', 
      desc: 'Showcase your work with this elegant portfolio template',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/portfolio-showcase.png',
      remixes: '39k',
      isPro: true
    },
    { 
      name: 'Interactive Globe Hero Section', 
      desc: '3D interactive globe visualization for tech and SaaS products',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/6RtK47a_1746440941.jpg',
      remixes: '53k',
      isPro: false
    },
    { 
      name: 'Creative Suite Landing Page', 
      desc: 'Perfect for creative tools and design software launches',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/lumina-video.png',
      remixes: '19k',
      isPro: true
    },
    { 
      name: 'Nebula Web3 Infrastructure', 
      desc: 'Futuristic template for blockchain and Web3 projects',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/nebula.png',
      remixes: '18k',
      isPro: true
    },
    { 
      name: 'Financial Banking Landing Page', 
      desc: 'Professional fintech template with trust-building elements',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/preview-images/aura-financial.png',
      remixes: '12k',
      isPro: true
    }
  ];

  return (
    <>
      <LeadSiteIOSEO />
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              AI-POWERED WEBSITE BUILDER
            </div>

            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-4 md:gap-y-5 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter mt-4 mb-6">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                  BUILD AI WEBSITES THAT
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                  GENERATE LEADS 24/7
                </span>
              </h1>
            </div>

            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-sm sm:text-base md:text-xl lg:text-2xl text-neutral-400 tracking-tight font-space-grotesk mt-4 mb-6 max-w-3xl px-4">
              AI-powered website builder with automated lead generation. Create stunning websites that convert visitors into customers.
            </h2>
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
                Icon: Icons.Target,
                color: 'text-purple-400'
              },
              {
                title: 'Automated Outreach',
                desc: 'Personalized emails written by AI and sent automatically. Replies go directly to your inbox.',
                Icon: Icons.Mail,
                color: 'text-sky-400'
              },
              {
                title: 'Multi-Tenant Security',
                desc: 'Enterprise-grade data isolation. Your prospects and campaigns remain completely private and secure.',
                Icon: Icons.ShieldCheck,
                color: 'text-green-400'
              },
              {
                title: 'AI Website Builder',
                desc: 'Generate a high-converting website in minutes. AI designs the layout, writes copy, and embeds lead capture automatically.',
                Icon: Icons.Globe,
                color: 'text-blue-400'
              },
              {
                title: 'Lead Form Builder',
                desc: 'Unlimited forms with custom fields, auto-sync to CRM',
                Icon: Icons.FileText,
                color: 'text-amber-400'
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Real-time visitor tracking, conversion funnels, heatmaps',
                Icon: Icons.BarChart,
                color: 'text-emerald-400'
              },
              {
                title: 'Custom Domains',
                desc: 'Connect your domain, auto-SSL, CDN hosting',
                Icon: Icons.Link2,
                color: 'text-indigo-400'
              },
              {
                title: 'SEO Optimization',
                desc: 'Auto-generates meta tags, schema markup, sitemaps',
                Icon: Icons.Search,
                color: 'text-pink-400'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className={`w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.Icon className="w-6 h-6" />
                </div>
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
            <p className="text-neutral-400 font-geist">Start with a premium template, customize with AI to perfection</p>
            <p className="text-xs text-purple-400 font-geist mt-2">Powered by Aura.build • 65,000+ users worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle overflow-hidden hover:border-purple-500/30 transition-all group [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-950/20 to-neutral-900 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* PRO Badge */}
                  {template.isPro && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 text-white text-[10px] font-bold uppercase tracking-wider">
                      PRO
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-space-grotesk text-white">{template.name}</h3>
                  </div>
                  <p className="text-sm text-neutral-400 font-geist mb-4">{template.desc}</p>
                  <div className="flex items-center justify-between">
                    <Link href="/signup?tier=leadsite-io" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest">
                      Use Template →
                    </Link>
                    <span className="text-xs text-neutral-500 font-geist">{template.remixes} remixes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
            <Link href="/signup?tier=leadsite-io" className="inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-500/30 transition-colors font-geist">
              Browse All Templates →
            </Link>
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
                  <div className="w-6 h-6 flex items-center justify-center text-red-500">
                    <Icons.X className="w-5 h-5" />
                  </div>
                  <span className="text-neutral-300 font-geist">2 weeks with developer</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-red-500">
                    <Icons.X className="w-5 h-5" />
                  </div>
                  <span className="text-neutral-300 font-geist">$5K cost</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-red-500">
                    <Icons.X className="w-5 h-5" />
                  </div>
                  <span className="text-neutral-300 font-geist">Generic template</span>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-[#050505] border border-green-500/20 p-8 [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-6">With LeadSite.IO</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-green-500">
                    <Icons.Check className="w-5 h-5" />
                  </div>
                  <span className="text-neutral-300 font-geist">3 minutes with AI</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-green-500">
                    <Icons.Check className="w-5 h-5" />
                  </div>
                  <span className="text-neutral-300 font-geist">$29/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center text-green-500">
                    <Icons.Check className="w-5 h-5" />
                  </div>
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
            {/* Single Plan - $114/mo */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll max-w-md w-full">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">LeadSite.IO</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $114<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <p className="text-green-400 text-sm font-geist mb-4">+ 1 Free AI Website Included</p>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  AI website builder
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Lead capture forms
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
              <div className="text-center">
                <ShinyButton href="/signup?tier=leadsite-io">
                  Get Started
                </ShinyButton>
              </div>
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
                <Icons.Play className="w-10 h-10 text-purple-400 ml-1" />
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

      {/* Final Section */}
      <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-6xl uppercase text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to scale your <span className="text-gradient">outreach?</span>
          </h2>
          <p className="text-lg text-neutral-400 font-geist [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            See pricing above to get started with your 14-day free trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="LEADSITE.IO" />
    </div>
    </>
  );
}
