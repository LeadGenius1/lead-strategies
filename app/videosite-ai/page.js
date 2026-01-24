'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

// SEO Component for VideoSite.AI
function VideoSiteAISEO() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'VideoSite.AI',
    description: 'Free video monetization platform where content creators earn $1 per video view',
    brand: { '@type': 'Brand', name: 'AI Lead Strategies' },
    offers: {
      '@type': 'Offer',
      url: 'https://aileadstrategies.com/videosite-ai',
      price: '99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '2341' }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is VideoSite.AI?', acceptedAnswer: { '@type': 'Answer', text: 'VideoSite.AI is a FREE video monetization platform where content creators can upload videos and earn $1.00 for every video viewer.' } },
      { '@type': 'Question', name: 'What does VideoSite.AI cost?', acceptedAnswer: { '@type': 'Answer', text: 'VideoSite.AI is FREE to sign up. Content creators earn $1.00 per video viewer through the platform - no subscription fees required.' } },
      { '@type': 'Question', name: 'How do advertisers use VideoSite.AI?', acceptedAnswer: { '@type': 'Answer', text: 'Advertisers can place targeted video ads on the platform, reaching engaged audiences with brand-safe content and detailed analytics.' } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="sr-only" aria-hidden="true">
        <h1>VideoSite.AI - Free Video Monetization Platform</h1>
        <p>VideoSite.AI is a FREE video monetization platform by AI Lead Strategies LLC. Content creators sign up for free and earn $1.00 per video viewer. Features: HD video hosting, video marketing campaigns, lead generation tools, analytics dashboard, content protection, secure payments. Best for content creators wanting to monetize their videos. Alternatives: YouTube, Vimeo, Wistia. Contact: support@aileadstrategies.com | (855) 506-8886</p>
        <h2>VideoSite.AI Features</h2>
        <ul>
          <li>Free for content creators</li>
          <li>Earn $1 per video view</li>
          <li>HD video hosting</li>
          <li>Advertiser marketplace</li>
          <li>Analytics dashboard</li>
        </ul>
      </div>
    </>
  );
}

