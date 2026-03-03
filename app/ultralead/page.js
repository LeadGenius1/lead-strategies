'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO: UltraLead.AI — Autonomous Marketing Engine
function UltraLeadSEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'UltraLead.AI',
    description: 'The next generation of outreach marketing. 7 AI agents that research your market, write your content, find your prospects, and execute across every channel — autonomously. $499/mo.',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/ultralead',
      price: '499',
      priceCurrency: 'USD',
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock'
    }
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does setup take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'About 2 minutes. You fill out a 3-step business profile. Our AI starts learning about your business immediately. First results appear within 15 minutes.'
        }
      },
      {
        '@type': 'Question',
        name: 'Will the AI post without my approval?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Only if you want it to. UltraLead.AI starts in Review Mode — every post, email, and action appears as a draft. You approve before anything goes live. Switch to Auto Mode when you\'re ready.'
        }
      },
      {
        '@type': 'Question',
        name: 'How is this different from ChatGPT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ChatGPT is a writing tool. UltraLead.AI is a complete marketing system. It researches your market, writes content, finds leads, posts to social media, sends emails, monitors competitors, and reports results — all autonomously.'
        }
      },
      {
        '@type': 'Question',
        name: 'What if the AI creates something I don\'t like?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Reject it with one tap. The AI learns from your feedback and adjusts. You can also edit any draft before approving.'
        }
      },
      {
        '@type': 'Question',
        name: 'What channels are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Instagram, Facebook, Twitter/X, LinkedIn, Email, SMS, Landing Pages, and Video. All from one dashboard.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I cancel anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. No contracts. Cancel from your dashboard anytime.'
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>UltraLead.AI — Your AI Marketing Team | $499/mo</h1>
        <p>UltraLead.AI gives you 7 AI agents that research your market, write your content, find your leads, and post to every channel — automatically. $499/month, everything included. 14-day free trial. No credit card required. Contact: support@aileadstrategies.com | (855) 506-8886 | 600 Eagleview Blvd, Suite 317, Exton PA 19341.</p>
      </div>
    </>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-subtle bg-[#050505] transition-colors hover:border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
      >
        <span className="text-sm sm:text-base text-white font-space-grotesk tracking-tight pr-4">{question}</span>
        <span className={`text-neutral-500 text-xl transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5 sm:pb-6' : 'max-h-0'}`}>
        <p className="px-5 sm:px-6 text-sm text-neutral-400 font-geist leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function UltraLeadPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate');
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

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
    document.querySelectorAll('.counter-trigger').forEach((el) => counterObserver.observe(el));

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
      <UltraLeadSEO />
      <div className="relative overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-2 sm:px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
          <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-1.5 sm:p-2 shadow-2xl backdrop-blur-xl gap-x-1 items-center justify-between">
            <Link href="/" className="bg-white/5 hover:bg-white/10 px-3 sm:px-5 py-2 text-[10px] sm:text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
              AI LEAD
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/leadsite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.AI</Link>
              <Link href="/leadsite-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">LeadSite.IO</Link>
              <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">ClientContact</Link>
            </div>
            <div className="px-2 sm:px-6 text-lg sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]" aria-hidden="true" />
              ULTRALEAD
            </div>
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">VideoSite</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
              <source src="/office-bldg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
          </div>
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <div className="grid-overlay">
              <div className="grid-inner">
                <div className="grid-line-v" />
                <div className="grid-line-v hidden md:block" />
                <div className="grid-line-v hidden lg:block" />
                <div className="grid-line-v" />
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
              <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  7 AI AGENTS &bull; EVERY CHANNEL &bull; ONE DASHBOARD
                </div>

                <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter mt-2 mb-4 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
                  <span className="tracking-tighter font-space-grotesk font-light block">The Next Generation</span>
                  <span className="tracking-tighter font-space-grotesk font-light block">of Outreach Marketing</span>
                  <span className="text-gradient font-light tracking-tighter font-space-grotesk block">Is Here.</span>
                </h1>

                <p className="[animation:animationIn_0.8s_ease-out_0.35s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-400 tracking-tight font-space-grotesk mt-2 mb-8 max-w-2xl px-4 leading-relaxed">
                  This isn&apos;t another lead finder. UltraLead.AI is an autonomous marketing engine — it researches your market, builds your strategy, writes your content, finds your prospects, and executes across every channel. You just approve.
                </p>

                <div className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
                  <Link href="/signup?tier=ultralead" className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase font-geist transition-colors">
                    Start Free — 14 Day Trial
                  </Link>
                  <p className="text-neutral-600 text-xs font-geist mt-3 tracking-wide">No credit card required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase mb-8 text-white tracking-tighter font-space-grotesk font-light">
                Lead Finders Give You Names. <span className="text-neutral-600">We Give You Revenue.</span>
              </h2>
            </div>
            <div className="space-y-6 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-geist leading-relaxed">
                Every platform out there does the same thing — scrapes a database, hands you a spreadsheet of emails, and wishes you luck. Then what?
              </p>
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-geist leading-relaxed">
                You still have to write the emails. Still have to create the social posts. Still have to build the landing pages, monitor competitors, warm up your sender accounts, and figure out what&apos;s actually working. You&apos;re paying for leads and doing all the labor yourself.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-geist leading-relaxed">
                Meanwhile, your competitors are everywhere — showing up in feeds, ranking on Google, closing the deals that should be yours.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-white font-space-grotesk tracking-tight">
                This is the difference between a tool and a team.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section — 3-Step Flow */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-4xl sm:text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Not a Tool. <span className="text-gradient">An Autonomous Marketing Engine.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              {/* Step 1 */}
              <div className="bg-[#050505] border border-subtle p-8 relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center mb-6">
                  <Icons.Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="px-2 py-0.5 border border-purple-900/30 bg-purple-900/10 text-purple-400 text-[10px] uppercase tracking-wider font-geist inline-block mb-4">
                  2 minutes
                </div>
                <h3 className="text-xl text-white mb-3 tracking-tight font-space-grotesk">Tell Us About Your Business</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Fill out a simple profile — your business, your customers, your competitors, your budget. That&apos;s it. Our AI immediately starts learning everything about your market.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#050505] border border-subtle p-8 relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center mb-6">
                  <Icons.TrendingUp className="w-5 h-5 text-sky-400" />
                </div>
                <div className="px-2 py-0.5 border border-sky-900/30 bg-sky-900/10 text-sky-400 text-[10px] uppercase tracking-wider font-geist inline-block mb-4">
                  Real-time
                </div>
                <h3 className="text-xl text-white mb-3 tracking-tight font-space-grotesk">Watch Your AI Team Go to Work</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Within minutes, your live strategy feed lights up. AI agents are scanning competitors, drafting social posts, finding prospects, and building your marketing strategy. Everything happens in real-time — you can watch it unfold.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#050505] border border-subtle p-8 relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center mb-6">
                  <Icons.Grid className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="px-2 py-0.5 border border-emerald-900/30 bg-emerald-900/10 text-emerald-400 text-[10px] uppercase tracking-wider font-geist inline-block mb-4">
                  One tap
                </div>
                <h3 className="text-xl text-white mb-3 tracking-tight font-space-grotesk">Approve and Go</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Review what the AI created. Like the Instagram post? Tap Approve — it&apos;s posted. Like the email campaign? Tap Approve — it&apos;s sent. Want to go fully autonomous? Turn on auto-mode and let the AI handle everything.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section — 7 AI Agents + Capabilities */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-4xl sm:text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                7 AI Agents. <span className="text-neutral-600">Zero Busywork.</span>
              </h2>
            </div>

            {/* Live Strategy Feed */}
            <div className="mb-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.25s_both]">
              <div className="bg-[#050505] border border-subtle p-8 sm:p-10 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                    <Icons.TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl text-white tracking-tight font-space-grotesk">Live Strategy Feed</h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-400 font-geist leading-relaxed max-w-3xl">
                  Your marketing command center. Every action your AI agents take appears in a real-time feed — competitor insights, content drafts, new prospects, performance reports. No more checking 5 different dashboards.
                </p>
              </div>
            </div>

            {/* 7 AI Agents Grid */}
            <div className="mb-12">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-6 text-center animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">7 AI Agents Working Daily</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.35s_both]">
                {[
                  { icon: '🔍', name: 'Competitor Watch', desc: 'Scans your competitors every morning for new content, pricing changes, and opportunities they\'re missing' },
                  { icon: '✍️', name: 'Content Generator', desc: 'Writes Instagram posts, Facebook updates, email campaigns, and SMS messages in your brand\'s voice' },
                  { icon: '🎯', name: 'Prospect Finder', desc: 'Identifies businesses and people matching your ideal customer profile, scored and ready for outreach' },
                  { icon: '📧', name: 'Sender Health', desc: 'Keeps your email accounts healthy with automatic warmup and deliverability monitoring' },
                  { icon: '🔄', name: 'Strategy Refresh', desc: 'Rebuilds your complete go-to-market strategy every week with the latest market data' },
                  { icon: '📊', name: 'Performance Report', desc: 'Weekly reports showing what worked, what didn\'t, and what to do next' },
                  { icon: '📡', name: 'Market Intel', desc: 'Tracks industry trends, news, and shifts so your strategy stays current' },
                ].map((agent) => (
                  <div key={agent.name} className="bg-[#050505] border border-subtle p-5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg">{agent.icon}</span>
                      <h4 className="text-sm text-white font-space-grotesk tracking-tight">{agent.name}</h4>
                    </div>
                    <p className="text-xs text-neutral-500 font-geist leading-relaxed">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Capabilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.4s_both]">
              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 hover:border-white/10 transition-colors">
                <h3 className="text-lg text-white mb-3 tracking-tight font-space-grotesk">One-Click Execution</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Approve a post — it&apos;s on Instagram. Approve leads — they&apos;re in your email campaign. Approve a landing page — it&apos;s live on your website. One button between &ldquo;AI recommended&rdquo; and &ldquo;done.&rdquo;
                </p>
              </div>
              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 hover:border-white/10 transition-colors">
                <h3 className="text-lg text-white mb-3 tracking-tight font-space-grotesk">Every Channel, One Place</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Instagram, Facebook, Twitter, LinkedIn, Email, SMS, Landing Pages, Video — all managed from one feed. Create once, publish everywhere.
                </p>
              </div>
              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 hover:border-white/10 transition-colors">
                <h3 className="text-lg text-white mb-3 tracking-tight font-space-grotesk">Your Level of Control</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  <span className="text-white">Review Mode (default):</span> AI creates, you approve. <span className="text-white">Auto Mode:</span> AI creates AND publishes. Fully autonomous. <span className="text-white">Manual Mode:</span> AI recommends, you decide.
                </p>
              </div>
              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 hover:border-white/10 transition-colors">
                <h3 className="text-lg text-white mb-3 tracking-tight font-space-grotesk">AI Assistant</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">
                  Talk to your AI like a business partner. Ask &ldquo;What&apos;s working best?&rdquo; or say &ldquo;Focus on Instagram this week.&rdquo; Get strategy advice backed by your actual performance data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Competitor Comparison Section */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-4xl sm:text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Replace Your Entire <span className="text-neutral-600">Marketing Stack</span>
              </h2>
            </div>

            <div className="animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              <div className="bg-[#050505] border border-subtle overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 border-b border-subtle">
                  <div className="p-4 sm:p-5 text-xs uppercase tracking-widest text-neutral-500 font-geist">Feature</div>
                  <div className="p-4 sm:p-5 text-xs uppercase tracking-widest text-neutral-500 font-geist text-center border-x border-subtle">Others</div>
                  <div className="p-4 sm:p-5 text-xs uppercase tracking-widest text-purple-400 font-geist text-center">UltraLead.AI</div>
                </div>
                {/* Table Rows */}
                {[
                  { feature: 'Email Marketing', other: 'Mailchimp' },
                  { feature: 'Social Posting', other: 'Hootsuite' },
                  { feature: 'AI Content', other: 'Jasper' },
                  { feature: 'Lead Prospecting', other: 'HubSpot' },
                  { feature: 'Competitor Monitoring', other: 'SEMrush' },
                  { feature: 'Landing Pages', other: 'Unbounce' },
                  { feature: 'SMS Campaigns', other: '—' },
                  { feature: 'Autonomous Execution', other: 'Nobody' },
                ].map((row, i) => (
                  <div key={row.feature} className={`grid grid-cols-3 ${i < 7 ? 'border-b border-subtle' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <div className="p-4 sm:p-5 text-sm text-neutral-300 font-geist">{row.feature}</div>
                    <div className="p-4 sm:p-5 text-sm text-neutral-600 font-geist text-center border-x border-subtle">{row.other}</div>
                    <div className="p-4 sm:p-5 text-sm text-emerald-400 font-geist text-center">Built in</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Anchor */}
            <div className="text-center mt-8 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.4s_both]">
              <p className="text-neutral-400 font-geist text-sm sm:text-base">
                Those 6 tools = <span className="text-white">$800+/month</span>. UltraLead.AI = <span className="text-purple-400">$499/month</span>.
              </p>
              <p className="text-neutral-500 font-geist text-sm mt-1">And the AI does the work — not you.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 counter-trigger animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Grid className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="7">7</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">AI Agents</h3>
                  <p className="text-[10px] text-neutral-600 font-geist mt-1">Working 24/7</p>
                </div>
              </div>

              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Users className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="5">5</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Platforms</h3>
                  <p className="text-[10px] text-neutral-600 font-geist mt-1">All integrated</p>
                </div>
              </div>

              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="400" data-prefix="+" data-suffix="%">+400%</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">ROI</h3>
                  <p className="text-[10px] text-neutral-600 font-geist mt-1">Average return</p>
                </div>
              </div>

              <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
                <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">04</div>
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                    <span data-target="2">2</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Minutes</h3>
                  <p className="text-[10px] text-neutral-600 font-geist mt-1">Setup time</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              <p className="text-neutral-500 font-geist text-sm">
                Built for home services, real estate, fitness, e-commerce, and professional services businesses.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="text-center mb-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-4xl sm:text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                One Platform. One Price. <span className="text-gradient">Everything Included.</span>
              </h2>
            </div>

            <div className="animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              <div className="bg-[#050505] border border-purple-500/30 p-8 sm:p-10 relative shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                <div className="text-center mb-8">
                  <div className="text-6xl sm:text-7xl text-white tracking-tighter font-space-grotesk font-light mb-2">
                    $499
                  </div>
                  <p className="text-neutral-500 font-geist text-sm">/month — everything included</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    'All 7 AI agents active 24/7',
                    'Every channel: Instagram, Facebook, Twitter, LinkedIn, Email, SMS, Landing Pages, Video',
                    'Review + Auto modes',
                    'Unlimited prospects',
                    'Weekly strategy refresh + performance reports',
                    'AI Assistant co-founder chat',
                    'Competitor monitoring daily',
                    'Full execution layer (approve → posted/sent/created)',
                    'Priority support',
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-neutral-300 font-geist">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">&#10003;</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-xs text-neutral-600 font-geist mb-6">
                  No hidden fees. No add-ons. No per-seat pricing.
                </p>

                <div className="text-center">
                  <Link href="/signup?tier=ultralead" className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase font-geist transition-colors w-full sm:w-auto">
                    Start Your 14-Day Free Trial
                  </Link>
                  <p className="text-neutral-600 text-xs font-geist mt-3">No credit card required. Cancel anytime.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.4s_both]">
              <p className="text-neutral-400 font-geist text-sm sm:text-base leading-relaxed">
                A junior marketing hire: <span className="text-white">$4,000/month</span>. A marketing agency: <span className="text-white">$3,000–$10,000/month</span>.
                <br />UltraLead.AI: your entire AI marketing team for <span className="text-purple-400">$499/month</span>.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 relative z-10 border-t border-subtle bg-black">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.2s_both]">
              <h2 className="text-4xl sm:text-5xl md:text-6xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
                Questions? <span className="text-neutral-600">Answers.</span>
              </h2>
            </div>

            <div className="space-y-2 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.3s_both]">
              <FAQItem
                question="How long does setup take?"
                answer="About 2 minutes. You fill out a 3-step business profile. Our AI starts learning about your business immediately. First results appear within 15 minutes."
              />
              <FAQItem
                question="Will the AI post without my approval?"
                answer="Only if you want it to. UltraLead.AI starts in Review Mode — every post, email, and action appears as a draft. You approve before anything goes live. Switch to Auto Mode when you're ready."
              />
              <FAQItem
                question="How is this different from ChatGPT?"
                answer="ChatGPT is a writing tool. UltraLead.AI is a complete marketing system. It researches your market, writes content, finds leads, posts to social media, sends emails, monitors competitors, and reports results — all autonomously."
              />
              <FAQItem
                question="What if the AI creates something I don't like?"
                answer="Reject it with one tap. The AI learns from your feedback and adjusts. You can also edit any draft before approving."
              />
              <FAQItem
                question="What channels are supported?"
                answer="Instagram, Facebook, Twitter/X, LinkedIn, Email, SMS, Landing Pages, and Video. All from one dashboard."
              />
              <FAQItem
                question="Can I cancel anytime?"
                answer="Yes. No contracts. Cancel from your dashboard anytime."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="md:text-6xl uppercase text-3xl sm:text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6">
              This Is the Future of Outreach Marketing. <span className="text-gradient">And It&apos;s Already Here.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-geist max-w-2xl mx-auto mb-4 leading-relaxed">
              The businesses that adopt it now will own their markets. The ones that wait will wonder what happened.
            </p>
            <p className="text-sm sm:text-base text-neutral-500 font-geist max-w-xl mx-auto mb-8">
              Set up takes 2 minutes. Your first AI-generated strategy is ready in 15. Your marketing never stops — even while you sleep.
            </p>
            <Link href="/signup?tier=ultralead" className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase font-geist transition-colors">
              Start Free — See It Work in 15 Minutes →
            </Link>
          </div>
        </section>

        <Footer brandName="ULTRALEAD" />
      </div>
    </>
  );
}
