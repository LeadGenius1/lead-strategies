'use client';

import { useEffect } from 'react';
import { Icons } from '@/components/Icons';
import ShinyButton from '@/components/ShinyButton';

export default function ClientContactHero() {
  useEffect(() => {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      );
      observer.observe(el);
    });
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background - AETHER UI */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
          <source src="/handshake.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </div>

      {/* Grid Background (over video) - AETHER UI */}
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

      {/* Hero Content - AETHER UI structure */}
      <div className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-36">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative max-w-7xl">
          <div className="flex flex-col text-center mb-16 sm:mb-24 relative items-center justify-center">
            {/* Badge - AETHER style */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] sm:text-xs font-medium tracking-wide mb-8 [animation:animationIn_0.8s_ease-out_0.15s_both] animate-on-scroll">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              AI-POWERED UNIFIED INBOX
            </div>

            {/* Main Headline - font-space-grotesk, text-gradient on second line */}
            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[1.1] sm:leading-[1.0] flex flex-col justify-center gap-y-2 sm:gap-y-3 md:gap-y-4 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter mt-2 mb-4">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light block">
                  THE FUTURE OF
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk block">
                  LEAD GENERATION
                </span>
              </h1>
            </div>

            {/* Subheadline - AETHER neutral palette */}
            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-xs sm:text-sm md:text-base lg:text-xl text-neutral-400 tracking-tight font-space-grotesk mt-2 mb-6 max-w-3xl px-4">
              Orchestrate smarter conversations across every channel your buyers use. 22+ channels, 7 AI agents, 1 platform.
            </h2>
          </div>

          {/* Stats Grid - AETHER card style (bg-[#050505] border border-subtle) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.MessageSquare className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">22</div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Channels</h3>
              </div>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Brain className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">7</div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">AI Agents</h3>
              </div>
            </div>
            <div className="bg-[#050505] border border-subtle p-6 sm:p-8 flex flex-col justify-between min-h-[180px] sm:min-h-[200px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
              <div className="flex justify-between items-start">
                <div className="w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <Icons.Layers className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">1</div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Platform</h3>
              </div>
            </div>
          </div>

          {/* CTA - ShinyButton AETHER style */}
          <div className="flex flex-col items-center gap-4 mt-10 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
            <ShinyButton href="/signup?product=clientcontact&tier=professional">Start Free Trial</ShinyButton>
            <p className="text-xs sm:text-sm text-neutral-500 font-geist">No credit card required • 14-day free trial • 5 minute setup</p>
          </div>
        </div>
      </div>
    </section>
  );
}
