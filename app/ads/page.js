'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdsLandingPage() {
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
            <Link href="/videosite-ai" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">VideoSite</Link>
            <Link href="/ads" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">Advertise</Link>
            <Link href="/advertiser/login" className="hover:text-white px-3 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">Login</Link>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* SECTION 1: Hero with Video Background       */}
      {/* ============================================ */}
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
            <source src="/videosite-streaming-content.mp4" type="video/mp4" />
            <source src="/social_media_views.mp4" type="video/mp4" />
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
              {/* Brand Tag */}
              <div className="[animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll mb-6">
                <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-space-grotesk uppercase tracking-widest">
                  VIDEOSITE® — Advertiser Platform
                </span>
              </div>

              {/* Main heading */}
              <div className="flex flex-col z-10 w-full items-center justify-center">
                <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter mt-2 mb-4">
                  <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                    Reach Your Audience
                  </span>
                  <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                    Like Never Before
                  </span>
                </h1>
              </div>

              {/* Subheading */}
              <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-300 tracking-tight font-space-grotesk mt-2 mb-8 max-w-3xl px-4">
                Place your video ads in front of engaged viewers. Pay only for qualified views. Brand-safe, transparent, and measurable.
              </h2>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
                <Link
                  href="/advertiser/signup"
                  className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-none text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
                >
                  Get Started
                </Link>
                <a
                  href="#pricing"
                  className="px-8 py-3.5 bg-white/5 border border-subtle hover:bg-white/10 text-white rounded-none text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: Stats Bar                        */}
      {/* ============================================ */}
      <section className="py-16 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 counter-trigger">
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-purple-400 mb-2 tracking-tighter font-space-grotesk font-light">
                <span data-target="10" data-suffix="K+">0</span>
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Monthly Views</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-green-400 mb-2 tracking-tighter font-space-grotesk font-light">
                <span data-target="3.2" data-suffix="%">0</span>
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Avg CTR</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-white mb-2 tracking-tighter font-space-grotesk font-light">
                <span data-prefix="$" data-target="0.05">0</span>
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Starting CPV</h3>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 text-center [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <div className="text-3xl sm:text-4xl text-white mb-2 tracking-tighter font-space-grotesk font-light">
                100%
              </div>
              <h3 className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-geist">Brand Safe</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: Why Advertise on VideoSite       */}
      {/* ============================================ */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-purple-950/10 to-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              Why Advertise on <span className="text-gradient">VideoSite</span>
            </h2>
            <p className="text-lg text-neutral-400 font-geist max-w-2xl mx-auto">
              Stop wasting budget on impressions nobody sees. Pay only for real, qualified engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Engaged Audiences */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Engaged Audiences</h3>
              <p className="text-neutral-400 font-geist text-sm leading-relaxed">
                Viewers on VideoSite actively watch content — not scroll past it. Your ads reach people who are paying attention, not just passing through.
              </p>
            </div>

            {/* Card 2: Pay Per Qualified View */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6 text-green-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Pay Per Qualified View</h3>
              <p className="text-neutral-400 font-geist text-sm leading-relaxed">
                Only pay when a viewer watches 30+ seconds of your ad. No bots, no scrollers, no wasted spend. Every cent goes toward real engagement.
              </p>
            </div>

            {/* Card 3: Real-Time Analytics */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 text-indigo-400 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Real-Time Analytics</h3>
              <p className="text-neutral-400 font-geist text-sm leading-relaxed">
                Track impressions, qualified views, click-throughs, and spend in real time. Full transparency into every dollar of your campaign budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: Pricing Tiers                    */}
      {/* ============================================ */}
      <section id="pricing" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h2>
            <p className="text-lg text-neutral-400 font-geist max-w-2xl mx-auto">
              Choose the tier that fits your goals. No hidden fees. No surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Tier */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-1">
                $0.05
              </div>
              <p className="text-neutral-400 font-geist text-sm mb-6">per qualified view</p>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Minimum $100 budget
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Standard ad placement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Basic category targeting
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Campaign analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Auto-review approval
                </li>
              </ul>
              <Link
                href="/advertiser/signup"
                className="block w-full text-center py-3 bg-white/5 border border-subtle hover:bg-white/10 text-white text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Tier */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Most Popular
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-1">
                $0.10
              </div>
              <p className="text-neutral-400 font-geist text-sm mb-6">per qualified view</p>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Minimum $500 budget
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Priority ad placement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Advanced audience targeting
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Detailed analytics + CTR reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Dedicated support
                </li>
              </ul>
              <Link
                href="/advertiser/signup"
                className="block w-full text-center py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Premium</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-1">
                $0.20
              </div>
              <p className="text-neutral-400 font-geist text-sm mb-6">per qualified view</p>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Minimum $1,000 budget
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Exclusive top-of-feed placement
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Custom audience segments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Full analytics + conversion tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Priority support + account manager
                </li>
              </ul>
              <Link
                href="/advertiser/signup"
                className="block w-full text-center py-3 bg-white/5 border border-subtle hover:bg-white/10 text-white text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: How It Works                     */}
      {/* ============================================ */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-4xl md:text-6xl uppercase mb-6 text-white tracking-tighter font-space-grotesk font-light">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 mx-auto text-purple-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">1</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Create Your Account</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Sign up in 30 seconds. Accept the advertiser agreement and you're ready to launch your first campaign.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 mx-auto text-purple-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">2</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Submit Your Campaign</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Upload your video ad, set your budget, choose a tier, and select targeting options. Our 10-point auto-review approves campaigns instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#050505] border border-subtle p-8 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll text-center">
              <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-6 mx-auto text-purple-400 rounded-full">
                <span className="text-2xl font-space-grotesk font-light">3</span>
              </div>
              <h3 className="text-xl font-space-grotesk text-white mb-3">Watch Results Roll In</h3>
              <p className="text-neutral-400 font-geist text-sm">
                Track impressions, qualified views, clicks, and spend in real time from your advertiser dashboard. Scale what works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: CTA Banner                       */}
      {/* ============================================ */}
      <section className="border-subtle bg-center z-10 border-t pt-24 pb-24 relative bg-gradient-to-b from-purple-950/10 to-black">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-6xl uppercase text-4xl font-light text-white tracking-tighter font-space-grotesk mb-6 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Ready to Reach <span className="text-gradient">Real Viewers?</span>
          </h2>
          <p className="text-lg text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Create your advertiser account and launch your first campaign in minutes.
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link
              href="/advertiser/signup"
              className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold font-space-grotesk uppercase tracking-wider transition-all"
            >
              Create Your Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 7: Footer                           */}
      {/* ============================================ */}
      <footer className="border-t border-subtle py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-neutral-500 font-geist text-xs">
              &copy; {new Date().getFullYear()} AI Lead Strategies LLC. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-neutral-500 hover:text-neutral-300 font-geist text-xs transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-neutral-500 hover:text-neutral-300 font-geist text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link href="/advertiser/login" className="text-neutral-500 hover:text-neutral-300 font-geist text-xs transition-colors">
                Advertiser Login
              </Link>
              <Link href="/videosite-ai" className="text-neutral-500 hover:text-neutral-300 font-geist text-xs transition-colors">
                For Creators
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
