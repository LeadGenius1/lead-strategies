'use client';

import { useEffect, useRef } from 'react';

export default function ClientContactHero() {
  const contentRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.style.opacity = '1';
        contentRef.current.style.transform = 'translateY(0)';
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Video background: handshake.mp4 */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
          <source src="/handshake.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-900/10 to-blue-900/10" />
      </div>

      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl animate-pulse-slower" />

      {/* Hero Content */}
      <div
        ref={contentRef}
        className="relative z-10 container mx-auto px-6 max-w-7xl text-center transition-all duration-1000 ease-out"
        style={{ opacity: 0, transform: 'translateY(20px)' }}
      >
        {/* Purple Badge */}
        <div className="inline-flex items-center gap-2.5 bg-purple-500/15 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2.5 mb-10 shadow-lg shadow-purple-500/10">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.15em] text-purple-200">
            AI-Powered Unified Inbox
          </span>
        </div>

        {/* Main Headline - reduced 15% for readability */}
        <h1 className="mb-6">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white mb-2">
            THE FUTURE OF
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
            LEAD GENERATION
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-slate-200 max-w-5xl mx-auto mb-12 tracking-wide">
          The future of lead generation isn&apos;t about sending more messages
          <span className="block mt-2">
            —it&apos;s about orchestrating smarter conversations across every
          </span>
          <span className="block mt-2">
            channel your buyers use.
          </span>
        </p>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-12 md:gap-20 lg:gap-32 justify-center mb-16">
          <div className="group cursor-default">
            <div className="relative">
              <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-3 transition-all group-hover:scale-110 duration-300">
                22
              </div>
              <div className="absolute inset-0 text-7xl md:text-8xl font-black text-purple-500/20 blur-sm">22</div>
            </div>
            <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-purple-300 transition-colors">
              Channels
            </div>
          </div>
          <div className="group cursor-default">
            <div className="relative">
              <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-3 transition-all group-hover:scale-110 duration-300">
                7
              </div>
              <div className="absolute inset-0 text-7xl md:text-8xl font-black text-purple-500/20 blur-sm">7</div>
            </div>
            <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-purple-300 transition-colors">
              AI Agents
            </div>
          </div>
          <div className="group cursor-default">
            <div className="relative">
              <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-3 transition-all group-hover:scale-110 duration-300">
                1
              </div>
              <div className="absolute inset-0 text-7xl md:text-8xl font-black text-purple-500/20 blur-sm">1</div>
            </div>
            <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-purple-300 transition-colors">
              Platform
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          <a
            href="/signup?product=clientcontact&tier=professional"
            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-purple-600 rounded-xl overflow-hidden shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Start Free Trial</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-purple-700 opacity-0 group-active:opacity-100 transition-opacity duration-100" />
          </a>
          <p className="text-sm text-slate-400 font-medium">
            No credit card required • 14-day free trial • 5 minute setup
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
