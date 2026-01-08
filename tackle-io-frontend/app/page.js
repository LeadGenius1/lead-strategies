'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function HomePage() {
  useEffect(() => {
    // Initialize Lucide icons after component mounts
    const initLucide = () => {
      if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons()
      } else {
        setTimeout(initLucide, 100)
      }
    }
    initLucide()
  }, [])

  return (
    <>
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons()
          }
        }}
      />
      <Script
        src="/tackle-3d.js"
        type="module"
        strategy="afterInteractive"
      />
      
      <div className="w-full h-screen relative bg-[#050505]">
        {/* 1. The Canvas */}
        <canvas className="fixed outline-none w-full h-full z-[1] top-0 left-0" id="gl"></canvas>

        {/* 2. Concept Overlay Layer (Darkens the 3D scene) */}
        <div id="concept-overlay" className="fixed inset-0 bg-black/80 z-[5] pointer-events-none opacity-0 transition-opacity duration-1000"></div>

        {/* 3. Concept Content Container */}
        <div id="concept-container" className="fixed inset-0 z-[20] pointer-events-none hidden flex flex-col justify-center items-center p-8 md:p-20">
          <div className="relative w-full max-w-3xl h-[400px]">
            
            {/* Section 1 */}
            <div className="concept-section absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left transition-all duration-700 opacity-0 translate-y-8" id="c-sect-0">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight">API Power</h2>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center text-lg md:text-2xl text-white font-mono">1</div>
              </div>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-normal max-w-2xl drop-shadow-lg">
                Enterprise-grade API infrastructure enables seamless integration with your existing systems. Generate leads programmatically with RESTful endpoints, webhooks, and real-time analytics.
              </p>
            </div>

            {/* Section 2 */}
            <div className="concept-section absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left transition-all duration-700 opacity-0 translate-y-8" id="c-sect-1">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight">White-Label</h2>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center text-lg md:text-2xl text-white font-mono">2</div>
              </div>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-normal max-w-2xl drop-shadow-lg">
                Complete brand customization allows you to deploy Tackle.IO under your own domain with custom logos, colors, and messaging. Every touchpoint reflects your brand identity.
              </p>
            </div>

            {/* Section 3 */}
            <div className="concept-section absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left transition-all duration-700 opacity-0 translate-y-8" id="c-sect-2">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight">Scale Limitless</h2>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 flex items-center justify-center text-lg md:text-2xl text-white font-mono">3</div>
              </div>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-normal max-w-2xl drop-shadow-lg">
                Manage 10,000+ leads with NASA Control precision. Advanced automation, multi-channel campaigns, video integration, and enterprise analytics—all in one unified platform.
              </p>
            </div>

          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-pulse">
            <span className="text-xs uppercase tracking-widest text-white">Scroll</span>
            <i data-lucide="chevron-down" className="w-4 h-4 text-white"></i>
          </div>
        </div>

        {/* 4. Contact Content Container */}
        <div id="contact-container" className="fixed inset-0 z-[25] pointer-events-none hidden flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start px-[40px] md:px-20 transition-all duration-700 opacity-0 translate-y-4">
          
          {/* Contact Card */}
          <div className="glass-panel w-full md:w-[480px] p-8 md:p-12 rounded-2xl shadow-2xl pointer-events-auto flex flex-col space-y-10 md:ml-[240px]">
            
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white tracking-tight">Enterprise Inquiries</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Request API access, white-label setup, or enterprise deployment consultation.
              </p>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Main Email Link */}
              <a href="mailto:enterprise@tackle.io" className="group block space-y-1">
                <div className="text-xs text-white/30 uppercase tracking-widest font-medium">Email</div>
                <div className="flex items-center gap-3 text-2xl md:text-3xl font-normal text-white transition-colors group-hover:text-white/70">
                  <span>enterprise@tackle.io</span>
                  <i data-lucide="arrow-up-right" className="w-6 h-6 text-white/30 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"></i>
                </div>
              </a>
            </div>

            {/* Footer Info */}
            <div className="pt-8 border-t border-white/10 flex justify-between items-center text-xs text-white/40">
              <div className="flex gap-4">
                <span>Global</span>
              </div>
              <div className="flex gap-5">
                <i data-lucide="twitter" className="w-5 h-5 cursor-pointer hover:text-white transition-colors"></i>
                <i data-lucide="linkedin" className="w-5 h-5 cursor-pointer hover:text-white transition-colors"></i>
                <i data-lucide="github" className="w-5 h-5 cursor-pointer hover:text-white transition-colors"></i>
              </div>
            </div>

          </div>
        </div>

        {/* 5. Main UI Layer (Nav & Builder Controls) */}
        <div className="relative z-[30] w-full h-full pointer-events-none flex flex-col md:flex-row justify-between p-[40px] md:p-16">
          
          {/* Left Column: Branding & Nav (Always Visible) */}
          <div className="flex flex-col md:w-auto pointer-events-auto w-full h-auto md:h-full justify-between z-[40]">
            
            {/* Top: Logo & Text */}
            <div className="flex flex-col mb-8 md:mb-0 space-y-3 order-1">
              <div className="select-none text-4xl md:text-6xl font-bold text-white tracking-widest uppercase flex items-center gap-1 cursor-pointer" onClick={() => window.location.reload()}>
                <span className="origin-left scale-x-125">TACKLE.IO</span>
              </div>
              <p className="leading-relaxed text-xs md:text-sm font-normal text-white/40 max-w-[300px] hidden md:block backdrop-blur-sm">
                Enterprise lead generation platform. Use controls to manipulate the lead stack.
              </p>
            </div>

            {/* Bottom: Navigation Links */}
            <nav className="flex flex-row md:flex-col space-x-6 md:space-x-0 md:space-y-3 order-2">
              <button id="nav-home" className="text-left text-white hover:text-white transition-opacity duration-300 font-normal text-lg md:text-[32px] leading-tight tracking-tight">
                Builder
              </button>
              <button id="nav-concept" className="text-left text-white/50 hover:text-white transition-opacity duration-300 font-normal text-lg md:text-[32px] leading-tight tracking-tight">
                Features
              </button>
              <button id="nav-contact" className="text-left text-white/50 hover:text-white transition-opacity duration-300 font-normal text-lg md:text-[32px] leading-tight tracking-tight">
                Contact
              </button>
            </nav>
          </div>

          {/* Builder UI Container */}
          <div id="builder-ui" className="absolute inset-0 w-full h-full pointer-events-none flex flex-col md:flex-row justify-end p-[40px] md:p-16 transition-opacity duration-500">
            
            {/* Right Column: Controls (Desktop) */}
            <div className="hidden md:flex flex-col h-full pointer-events-auto items-center justify-center">
              <div className="bg-zinc-900/60 w-80 border border-white/5 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-8">
                
                {/* Floor Count */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-white/50 font-medium tracking-wide">
                    <span>Stack Height</span>
                    <span id="val-floors" className="text-white font-mono">6</span>
                  </div>
                  <input type="range" id="input-floors" min="1" max="12" value="6" step="1" />
                </div>

                {/* Floor Size */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-white/50 font-medium tracking-wide">
                    <span>Footprint</span>
                    <span id="val-size" className="text-white font-mono">L3</span>
                  </div>
                  <input type="range" id="input-size" min="0" max="3" value="2" step="1" />
                </div>

                {/* Block Height */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-white/50 font-medium tracking-wide">
                    <span>Block Height</span>
                    <span id="val-height" className="text-white font-mono">0.8</span>
                  </div>
                  <input type="range" id="input-height" min="0.1" max="2.0" value="0.8" step="0.1" />
                </div>

                {/* Spacing / Gap Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-white/50 font-medium tracking-wide">
                    <span>Block Spacing</span>
                    <span id="val-gap" className="text-white font-mono">0.6</span>
                  </div>
                  <input type="range" id="input-gap" min="0.05" max="1.5" value="0.6" step="0.05" />
                </div>

                {/* Lighting Options */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="text-sm text-white/50 font-medium tracking-wide">Lighting</div>
                  <div className="flex gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
                    <button className="flex-1 py-2 text-xs font-semibold tracking-wide rounded-md bg-white/10 text-white transition-all duration-200 hover:bg-white/20" id="light-studio">Studio</button>
                    <button className="flex-1 py-2 text-xs font-semibold tracking-wide rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200" id="light-warm">Warm</button>
                    <button className="flex-1 py-2 text-xs font-semibold tracking-wide rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200" id="light-neon">Neon</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Control Layer */}
            <div className="absolute bottom-0 left-0 w-full pointer-events-auto md:hidden flex flex-col items-center justify-end px-[40px] pb-[40px] bg-gradient-to-t from-black/80 to-transparent h-72">
              <div className="relative w-full aspect-[2/1]">
                <div className="absolute -left-6 top-0 h-full flex flex-col justify-center items-end pr-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest -rotate-90 origin-center whitespace-nowrap">Height</span>
                </div>
                <div className="absolute -bottom-6 w-full text-center">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Footprint</span>
                </div>
                <div id="xy-pad" className="w-full h-full border-l border-b border-white/30 relative cursor-crosshair touch-none">
                  <div className="absolute inset-0 opacity-10 pointer-events-none xy-grid-pattern"></div>
                  <div className="absolute top-0 -left-3 w-1 h-px bg-white/30"></div>
                  <div className="absolute bottom-0 -left-3 w-1 h-px bg-white/30"></div>
                  <div className="absolute bottom-0 -left-px w-px h-1 bg-white/30"></div>
                  <div className="absolute bottom-0 right-0 w-px h-1 bg-white/30"></div>
                  <div id="xy-thumb" className="absolute w-4 h-4 -ml-2 -mt-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10 top-1/2 left-1/2 transition-transform duration-75">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-[35] pointer-events-none">
          <div className="glass-panel mx-[40px] md:mx-16 mb-8 p-6 md:p-8 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-white">Tackle.IO Enterprise</h3>
                <p className="text-sm text-white/50 max-w-md">
                  The most powerful lead generation platform. API access, white-label solutions, and enterprise features for teams that demand precision.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-white/30 font-medium">Platform</h4>
                  <a href="/login" className="text-sm text-white/70 hover:text-white transition-colors">Login</a>
                  <a href="/signup" className="text-sm text-white/70 hover:text-white transition-colors">Sign Up</a>
                  <a href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</a>
                </div>
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-white/30 font-medium">Resources</h4>
                  <a href="/docs" className="text-sm text-white/70 hover:text-white transition-colors">API Docs</a>
                  <a href="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</a>
                  <a href="/support" className="text-sm text-white/70 hover:text-white transition-colors">Support</a>
                </div>
                <div className="flex flex-col space-y-2">
                  <h4 className="text-xs uppercase tracking-widest text-white/30 font-medium">Enterprise</h4>
                  <a href="mailto:enterprise@tackle.io" className="text-sm text-white/70 hover:text-white transition-colors">Contact Sales</a>
                  <a href="/white-label" className="text-sm text-white/70 hover:text-white transition-colors">White-Label</a>
                  <a href="/api-keys" className="text-sm text-white/70 hover:text-white transition-colors">API Access</a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
              <div>© 2024 Tackle.IO. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                <a href="/security" className="hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
