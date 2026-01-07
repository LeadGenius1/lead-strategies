'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }
  }, [])

  return (
    <div className="bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Ambient Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50"></div>
        <div className="absolute inset-0 bg-grid opacity-30"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] glow-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] glow-blob animation-delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite.IO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white">
              Get Started
            </Link>
          </div>
          <button className="md:hidden text-neutral-400">
            <i data-lucide="menu" className="w-5 h-5"></i>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] md:text-xs font-medium tracking-wide mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          LEAD GENERATION ENGINE V2.0 LIVE
        </div>

        <h1 className="text-4xl md:text-7xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 max-w-4xl mx-auto mb-6 leading-[1.1]">
          Generate leads beyond <br className="hidden md:block" /> the competition.
        </h1>
        
        <p className="text-neutral-400 text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Professional lead generation platform with website integration and email campaigns. Capture, nurture, and convert leads at scale.
        </p>

        {/* Animated Button */}
        <div className="relative group">
          <Link href="/signup" className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none transition-transform hover:scale-105 active:scale-95 duration-200">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
            <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
              Start Generating Leads
              <i data-lucide="chevron-right" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"></i>
            </span>
          </Link>
          {/* Glow under button */}
          <div className="absolute inset-0 -z-10 bg-indigo-500/50 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">Core Capabilities</h2>
          <p className="text-neutral-500 text-sm">Designed for professional lead generation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-indigo-400">
                <i data-lucide="globe" className="w-5 h-5"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Website Integration</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Seamlessly integrate lead capture forms into your website. Customizable forms that match your brand and capture qualified leads.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-purple-400">
                <i data-lucide="mail" className="w-5 h-5"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Email Campaigns</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Automated email sequences that nurture leads through your sales funnel. Track opens, clicks, and conversions in real-time.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-cyan-400">
                <i data-lucide="bar-chart" className="w-5 h-5"></i>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Comprehensive analytics to track lead sources, conversion rates, and campaign performance. Make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Graphic Section */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-y border-white/5 bg-neutral-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-medium tracking-tight mb-6">Monitor your lead pipeline.</h2>
            <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-8 font-light">
              Our dashboard provides a comprehensive view of your lead generation efforts. Track form submissions, email performance, and conversion metrics through a single interface.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <i data-lucide="check" className="w-4 h-4 text-indigo-500"></i>
                <span>Real-time lead notifications</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <i data-lucide="check" className="w-4 h-4 text-indigo-500"></i>
                <span>Automated email sequences</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-300">
                <i data-lucide="check" className="w-4 h-4 text-indigo-500"></i>
                <span>Website form integration</span>
              </li>
            </ul>
          </div>
          
          <div className="w-full md:w-1/2 relative animate-float">
            {/* Abstract UI Representation */}
            <div className="relative rounded-xl bg-neutral-900 border border-white/10 p-4 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
              
              {/* Header UI */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">STATUS: ONLINE</div>
              </div>

              {/* Graph Area */}
              <div className="flex items-end gap-2 h-32 mb-6 px-2">
                <div className="w-full bg-indigo-500/20 rounded-t-sm h-[40%] relative group">
                  <div className="absolute bottom-0 w-full h-0 group-hover:h-full bg-indigo-500/40 transition-all duration-500"></div>
                </div>
                <div className="w-full bg-indigo-500/20 rounded-t-sm h-[70%] relative group">
                  <div className="absolute bottom-0 w-full h-0 group-hover:h-full bg-indigo-500/40 transition-all duration-500"></div>
                </div>
                <div className="w-full bg-indigo-500/20 rounded-t-sm h-[50%] relative group">
                  <div className="absolute bottom-0 w-full h-0 group-hover:h-full bg-indigo-500/40 transition-all duration-500"></div>
                </div>
                <div className="w-full bg-indigo-500/20 rounded-t-sm h-[85%] relative group">
                  <div className="absolute bottom-0 w-full h-0 group-hover:h-full bg-indigo-500/40 transition-all duration-500"></div>
                </div>
                <div className="w-full bg-indigo-500/20 rounded-t-sm h-[60%] relative group">
                  <div className="absolute bottom-0 w-full h-0 group-hover:h-full bg-indigo-500/40 transition-all duration-500"></div>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="bg-black/50 rounded p-3 font-mono text-[10px] text-neutral-400 border border-white/5">
                <div className="flex justify-between">
                  <span className="text-purple-400">const</span>
                  <span className="text-neutral-600">v.2.0.4</span>
                </div>
                <div className="mt-1">
                  <span className="text-blue-400">initializeLeads</span>(<span className="text-yellow-400">true</span>);
                </div>
                <div className="mt-1 text-neutral-600">
                  // Lead capture active...
                </div>
              </div>
            </div>
            
            {/* Floating Element Behind */}
            <div className="absolute -z-10 -top-6 -right-6 w-full h-full border border-white/5 rounded-xl bg-neutral-900/50"></div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl font-medium tracking-tight mb-16">The Integration Process</h2>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-[15px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent md:left-1/2 md:-ml-[1px]"></div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
              <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                <h3 className="text-lg font-medium text-white">Website Setup</h3>
                <p className="text-sm text-neutral-500 mt-2 font-light">Embed our lead capture forms into your website. Customize the design to match your brand and start collecting leads instantly.</p>
              </div>
              <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
                <div className="w-8 h-8 rounded-full bg-black border border-indigo-500/50 flex items-center justify-center z-10 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12 order-3"></div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
              <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1"></div>
              <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
                <div className="w-8 h-8 rounded-full bg-black border border-white/10 group-hover:border-purple-500/50 transition-colors flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-neutral-600 group-hover:bg-purple-400 transition-colors rounded-full"></div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12 order-3 md:order-3">
                <h3 className="text-lg font-medium text-white">Email Automation</h3>
                <p className="text-sm text-neutral-500 mt-2 font-light">Configure automated email sequences to nurture leads. Set up welcome emails, follow-ups, and conversion campaigns tailored to your business.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
              <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                <h3 className="text-lg font-medium text-white">Track & Convert</h3>
                <p className="text-sm text-neutral-500 mt-2 font-light">Monitor lead activity, email performance, and conversion rates through our analytics dashboard. Make data-driven decisions to optimize your funnel.</p>
              </div>
              <div className="absolute left-0 md:static md:w-8 md:h-8 flex items-center justify-center order-1 md:order-2">
                <div className="w-8 h-8 rounded-full bg-black border border-white/10 group-hover:border-cyan-500/50 transition-colors flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-neutral-600 group-hover:bg-cyan-400 transition-colors rounded-full"></div>
                </div>
              </div>
              <div className="md:w-1/2 md:pl-12 order-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/CTA */}
      <section id="pricing" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900/40 border border-white/10 p-8 md:p-12 text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 relative z-10">Ready to generate leads?</h2>
          <p className="text-neutral-400 text-sm md:text-base mb-10 max-w-lg mx-auto font-light relative z-10">
            Start capturing leads today. Free trial includes 100 leads, website integration, and email campaigns.
          </p>

          <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto relative z-10">
            <Link href="/signup" className="bg-white text-black px-8 py-3 rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] text-center">
              Start Free Trial
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-3 rounded-lg font-medium text-sm transition-colors text-center">
              Login
            </Link>
          </div>
          
          <p className="mt-6 text-xs text-neutral-600 relative z-10">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 border-t border-white/5 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded-full"></div>
              <span className="text-sm font-medium tracking-widest uppercase text-white">LeadSite.IO</span>
            </div>
            <p className="text-xs text-neutral-500">© 2024 LeadSite.IO. All systems operational.</p>
          </div>
          
          <div className="flex gap-8">
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Support</a>
            <a href="#" className="text-xs text-neutral-400 hover:text-white transition-colors">Legal</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

