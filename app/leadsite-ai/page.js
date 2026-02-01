'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO Component for LeadSite.AI
function LeadSiteAISEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'LeadSite.AI',
    description: 'AI-powered lead scoring and enrichment platform that finds 20-50 qualified prospects daily using Google Maps and Apollo.io',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/leadsite-ai',
      price: '69',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'AI Lead Strategies LLC' }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '847'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is LeadSite.AI?',
        acceptedAnswer: { '@type': 'Answer', text: 'LeadSite.AI is an AI-powered lead scoring and enrichment platform that automatically discovers 20-50 qualified prospects daily using data from Google Maps and Apollo.io.' }
      },
      {
        '@type': 'Question',
        name: 'How much does LeadSite.AI cost?',
        acceptedAnswer: { '@type': 'Answer', text: 'LeadSite.AI costs $49 per month with no long-term commitment. It includes AI prospect discovery, lead scoring, personalized email generation, and campaign automation.' }
      },
      {
        '@type': 'Question',
        name: 'How does AI lead scoring work?',
        acceptedAnswer: { '@type': 'Answer', text: 'LeadSite.AI uses machine learning to score leads from 0-100 based on behavior patterns, company data, engagement signals, and fit with your ideal customer profile.' }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>LeadSite.AI - AI Lead Scoring & Enrichment Software</h1>
        <p>LeadSite.AI is an AI-powered lead scoring and enrichment platform by AI Lead Strategies LLC, priced at $49/month. Features include: AI prospect discovery using Google Maps and Apollo.io data sources, automated lead scoring from 0-100, lead data enrichment, 20-50 qualified prospects delivered daily to your dashboard, AI-generated personalized outreach emails, campaign automation, and CRM integration. Best for B2B sales teams wanting automated lead qualification. Competitors/alternatives: Clearbit, ZoomInfo, Lusha, Apollo.io. Contact: support@aileadstrategies.com | (855) 506-8886</p>
        <h2>AI Lead Scoring Features</h2>
        <ul>
          <li>Automated prospect discovery from Google Maps</li>
          <li>Lead enrichment with Apollo.io integration</li>
          <li>Predictive lead scoring algorithm</li>
          <li>AI-written personalized emails</li>
          <li>Daily qualified lead delivery</li>
        </ul>
      </div>
    </>
  );
}

