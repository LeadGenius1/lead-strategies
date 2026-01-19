'use client'

import Link from 'next/link'

export default function LegalPageLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="font-bold text-lg tracking-tight">AI LEAD STRATEGIES</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-neutral-400 hover:text-white transition">Login</Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-neutral-400 mb-8">Last Updated: {lastUpdated}</p>

          <div className="space-y-8 text-neutral-300 leading-relaxed prose prose-invert prose-headings:text-white prose-h2:text-2xl prose-h3:text-xl prose-a:text-purple-400 hover:prose-a:text-purple-300 prose-strong:text-white prose-li:marker:text-purple-500 max-w-none">
            {children}
          </div>

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <Link href="/" className="text-purple-400 hover:text-purple-300 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="font-bold text-white">AI LEAD STRATEGIES LLC</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                600 Eagleview Blvd, Suite 317<br />
                Exton, PA 19341<br />
                United States<br />
                <span className="text-neutral-500">Phone:</span> <a href="tel:6107571587" className="hover:text-white transition">610.757.1587</a><br />
                <span className="text-neutral-500">Email:</span> <a href="mailto:support@aileadstrategies.com" className="hover:text-white transition">support@aileadstrategies.com</a>
              </p>
            </div>

            {/* Platforms */}
            <div>
              <h3 className="font-semibold text-white mb-4">Platforms</h3>
              <div className="space-y-2 text-neutral-400 text-sm">
                <Link href="/leadsite-ai" className="block hover:text-white transition">LeadSite.AI</Link>
                <Link href="/leadsite-io" className="block hover:text-white transition">LeadSite.IO</Link>
                <Link href="/clientcontact-io" className="block hover:text-white transition">ClientContact.IO</Link>
                <Link href="/tackle-io" className="block hover:text-white transition">TackleAI</Link>
                <Link href="/videosite-ai" className="block hover:text-white transition">VideoSite.AI</Link>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal & Compliance</h3>
              <div className="space-y-2 text-neutral-400 text-sm">
                <Link href="/privacy" className="block hover:text-white transition">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition">Terms of Service</Link>
                <Link href="/security" className="block hover:text-white transition">Security</Link>
                <Link href="/compliance" className="block hover:text-white transition">Compliance</Link>
                <Link href="/gdpr" className="block hover:text-white transition">GDPR</Link>
                <Link href="/ccpa" className="block hover:text-white transition">CCPA</Link>
                <Link href="/cookie-policy" className="block hover:text-white transition">Cookie Policy</Link>
                <Link href="/data-processing" className="block hover:text-white transition">Data Processing</Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2 text-neutral-400 text-sm">
                <Link href="/" className="block hover:text-white transition">Home</Link>
                <Link href="/login" className="block hover:text-white transition">Login</Link>
                <Link href="/signup" className="block hover:text-white transition">Sign Up</Link>
              </div>
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="border-t border-white/5 pt-6 mb-6">
            <p className="text-xs text-neutral-500 text-center max-w-4xl mx-auto">
              AI Lead Strategies is committed to data privacy and compliance. We comply with GDPR, CCPA, CAN-SPAM, CASL, and other applicable data protection regulations. 
              All email campaigns include unsubscribe links and comply with anti-spam laws. For questions about data processing or compliance, contact{' '}
              <a href="mailto:compliance@aileadstrategies.com" className="hover:text-white transition underline">compliance@aileadstrategies.com</a>.
            </p>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-neutral-600 text-sm">© 2026 AI Lead Strategies LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
