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
      price: '79',
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
      { '@type': 'Question', name: 'What is TackleAI?', acceptedAnswer: { '@type': 'Answer', text: 'TackleAI is a comprehensive AI sales CRM that combines full pipeline management, up to 7 self-healing AI agents, and 22-channel outreach. Plans start at $79/month and scale to enterprise.' } },
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
        <p>TackleAI is the future of outreach marketing by AI Lead Strategies LLC. Plans start at $79/month and scale to $1,497/month for enterprise. Features: Full CRM with pipeline management, up to 7 self-healing AI agents (Campaign AI, Social Syncs AI, Voice AI, LeadGen AI, Analytics AI, Integration AI, CleanOS AI), 22-channel omnichannel outreach (LinkedIn, Email, SMS, WhatsApp, social media), AI prospect scraping, automated personalized email writing, follow-up tracking, voice calling with transcription, meeting scheduler, team collaboration, revenue forecasting. Wake up every morning with an inbox full of warmed-up, perfectly targeted leads. Stop the manual hustle and put your sales floor on intelligent autopilot. Best for B2B sales teams wanting to scale beyond manual outreach. Alternatives: HubSpot, Salesforce, Outreach.io, Salesloft. Contact: support@aileadstrategies.com | (855) 506-8886</p>
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

      {/* What It Does (Simple) */}
      <section id="features" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              What It Does <span className="text-gradient">(Simple)</span>
            </h2>
            <p className="text-xl md:text-2xl text-neutral-300 font-geist max-w-4xl mx-auto leading-relaxed">
              Stop paying for 10 different tools that don't talk to each other. Tackle.AI gives you everything—email campaigns, website builder, 22-channel inbox, voice calling, CRM, and 7 AI agents—in one powerful platform.
            </p>
          </div>
        </div>
      </section>

      {/* The Tool Stack Problem */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              The Tool Stack <span className="text-gradient">Problem</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">Here's what you're probably paying for right now:</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Email marketing tool (Mailchimp/SendGrid)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$50-200/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Website builder (Wix/Squarespace)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$20-50/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Unified inbox (Intercom/Zendesk)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$100-300/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Voice calling (Twilio/RingCentral)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$50-150/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">CRM (HubSpot/Salesforce)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$50-300/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">AI writing tools (Jasper/Copy.ai)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$50-200/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Scheduling (Calendly/Acuity)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$15-50/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Analytics (Mixpanel/Amplitude)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$50-200/mo</span>
                </div>
                <div className="flex justify-between items-center border-b border-subtle pb-4">
                  <span className="text-neutral-300 font-geist text-lg">Lead generation (Apollo/ZoomInfo)</span>
                  <span className="text-red-400 font-space-grotesk text-lg">$100-500/mo</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-2xl font-space-grotesk text-white font-semibold">Total Monthly Cost</span>
                  <span className="text-3xl text-red-400 font-space-grotesk font-semibold">$485-2,100/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              What's <span className="text-gradient">Included</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">Everything you need in one platform</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-[#050505] border border-subtle overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtle">
                    <th className="text-left p-6 text-white font-space-grotesk text-lg">Feature</th>
                    <th className="text-center p-6 text-white font-space-grotesk text-lg">Tackle.AI</th>
                    <th className="text-center p-6 text-neutral-500 font-space-grotesk text-lg">Other Tools</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Email Campaigns</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Separate tool</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Website Builder</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Separate tool</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">22-Channel Inbox</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Separate tool</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Voice Calling</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Separate tool</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Full CRM</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Separate tool</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">7 AI Agents</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">Not included</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-neutral-300 font-geist">All Integrated</td>
                    <td className="p-6 text-center"><Icons.Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="p-6 text-center text-neutral-500 font-geist">No integration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Your 7 AI Agents */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Your <span className="text-gradient">7 AI Agents</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">Intelligent automation that works 24/7</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Lead Hunter</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Researcher</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Copywriter</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Caller</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Scheduler</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Follow-Up Agent</span>
                </li>
                <li className="flex items-center gap-4">
                  <Icons.Check className="w-6 h-6 text-purple-500 flex-shrink-0" />
                  <span className="text-xl text-white font-space-grotesk">Analyst</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Bottom Line */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              The Bottom <span className="text-gradient">Line</span>
            </h2>
            <p className="text-neutral-400 font-geist max-w-3xl mx-auto">See the difference</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-[#050505] border border-subtle overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtle">
                    <th className="text-left p-6 text-white font-space-grotesk text-lg">Comparison</th>
                    <th className="text-center p-6 text-white font-space-grotesk text-lg">Tackle.AI</th>
                    <th className="text-center p-6 text-neutral-500 font-space-grotesk text-lg">10 Separate Tools</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Monthly Cost</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk text-lg font-semibold">$79-1,497</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk text-lg font-semibold">$485-2,100</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Number of Logins</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk">1</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk">10+</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Data Integration</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk">Automatic</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk">Manual/None</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">AI Agents</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk">7 Included</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk">Not Included</td>
                  </tr>
                  <tr className="border-b border-subtle">
                    <td className="p-6 text-neutral-300 font-geist">Support</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk">One Team</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk">10 Different Teams</td>
                  </tr>
                  <tr>
                    <td className="p-6 text-neutral-300 font-geist">Setup Time</td>
                    <td className="p-6 text-center text-green-400 font-space-grotesk">Minutes</td>
                    <td className="p-6 text-center text-red-400 font-space-grotesk">Weeks</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
            <p className="text-neutral-400 font-geist">Scale from startup to enterprise. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* Starter Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $79<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Full CRM features</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>2 AI agents active</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>2,500 contacts</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>5 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Email & SMS campaigns</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=tackle&tier=starter">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Professional Tier - Most Popular */}
            <div className="bg-gradient-to-br from-purple-950/30 to-[#050505] border-2 border-purple-500 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.35s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500 text-white text-[10px] uppercase tracking-wider font-geist">Most Popular</div>
              <h3 className="text-xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $299<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Full CRM features</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>5 AI agents active</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>10,000 contacts</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>15 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>API access</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=tackle&tier=professional">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Business Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Business</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $699<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>All 7 AI agents</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>50,000 contacts</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>50 team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Custom integrations</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Priority support</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=tackle&tier=business">Start Trial</ShinyButton>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-6 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.45s_both] animate-on-scroll">
              <h3 className="text-xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-space-grotesk font-light text-white mb-4">
                $1,497<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-2 font-geist text-xs text-neutral-300 mb-6">
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>All 7 AI agents (unlimited)</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited contacts</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Unlimited team seats</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>White-label options</li>
                <li className="flex items-start gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full mt-1.5"></div>Dedicated manager</li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?product=tackle&tier=enterprise">Contact Sales</ShinyButton>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-neutral-600 font-geist text-center">14-day free trial on all plans • No credit card required • Cancel anytime</p>
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