export default function LeadSiteAIPage() {
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
      <LeadSiteAISEO />
      <div className="relative overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl gap-x-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/leadsite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
              LeadSite.AI
            </Link>
            <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
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
            <source src="/handshake.mp4" type="video/mp4" />
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
              NO MORE SLEEPING WEBSITES
            </div>

            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter mt-2 mb-4">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                  TURN YOUR WEBSITE INTO A
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                  LEAD GENERATING MACHINE
                </span>
              </h1>
            </div>

            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-400 tracking-tight font-space-grotesk mt-2 mb-4 max-w-3xl px-4">
              AI-powered prospect discovery and personalized outreach. Install once, generate qualified leads forever. No manual work required.
            </h2>
          </div>
        </div>
        </div>
      </section>

      {/* What It Does (Simple) */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              What It Does <span className="text-gradient">(Simple)</span>
            </h2>
            <p className="text-lg md:text-xl text-neutral-300 font-geist leading-relaxed max-w-3xl mx-auto">
              Turn your website into a lead-generating machine—while you sleep. Our AI finds your perfect customers, writes personalized emails, and sends them automatically. You wake up to warm leads in your inbox.
            </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { 
                step: '01', 
                title: 'Connect Your Website', 
                desc: 'Takes 3 minutes. No tech skills needed.' 
              },
              { 
                step: '02', 
                title: 'AI Finds Your Leads', 
                desc: 'We search for businesses that need what you sell.' 
              },
              { 
                step: '03', 
                title: 'AI Writes Your Emails', 
                desc: 'Personal, professional messages that get responses.' 
              },
              { 
                step: '04', 
                title: 'Leads Come to You', 
                desc: 'Check your inbox. Start conversations. Close deals.' 
              }
            ].map((item, index) => (
              <div
                key={index}
                className="relative [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }}></div>
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

      {/* Why Choose LeadSite.AI */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Why Choose <span className="text-gradient">LeadSite.AI</span>
            </h2>
          </div>

          <div className="bg-[#050505] border border-subtle overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Old Way Column */}
              <div className="p-8 border-r border-subtle">
                <h3 className="text-2xl font-space-grotesk text-white mb-6">Old Way</h3>
                <ul className="space-y-4 font-geist text-neutral-400">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Manual prospecting takes hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Generic emails get ignored</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>No time to follow up properly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Leads go cold before you reach them</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>Expensive tools, complex setup</span>
                  </li>
                </ul>
              </div>

              {/* LeadSite.AI Way Column */}
              <div className="p-8 bg-purple-950/10">
                <h3 className="text-2xl font-space-grotesk text-white mb-6">LeadSite.AI Way</h3>
                <ul className="space-y-4 font-geist text-neutral-300">
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span>AI finds leads automatically, 24/7</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span>Personalized emails that get responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span>Automated follow-ups never miss a lead</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span>Warm leads delivered to your inbox</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <span>Simple setup, affordable pricing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The AI Advantage */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              The AI <span className="text-gradient">Advantage</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            {[
              { title: 'Works While You Sleep', desc: 'Your lead generation never stops. AI works 24/7 to find and reach out to prospects.' },
              { title: 'Smarter Every Day', desc: 'Machine learning improves targeting and messaging with every campaign you run.' },
              { title: 'No Experience Needed', desc: 'Set it up in minutes. No marketing degree or technical skills required.' },
              { title: 'Real Results, Real Fast', desc: 'See qualified leads in your inbox within days, not months.' }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <h3 className="text-lg font-space-grotesk text-white mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-400 font-geist">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Who It's <span className="text-gradient">For</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            {[
              'Small business owners who need more leads',
              'Sales teams tired of cold calling',
              'Agencies managing multiple clients',
              'Solo entrepreneurs wearing all hats',
              'B2B companies looking to scale',
              'Anyone who wants leads on autopilot'
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-neutral-300 font-geist">{item}</p>
                </div>
              </div>
            ))}
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
                title: 'CRM Integration',
                desc: 'Syncs with Salesforce, HubSpot, Pipedrive automatically. Two-way data flow keeps everything in sync.',
                Icon: Icons.RefreshCw,
                color: 'text-blue-400'
              },
              {
                title: 'Custom Scoring Models',
                desc: 'Train AI on your historical conversion data. Build models that match your unique sales process.',
                Icon: Icons.Brain,
                color: 'text-pink-400'
              },
              {
                title: 'Real-Time Alerts',
                desc: 'Slack/Email notifications when high-value leads enter system. Never miss a hot prospect again.',
                Icon: Icons.Zap,
                color: 'text-amber-400'
              },
              {
                title: 'Lead Source Tracking',
                desc: 'Multi-touch attribution across all channels. See exactly which campaigns drive the best leads.',
                Icon: Icons.MapPin,
                color: 'text-red-400'
              },
              {
                title: 'Predictive Analytics',
                desc: "Forecasts which leads will convert, when they'll buy, and how much revenue they'll generate.",
                Icon: Icons.TrendingUp,
                color: 'text-emerald-400'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
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

      {/* Pricing Tiers */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Starter Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $49<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>500 leads/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>5 email campaigns</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>2,500 emails/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Lead discovery</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>1 team seat</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=leadsite_ai&tier=starter">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Professional Tier - Most Popular */}
            <div className="bg-gradient-to-br from-purple-950/30 to-[#050505] border-2 border-purple-500 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.35s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500 text-white text-[10px] uppercase tracking-wider font-geist">Most Popular</div>
              <h3 className="text-xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $149<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>2,500 leads/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>20 email campaigns</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>12,500 emails/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Advanced filtering</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>3 team seats</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=leadsite_ai&tier=professional">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Business Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Business</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $349<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>7,500 leads/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>50 email campaigns</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>37,500 emails/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Priority support</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>10 team seats</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=leadsite_ai&tier=business">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.45s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $799<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>20,000 leads/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited campaigns</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>100,000 emails/month</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Dedicated manager</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited team seats</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=leadsite_ai&tier=enterprise">Contact Sales</ShinyButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Connects to Your <span className="text-gradient">Existing Stack</span>
            </h2>
            <p className="text-neutral-400 font-geist">90+ integrations available via API</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-7 gap-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            {['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho', 'Clearbit', 'ZoomInfo', 'LinkedIn Sales Navigator'].map((name, index) => (
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

      {/* Demo Video Section */}
      <section id="demo" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              See LeadSite.AI <span className="text-gradient">in Action</span>
            </h2>
            <p className="text-neutral-400 font-geist">Watch how Fortune 500 teams score 10K leads/day</p>
          </div>

          <div className="relative aspect-video bg-[#050505] border border-subtle [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll overflow-hidden rounded-lg">
            {/* Video Embed - Replace VIDEO_ID with actual YouTube/Loom/Vimeo video ID */}
            {process.env.NEXT_PUBLIC_DEMO_VIDEO_URL ? (
              <iframe
                src={process.env.NEXT_PUBLIC_DEMO_VIDEO_URL}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="LeadSite.AI Demo Video"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-500/30 transition-colors mb-4">
                  <Icons.Play className="w-10 h-10 text-purple-400 ml-1" />
                </div>
                <p className="text-neutral-400 font-geist text-sm">Demo video coming soon</p>
                <p className="text-neutral-500 font-geist text-xs mt-2">Set NEXT_PUBLIC_DEMO_VIDEO_URL to embed video</p>
              </div>
            )}
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
            <p className="text-neutral-400 font-geist">Works seamlessly with all our platforms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'LeadSite.IO', desc: 'Website builder to capture more leads', href: '/leadsite-io' },
              { name: 'ClientContact.IO', desc: 'Unified inbox for follow-up', href: '/clientcontact-io' },
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
      <Footer brandName="LEADSITE.AI" />
    </div>
    </>
  );
}
