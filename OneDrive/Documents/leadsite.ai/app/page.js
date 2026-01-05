'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import { ChevronRight, BrainCircuit, Zap, ShieldCheck, Check, Mail, Globe, MessageSquare, Video, Briefcase } from 'lucide-react'

export default function HomePage() {
  // Ensure page scrolls to top on load and all sections are visible
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
    
    // Verify all sections are present
    const sections = ['platforms', 'features', 'pricing']
    sections.forEach(id => {
      const element = document.getElementById(id)
      if (!element) {
        console.warn(`Section #${id} not found`)
      }
    })
  }, [])

  return (
    <div className="min-h-screen w-full">
      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] md:text-xs font-medium tracking-wide mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          ALL SYSTEMS OPERATIONAL
        </div>

        <h1 className="text-4xl md:text-7xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 max-w-4xl mx-auto mb-6 leading-[1.1]">
          ONE PLATFORM<br className="hidden md:block" /> INFINITE REVENUE
        </h1>
        
        <p className="text-neutral-400 text-sm md:text-lg max-w-xl mx-auto mb-4 leading-relaxed font-light">
          The Only Growth Engine You'll Ever Need
        </p>

        <p className="text-neutral-500 text-xs md:text-sm max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          From pricing for 50 leads, turn into placements+ website builder, 22-channel outreach, website builder, video platform hosting 22 social platforms, voice calls, AI-agent CRM — all one single dashboard, full-tier access.
        </p>

        {/* Animated Button */}
        <div className="relative group">
          <Link href="/signup">
            <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
              <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                Start Free Trial
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
          {/* Glow under button */}
          <div className="absolute inset-0 -z-10 bg-indigo-500/50 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
        </div>
      </section>

      {/* Platform Cards Section */}
      <section id="platforms" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">Choose Your Growth Engine</h2>
          <p className="text-neutral-500 text-sm">Five platforms. One ecosystem. Infinite possibilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* LeadSite.AI */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">LeadSite.AI</h3>
              <div className="text-2xl font-bold text-white mb-4">$59<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
              <p className="text-sm text-neutral-400 leading-relaxed font-light mb-6">
                Email lead generation with AI-powered prospecting. Perfect for targeted outreach campaigns.
              </p>
              <Link href="/signup" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* LeadSite.IO */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-purple-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">LeadSite.IO</h3>
              <div className="text-2xl font-bold text-white mb-4">$79<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
              <p className="text-sm text-neutral-400 leading-relaxed font-light mb-6">
                AI website builder with integrated outreach. Build stunning sites and generate leads simultaneously.
              </p>
              <Link href="/signup" className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* ClientContact.IO */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">ClientContact.IO</h3>
              <div className="text-2xl font-bold text-white mb-4">$149<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
              <p className="text-sm text-neutral-400 leading-relaxed font-light mb-6">
                Omnichannel marketing across 22+ platforms. LinkedIn, Instagram, Facebook, Twitter, TikTok, YouTube, Email, SMS, WhatsApp and more.
              </p>
              <Link href="/signup" className="inline-flex items-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* VideoSite.IO */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-pink-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-pink-400">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">VideoSite.IO</h3>
              <div className="text-2xl font-bold text-white mb-4">$99<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
              <p className="text-sm text-neutral-400 leading-relaxed font-light mb-6">
                YouTube competitor with creator payment system. Host, monetize, and distribute video content globally.
              </p>
              <Link href="/signup" className="inline-flex items-center text-sm text-pink-400 hover:text-pink-300 transition-colors">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Tackle.IO - Featured */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border-2 border-indigo-500/50 hover:border-indigo-500 transition-all duration-500 overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-[10px] text-indigo-300 font-medium">
              MOST POPULAR
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Tackle.IO</h3>
              <div className="text-2xl font-bold text-white mb-4">$499<span className="text-sm text-neutral-500 font-normal">/mo</span></div>
              <p className="text-sm text-neutral-400 leading-relaxed font-light mb-6">
                Full suite with Voice + CRM. Complete marketing automation with AI-powered voice calls, advanced CRM, and every feature from all platforms.
              </p>
              <Link href="/signup" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">Core Capabilities</h2>
          <p className="text-neutral-500 text-sm">Designed for autonomous scalability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">AI-Powered Intelligence</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Claude 4.1 Sonnet integration that adapts to your business in real-time, offering cognitive reasoning capabilities across all platforms.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Lightning Fast Deploy</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Edge-optimized infrastructure ensures campaigns launch in seconds. Scale from 0 to 10,000 leads without breaking a sweat.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Enterprise Security</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Military-grade encryption for all data. Your proprietary information remains isolated and protected at all times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900/40 border border-white/10 p-8 md:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 relative z-10">Ready to scale?</h2>
          <p className="text-neutral-400 text-sm md:text-base mb-10 max-w-lg mx-auto font-light relative z-10">
            Start your 14-day free trial. No credit card required. Cancel anytime.
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto relative z-10">
            <Link href="/signup" className="flex-1">
              <button className="w-full bg-white text-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Start Free Trial
              </button>
            </Link>
            <Link href="/login" className="flex-1">
              <button className="w-full bg-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/20 border border-white/10 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
          
          <p className="mt-6 text-xs text-neutral-600 relative z-10">Join 1,000+ businesses automating their growth.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
              <span className="text-sm font-medium tracking-widest uppercase text-white">AI LEAD STRATEGIES</span>
            </div>
            <p className="text-xs text-neutral-500">© 2024 AI Lead Strategies LLC. All rights reserved.</p>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Support</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