export default function VideoSiteAIPage() {
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

  const testimonials = [
    {
      quote: "VIDEOSITE® has transformed how I monetize my content. The revenue split is fair and payouts are reliable.",
      name: "Sarah Johnson",
      role: "Content Creator"
    },
    {
      quote: "Best advertising platform I've used. The targeting options and analytics are outstanding.",
      name: "Michael Chen",
      role: "Digital Marketer"
    },
    {
      quote: "Finally, a platform that puts creators first. The interface is intuitive and support is excellent.",
      name: "Emma Davis",
      role: "YouTuber"
    },
    {
      quote: "Our campaigns on VideoSite.io consistently outperform other platforms. Highly recommend!",
      name: "James Wilson",
      role: "Brand Manager"
    }
  ];

  const trustedBrands = ['TechFlow', 'Nexus Labs', 'DataSync', 'VisionCorp', 'CloudBase', 'Innovate'];

  return (
    <>
      <VideoSiteAISEO />
      <div className="relative overflow-x-hidden">
      {/* Grid Background (below hero) */}
      <div className="grid-overlay hidden">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

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
            <span className="hidden sm:inline">VIDEO</span>SITE®
          </div>

          <div className="hidden lg:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              ClientContact
            </Link>
            <Link href="/tackle-io" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              TackleAI
            </Link>
            <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
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
            poster="/social_media_views_poster.jpg"
          >
            {/* Primary: social_media_views converted to mp4 for browser compatibility */}
            <source src="/social_media_views.mp4" type="video/mp4" />
            {/* Fallback: meeting-handshake */}
            <source src="/meeting-handshake.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/70"></div>
          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
            <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
              {/* Brand Tag - reduced by 20% */}
              <div className="[animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll mb-6">
                <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-space-grotesk uppercase tracking-widest">
                  VIDEOSITE® — Next-Gen Video Monetization
                </span>
              </div>

              {/* Main heading - reduced by 20%: 4xl→3xl, 5xl→4xl, 7xl→6xl, 9xl→7xl */}
              <div className="flex flex-col z-10 w-full items-center justify-center">
                <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-4 md:gap-y-5 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter mt-4 mb-6">
                  <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                    Monetize Your Videos
                  </span>
                  <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                    Like Never Before
                  </span>
                </h1>
              </div>

              {/* Subheading - reduced by 20%: base→sm, lg→base, 2xl→xl, 3xl→2xl */}
              <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-sm sm:text-base md:text-xl lg:text-2xl text-neutral-300 tracking-tight font-space-grotesk mt-4 mb-6 max-w-3xl px-4">
                The premier platform connecting content creators with advertisers. Earn $1.00 per view while advertisers reach their perfect audience.
              </h2>

              {/* Trusted By - reduced spacing */}
              <div className="mt-12 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist mb-4">Trusted by creators worldwide</p>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                  {trustedBrands.map((brand, index) => (
                    <span key={index} className="text-neutral-400 font-space-grotesk text-xs sm:text-sm">{brand}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What It Does (Simple) Section */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              What It Does <span className="text-gradient">(Simple)</span>
            </h2>
            <p className="text-lg md:text-xl text-neutral-300 font-geist leading-relaxed max-w-3xl mx-auto">
              You create videos. People watch them. You should get paid. VideoSite.AI pays you $1.00 per view—delivered straight to your bank via Stripe. No complicated partner programs. No waiting months for payment.
            </p>
          </div>
        </div>
      </section>

      {/* The Math Is Simple Section */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              The Math Is <span className="text-gradient">Simple</span>
            </h2>
          </div>

          <div className="overflow-x-auto [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <table className="w-full border-collapse bg-[#050505] border border-subtle">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="p-4 text-left text-white font-space-grotesk uppercase tracking-wider text-sm">Platform</th>
                  <th className="p-4 text-center text-white font-space-grotesk uppercase tracking-wider text-sm">Earnings per 1,000 Views</th>
                  <th className="p-4 text-center text-white font-space-grotesk uppercase tracking-wider text-sm">Payment Terms</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-subtle/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-neutral-300 font-geist">YouTube</td>
                  <td className="p-4 text-center text-neutral-300 font-geist">$0.50 - $5.00</td>
                  <td className="p-4 text-center text-neutral-400 font-geist text-sm">Monthly (after threshold)</td>
                </tr>
                <tr className="border-b border-subtle/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-neutral-300 font-geist">TikTok</td>
                  <td className="p-4 text-center text-neutral-300 font-geist">$0.20 - $2.00</td>
                  <td className="p-4 text-center text-neutral-400 font-geist text-sm">Monthly (after threshold)</td>
                </tr>
                <tr className="border-b border-subtle/50 hover:bg-green-500/10 transition-colors">
                  <td className="p-4 text-green-400 font-geist font-semibold">VideoSite.AI</td>
                  <td className="p-4 text-center text-green-400 font-geist font-semibold">$1,000.00</td>
                  <td className="p-4 text-center text-green-400 font-geist text-sm font-semibold">Instant via Stripe</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#050505] border border-subtle p-8 hover:border-green-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 mx-auto text-green-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">1</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Upload Your Videos</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Upload your content in HD quality. No limits, no restrictions.
              </p>
            </div>

            <div className="bg-[#050505] border border-subtle p-8 hover:border-green-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 mx-auto text-green-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">2</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Connect Stripe</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Link your Stripe account in seconds. Secure and verified.
              </p>
            </div>

            <div className="bg-[#050505] border border-subtle p-8 hover:border-green-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 mx-auto text-green-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">3</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Share Your Links</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Get unique links for each video. Share anywhere, anytime.
              </p>
            </div>

            <div className="bg-[#050505] border border-subtle p-8 hover:border-green-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 mx-auto text-green-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">4</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Get Paid</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Earn $1.00 per view. Payments sent directly to your bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Creators Love VideoSite.AI Section */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              Why Creators Love <span className="text-gradient">VideoSite.AI</span>
            </h2>
          </div>

          <div className="bg-[#050505] border border-subtle p-8 md:p-12 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <ul className="space-y-4 font-geist text-neutral-300">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">No complicated partner programs or approval processes</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Instant payouts—no waiting months for payment</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Transparent $1.00 per view—no hidden fees or revenue splits</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Direct bank deposits via Stripe—you control your money</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Free to use—no subscription fees or hidden costs</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">HD video hosting with unlimited uploads</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* For Advertisers Section */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              For <span className="text-gradient">Advertisers</span>
            </h2>
          </div>

          <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 md:p-12 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <p className="text-lg md:text-xl text-neutral-300 font-geist mb-6 leading-relaxed">
              Reach engaged audiences with targeted video ads. VideoSite.AI connects advertisers with content creators, delivering brand-safe placements and detailed analytics.
            </p>
            <ul className="space-y-4 font-geist text-neutral-300">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Flexible pricing tiers from $20-75 CPM</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Advanced targeting options for your ideal audience</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Real-time campaign analytics and performance tracking</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-base md:text-lg">Brand-safe content with verified creators</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Start <span className="text-gradient">Free</span>
            </h2>
            <p className="text-neutral-400 font-geist">Free to sign up. Earn $1.00 per video viewer.</p>
          </div>

          <div className="flex justify-center max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-green-950/20 to-[#050505] border border-green-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll max-w-md w-full">
              <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-[10px] uppercase tracking-wider font-geist">
                Content Creators
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-2">VideoSite.AI</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-2">
                FREE
              </div>
              <p className="text-green-400 font-geist text-lg mb-6">Earn $1.00 per Video Viewer</p>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  HD video hosting
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Monetize your content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Real-time earnings dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Instant payouts
                </li>
              </ul>
              <div className="text-center">
                <ShinyButton href="/signup?tier=videosite">
                  Start Free Trial
                </ShinyButton>
              </div>
              <p className="mt-6 text-xs text-neutral-600 font-geist text-center">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 counter-trigger">
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-green-400 mb-2 tracking-tighter font-space-grotesk font-light">
                $1.00
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Per View Payout</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-white mb-2 tracking-tighter font-space-grotesk font-light">
                $20-75
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">CPM Range</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-white mb-2 tracking-tighter font-space-grotesk font-light">
                <span data-target="10" data-suffix="K+">10K+</span>
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Active Creators</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-white mb-2 tracking-tighter font-space-grotesk font-light">
                24/7
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Support</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative bg-gradient-to-b from-purple-950/10 to-black">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-6xl uppercase text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to Get <span className="text-gradient">Started?</span>
          </h2>
          <p className="text-lg text-neutral-400 font-geist [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Join thousands of creators and advertisers already using VideoSite.AI to monetize content.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer brandName="VIDEOSITE®" />
    </div>
    </>
  );
}
