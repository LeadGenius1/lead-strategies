'use client'

import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>
          <p className="text-neutral-400 mb-8">Last updated: January 2026</p>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p>
                By accessing or using AI Lead Strategies' services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p>
                AI Lead Strategies provides a unified platform for lead generation, email campaigns, website building, omnichannel marketing, voice calling, and CRM management. Our services include multiple tiers with varying features and capabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="mb-4">To use our services, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Billing</h2>
              <p className="mb-4">Our services are offered on a subscription basis:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscriptions are billed monthly or annually</li>
                <li>Fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>You may cancel your subscription at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code or malware</li>
                <li>Spam or harass others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p>
                All content, features, and functionality of our service are owned by AI Lead Strategies LLC and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, AI Lead Strategies shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our service. Your continued use constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms of Service, please contact us:
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
