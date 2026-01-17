'use client';

import Link from 'next/link';

export default function Footer({ brandName = 'AI LEAD STRATEGIES' }) {
  return (
    <footer className="border-t border-subtle bg-black pt-12 pb-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Contact Info */}
          <div className="lg:col-span-2">
            <div className="text-xl sm:text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light mb-4">
              <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse"></div>
              {brandName}
            </div>
            
            {/* Business Address */}
            <div className="space-y-2 text-sm text-neutral-400 font-geist mb-6">
              <p className="font-semibold text-neutral-300">AI Lead Strategies LLC</p>
              <p>600 Eagleview Blvd, Suite 317</p>
              <p>Exton, PA 19341</p>
              <p>United States</p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-neutral-400 font-geist">
              <p>
                <a href="tel:6107571587" className="hover:text-white transition-colors">
                  Phone: 610.757.1587
                </a>
              </p>
              <p>
                <a href="mailto:support@aileadstrategies.com" className="hover:text-white transition-colors">
                  Email: support@aileadstrategies.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-4">Platforms</h4>
            <ul className="space-y-2 text-sm font-geist text-neutral-400">
              <li><Link href="/leadsite-ai" className="hover:text-white transition-colors">LeadSite.AI</Link></li>
              <li><Link href="/leadsite-io" className="hover:text-white transition-colors">LeadSite.IO</Link></li>
              <li><Link href="/clientcontact-io" className="hover:text-white transition-colors">ClientContact.IO</Link></li>
              <li><Link href="/tackle-io" className="hover:text-white transition-colors">TackleAI</Link></li>
              <li><Link href="/videosite-ai" className="hover:text-white transition-colors">VideoSite.AI</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-4">Legal</h4>
            <ul className="space-y-2 text-sm font-geist text-neutral-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-subtle pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-600">
          <p className="font-geist text-center sm:text-left">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-geist">Twitter</Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-geist">LinkedIn</Link>
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-geist">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
