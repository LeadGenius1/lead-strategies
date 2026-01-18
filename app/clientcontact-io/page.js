'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';

export default function ClientContactIOPage() {
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

  const features = [
    {
      title: 'AI-Powered Search',
      desc: 'Use natural language to find leads across multiple data sources including LinkedIn, ZoomInfo, Apollo, and more.',
      Icon: Icons.Search,
      color: 'text-purple-400',
    },
    {
      title: 'Email Discovery & Verification',
      desc: 'Find and verify email addresses with SMTP validation, catch-all detection, and confidence scoring.',
      Icon: Icons.Mail,
      color: 'text-sky-400',
    },
    {
      title: 'Multi-Source Aggregation',
      desc: 'Search and aggregate data from LinkedIn, Google Maps, Apollo, Hunter.io, Clearbit, Crunchbase, ZoomInfo, and Yelp.',
      Icon: Icons.Puzzle,
      color: 'text-emerald-400',
    },
    {
      title: 'AI Lead Scoring',
      desc: 'Automatically score and grade leads based on ICP fit, data quality, intent signals, and engagement metrics.',
      Icon: Icons.TrendingUp,
      color: 'text-green-400',
    },
    {
      title: 'Advanced Filtering',
      desc: 'Filter by job title, seniority, industry, company size, location, tech stack, and funding status.',
      Icon: Icons.Settings,
      color: 'text-amber-400',
    },
    {
      title: 'CRM Integration',
      desc: 'Export to Salesforce, HubSpot, Pipedrive, or download as JSON, CSV, and Excel formats.',
      Icon: Icons.RefreshCw,
      color: 'text-blue-400',
    },
  ];

  const benefits = [
    {
      title: 'Save 10+ hours per week on lead research',
      desc: 'Save 10+ hours per week on lead research',
      Icon: Icons.Clock,
      color: 'text-amber-400',
    },
    {
      title: 'Access 500M+ verified business contacts',
      desc: 'Access 500M+ verified business contacts',
      Icon: Icons.Globe,
      color: 'text-blue-400',
    },
    {
      title: 'Reduce bounce rates with email verification',
      desc: 'Reduce bounce rates with email verification',
      Icon: Icons.Check,
      color: 'text-green-400',
    },
  ];

  const dataSources = [
    { name: 'LinkedIn', desc: 'Profile & company data', Icon: Icons.Link2, color: 'text-blue-400' },
    { name: 'Google Maps', desc: 'Local business insights', Icon: Icons.MapPin, color: 'text-red-400' },
    { name: 'Apollo.io', desc: 'B2B contact database', Icon: Icons.Rocket, color: 'text-purple-400' },
    { name: 'Hunter.io', desc: 'Email finder & verifier', Icon: Icons.Mail, color: 'text-amber-400' },
    { name: 'Clearbit', desc: 'Company enrichment', Icon: Icons.Building, color: 'text-cyan-400' },
    { name: 'Crunchbase', desc: 'Funding & startup data', Icon: Icons.DollarSign, color: 'text-green-400' },
    { name: 'ZoomInfo', desc: 'Intent signals & contacts', Icon: Icons.Target, color: 'text-pink-400' },
    { name: 'Yelp', desc: 'Business reviews & ratings', Icon: Icons.Star, color: 'text-yellow-400' },
  ];

  const faqs = [
    {
      q: 'What data sources does this use?',
      a: 'We aggregate and deduplicate lead data from multiple premium sources (LinkedIn, Google Maps, Apollo, Hunter, Clearbit, Crunchbase, ZoomInfo, Yelp).',
    },
    {
      q: 'Does it verify emails?',
      a: 'Yes. Email discovery includes verification signals like validation, catch-all detection, and confidence scoring.',
    },
    {
      q: 'Can I export to my CRM?',
      a: 'Yes. Export to Salesforce, HubSpot, Pipedrive, or download as JSON, CSV, and Excel.',
    },
    {
      q: 'Is it GDPR compliant?',
      a: 'Designed to support compliance workflows and uses official APIs where applicable. Always consult your legal team for your specific use case.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes. Start your free trial from the signup page—no credit card required.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. Cancel anytime with no long-term contracts.',
    },
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
            <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.IO
            </Link>
          </div>

          <div className="px-2 sm:px-6 text-lg sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            <span className="hidden sm:inline">CLIENT</span>CONTACT
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
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
          <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
            <source src="/meeting-handshake.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/70"></div>
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
            <div className="flex flex-col text-center mb-16 relative items-center justify-center">
              {/* Price Badge */}
              <div className="[animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll mb-6">
                <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-space-grotesk">
                  $99/month
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                AI-POWERED LEAD DISCOVERY PLATFORM
              </div>

              <div className="flex flex-col z-10 w-full items-center justify-center">
                <h1 className="leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-3 sm:gap-y-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter mt-2 mb-8 font-space-grotesk px-4">
                  <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll block">Find Your Perfect Clients with</span>
                  <span className="text-gradient font-light [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll block">AI Intelligence</span>
                </h1>
              </div>

              <p className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-sm sm:text-base md:text-lg lg:text-xl text-neutral-300 tracking-tight font-geist mt-4 mb-8 max-w-3xl px-4">
                Search, enrich, and verify leads from 8+ premium data sources. Save hours of research with AI-powered contact discovery and intelligent lead scoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto px-4 sm:px-0 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
                <Link href="/signup?tier=clientcontact" className="bg-white text-black px-8 sm:px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                  Start Free Trial
                </Link>
                <Link href="#features" className="bg-transparent border border-subtle text-white px-8 sm:px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist text-center">
                  Explore Features
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll mt-12 px-4 sm:px-0">
                <div className="bg-[#050505] border border-subtle p-4 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="8" data-suffix="+">8+</span>
                  </div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Data Sources</h3>
                </div>
                <div className="bg-[#050505] border border-subtle p-4 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="99.9" data-suffix="%">99.9%</span>
                  </div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Uptime</h3>
                </div>
                <div className="bg-[#050505] border border-subtle p-4 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">GDPR</div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Compliant</h3>
                </div>
                <div className="bg-[#050505] border border-subtle p-4 sm:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">Real-time</div>
                  <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Enrichment</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Everything You Need to <span className="text-gradient">Find Quality Leads</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">
              Powerful features designed to accelerate your sales pipeline and maximize conversion rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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

      {/* Benefits */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <div className="text-purple-300 font-geist uppercase tracking-widest text-xs mb-4">Benefits</div>
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Why Choose <span className="text-gradient">Client Contact AI</span>
            </h2>
            <p className="text-neutral-400 font-geist">Join leading sales teams who trust us to power their prospecting efforts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((b, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-purple-500/20 p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className={`w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${b.color}`}>
                  <b.Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-space-grotesk text-white mb-3">{b.title}</h3>
                <p className="text-sm text-neutral-400 font-geist">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section id="sources" className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Powered by Premium <span className="text-gradient">Data Sources</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">
              We aggregate and deduplicate data from the world&apos;s leading B2B databases using <span className="text-white font-semibold">official APIs only</span>
            </p>
            <div className="mt-6">
              <Link href="/support" className="text-purple-300 hover:text-purple-200 font-geist text-sm uppercase tracking-widest">
                View API Compliance Documentation →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {dataSources.map((s, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.04 * index}s` }}
              >
                <div className={`w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center mb-3 ${s.color}`}>
                  <s.Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-space-grotesk text-white mb-1">{s.name}</h3>
                <p className="text-sm text-neutral-400 font-geist">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-neutral-400 font-geist">Single plan. No hidden fees.</p>
          </div>

          <div className="flex justify-center max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll max-w-md w-full">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">ClientContact.IO</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $49<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>AI-powered lead search across 8+ data sources</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Email discovery & verification</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>AI lead scoring + advanced filtering</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full"></div>Export to CRM (CSV, Excel, JSON)</li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Free Trial
              </Link>
              <p className="mt-6 text-xs text-neutral-600 font-geist text-center">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 relative z-10 border-t border-subtle bg-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#050505] border border-subtle p-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <h3 className="text-lg font-space-grotesk text-white mb-2">{item.q}</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mb-8 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to Transform Your <span className="text-gradient">Lead Generation?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Join thousands of sales professionals who trust Client Contact AI to power their prospecting efforts
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link href="/signup" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="CLIENTCONTACT.IO" />
    </div>
  );
}
