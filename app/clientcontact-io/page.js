'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';
import ClientContactHero from '@/components/ClientContact/Hero';

// SEO: ClientContact.IO - AI-Powered Unified Inbox
function ClientContactIOSEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ClientContact.IO',
    description: 'AI-Powered Unified Inbox. 22+ channels, 7 AI agents, 1 platform. The future of lead generation.',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/clientcontact-io',
      price: '99',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '612' }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is ClientContact.IO?', acceptedAnswer: { '@type': 'Answer', text: 'ClientContact.IO is an AI-powered unified inbox and CRM that orchestrates smarter conversations across 22+ channels with 7 AI agents. Plans from $99/mo.' } },
      { '@type': 'Question', name: 'How many channels does ClientContact support?', acceptedAnswer: { '@type': 'Answer', text: 'ClientContact.IO supports 22+ outreach channels including Email, LinkedIn, SMS, WhatsApp, and social platforms.' } },
      { '@type': 'Question', name: 'What are the 7 AI agents?', acceptedAnswer: { '@type': 'Answer', text: 'Campaign AI, Social Syncs AI, Voice AI, LeadGen AI, Analytics AI, Integration AI, and CleanOS AI—all self-healing agents.' } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>ClientContact.IO - AI-Powered Unified Inbox | 22+ Channels, 7 AI Agents</h1>
        <p>The future of lead generation. Orchestrate smarter conversations across every channel your buyers use. 22 channels, 7 AI agents, 1 platform. Start free trial. Contact: support@aileadstrategies.com | (855) 506-8886</p>
        <h2>ClientContact.IO Features</h2>
        <ul>
          <li>22+ channel unified inbox</li>
          <li>7 self-healing AI agents</li>
          <li>Full CRM and pipeline</li>
          <li>Voice calling and transcription</li>
          <li>Team collaboration</li>
        </ul>
      </div>
    </>
  );
}

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
    <>
      <ClientContactIOSEO />
      <div className="relative overflow-x-hidden">
      {/* Navigation: AI LEAD | LEADSITE.AI | LEADSITE.IO | ● CLIENTCONTACT.IO | VIDEOSITE */}
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
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true" />
            CLIENTCONTACT.IO
          </div>
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              VideoSite
            </Link>
          </div>
        </div>
      </nav>

      <ClientContactHero />

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
            <p className="text-neutral-400 font-geist">Scale as you grow. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Starter Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $49<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>22+ channel inbox</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>AI auto-responder</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited campaigns</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>3 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Sentiment analysis</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=clientcontact&tier=starter">Start Trial</ShinyButton>
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
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Everything in Starter</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>10 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Advanced analytics</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Custom workflows</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>API access</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=clientcontact&tier=professional">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Business Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Business</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $349<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Everything in Pro</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>25 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Success manager</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>SLA guarantees</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Custom integrations</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=clientcontact&tier=business">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.45s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $799<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Everything in Business</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>White-label options</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Advanced security</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>99.9% uptime SLA</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=clientcontact&tier=enterprise">Contact Sales</ShinyButton>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-neutral-600 font-geist text-center">14-day free trial on all plans • No credit card required • Cancel anytime</p>
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
            Ready to Unify Your <span className="text-gradient">Customer Communications?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Join teams who trust ClientContact.IO to bring all their messages into one simple inbox
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link href="/signup?tier=clientcontact-io" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="CLIENTCONTACT.IO" />
    </div>
    </>
  );
}
