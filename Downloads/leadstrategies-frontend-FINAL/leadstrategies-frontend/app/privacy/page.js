'use client'

import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-neutral-400 mb-8">Last updated: January 2026</p>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p>
                AI Lead Strategies LLC ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information (name, email, company)</li>
                <li>Payment and billing information</li>
                <li>Content you create or upload (campaigns, prospects, websites)</li>
                <li>Communications with us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-[#050505] border border-white/10 rounded-lg p-6">
                <p className="font-semibold mb-2">AI Lead Strategies LLC</p>
                <p className="text-sm">600 Eagleview Blvd Suite 317</p>
                <p className="text-sm">Exton, PA 19341</p>
                <p className="text-sm mt-2">
                  Phone: <a href="tel:6107571587" className="text-purple-400 hover:text-purple-300">610.757.1587</a>
                </p>
                <p className="text-sm">
                  Email: <a href="mailto:info@aileadstrategies.com" className="text-purple-400 hover:text-purple-300">info@aileadstrategies.com</a>
                </p>
                <p className="text-sm">
                  Email: <a href="mailto:aileadstrategies@gmail.com" className="text-purple-400 hover:text-purple-300">aileadstrategies@gmail.com</a>
                </p>
              </div>
            </section>
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
                600 Eagleview Blvd Suite 317<br />
                Exton, PA 19341<br />
                <span className="text-neutral-500">ph</span> 610.757.1587<br />
                <span className="text-neutral-500">email</span> <a href="mailto:info@aileadstrategies.com" className="hover:text-white transition">info@aileadstrategies.com</a><br />
                <a href="mailto:aileadstrategies@gmail.com" className="hover:text-white transition">aileadstrategies@gmail.com</a>
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <div className="space-y-2 text-neutral-400 text-sm">
                <p>
                  <span className="text-neutral-500">Phone:</span>{' '}
                  <a href="tel:6107571587" className="hover:text-white transition">610.757.1587</a>
                </p>
                <p>
                  <span className="text-neutral-500">Email:</span>{' '}
                  <a href="mailto:info@aileadstrategies.com" className="hover:text-white transition">info@aileadstrategies.com</a>
                </p>
                <p>
                  <a href="mailto:aileadstrategies@gmail.com" className="hover:text-white transition">aileadstrategies@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-neutral-400 hover:text-white transition text-sm">Privacy Policy</Link>
                <Link href="/terms" className="block text-neutral-400 hover:text-white transition text-sm">Terms of Service</Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/#platforms" className="block text-neutral-400 hover:text-white transition text-sm">Platforms</Link>
                <Link href="/login" className="block text-neutral-400 hover:text-white transition text-sm">Login</Link>
                <Link href="/signup" className="block text-neutral-400 hover:text-white transition text-sm">Sign Up</Link>
              </div>
            </div>
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
