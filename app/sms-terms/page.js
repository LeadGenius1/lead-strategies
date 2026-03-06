'use client';

import { useState } from 'react';

export default function SmsTermsPage() {
  const [agreed, setAgreed] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed || !phone) return;
    // TODO: Connect to backend endpoint to record SMS opt-in
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">AI</div>
            <span className="text-sm font-semibold tracking-wide">AI LEAD STRATEGIES</span>
          </a>
          <a href="/" className="text-xs text-neutral-500 hover:text-white transition-colors">← Back to Home</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">SMS Communications &amp; Consent</h1>
          <p className="text-neutral-400 text-lg">How AI Lead Strategies uses text messaging to keep you informed.</p>
          <p className="text-neutral-600 text-xs mt-2">Last updated: March 6, 2026</p>
        </div>

        {/* What Messages You'll Receive */}
        <section className="mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">What Messages You&apos;ll Receive</h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            When you opt in to SMS communications from AI Lead Strategies, you may receive the following types of text messages:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 mt-0.5">•</span>
              <div>
                <span className="text-white text-sm font-medium">Campaign Notifications</span>
                <span className="text-neutral-400 text-sm"> — alerts when your lead generation campaigns produce results, new leads are captured, or campaign status changes.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 mt-0.5">•</span>
              <div>
                <span className="text-white text-sm font-medium">Platform Updates</span>
                <span className="text-neutral-400 text-sm"> — important notifications about your account, billing, new features, and platform status.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-cyan-400 mt-0.5">•</span>
              <div>
                <span className="text-white text-sm font-medium">Marketing Communications</span>
                <span className="text-neutral-400 text-sm"> — promotional offers, tips for improving your lead generation results, and product announcements.</span>
              </div>
            </div>
          </div>
        </section>

        {/* How to Opt In */}
        <section className="mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">How to Opt In</h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            You can opt in to receive SMS messages from AI Lead Strategies by:
          </p>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>1. Providing your phone number during account signup and checking the SMS consent box.</p>
            <p>2. Enabling SMS notifications in your UltraLead or platform dashboard settings.</p>
            <p>3. Submitting your phone number through the consent form on this page.</p>
          </div>
          <p className="text-neutral-400 text-xs mt-4">
            By opting in, you confirm that you are the owner or authorized user of the phone number provided and that you consent to receive automated text messages from AI Lead Strategies LLC at that number.
          </p>
        </section>

        {/* Message Frequency & Rates */}
        <section className="mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Message Frequency &amp; Rates</h2>
          <div className="space-y-3 text-sm text-neutral-300">
            <p><span className="text-white font-medium">Message frequency:</span> Varies based on your account activity. Typically 2-10 messages per month. Campaign alerts may be more frequent during active campaigns.</p>
            <p><span className="text-white font-medium">Message and data rates may apply.</span> Standard text messaging rates from your wireless carrier apply. AI Lead Strategies does not charge for receiving text messages, but your carrier may.</p>
            <p><span className="text-white font-medium">Supported carriers:</span> Compatible with all major US carriers including AT&amp;T, T-Mobile, Verizon, and others.</p>
          </div>
        </section>

        {/* How to Opt Out */}
        <section className="mb-10 p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.03]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">How to Opt Out</h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            You can stop receiving SMS messages at any time by:
          </p>
          <div className="space-y-2 text-sm text-neutral-300">
            <p><span className="text-white font-medium">Reply STOP</span> — Text STOP to any message you receive from us. You will receive a one-time confirmation message and no further texts.</p>
            <p><span className="text-white font-medium">Dashboard settings</span> — Disable SMS notifications in your account settings at any time.</p>
            <p><span className="text-white font-medium">Contact us</span> — Email <a href="mailto:support@aileadstrategies.com" className="text-cyan-400 hover:underline">support@aileadstrategies.com</a> or call us to request removal.</p>
          </div>
          <p className="text-neutral-400 text-xs mt-4">
            Opting out of SMS will not affect your account or subscription. You will continue to receive important account notifications via email.
          </p>
        </section>

        {/* Help */}
        <section className="mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Need Help?</h2>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For questions about our SMS program, reply <span className="text-white font-medium">HELP</span> to any message or contact us:</p>
            <p>Email: <a href="mailto:support@aileadstrategies.com" className="text-cyan-400 hover:underline">support@aileadstrategies.com</a></p>
            <p>Phone: (610) 561-5563</p>
            <p>Address: AI Lead Strategies LLC, 600 Eagleview Blvd, Suite 317, Exton, PA 19341</p>
          </div>
        </section>

        {/* Privacy & Data */}
        <section className="mb-10 p-6 rounded-xl border border-white/5 bg-white/[0.02]">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">Privacy &amp; Data Protection</h2>
          <div className="text-sm text-neutral-300 space-y-3">
            <p>Your phone number and SMS data are protected under our <a href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</a>.</p>
            <p>We will never sell, rent, or share your phone number with third parties for their marketing purposes.</p>
            <p>Phone numbers collected for SMS are used solely for the purposes described on this page.</p>
            <p>For complete details on how we handle your data, including your rights under CCPA and GDPR, please review our <a href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-cyan-400 hover:underline">Terms of Service</a>.</p>
          </div>
        </section>

        {/* Consent Form */}
        <section className="mb-16 p-8 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.05] to-cyan-500/[0.05]">
          <h2 className="text-xl font-semibold mb-2">Opt In to SMS Communications</h2>
          <p className="text-neutral-400 text-sm mb-6">Already have an account? You can also enable SMS in your dashboard settings.</p>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">You&apos;re opted in!</p>
              <p className="text-neutral-400 text-sm">You&apos;ll receive a confirmation text shortly. Reply STOP at any time to opt out.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 text-sm"
                  required
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/20"
                  required
                />
                <span className="text-xs text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  I agree to receive automated marketing and informational text messages from AI Lead Strategies LLC at the phone number provided. I understand that consent is not a condition of purchase. Message and data rates may apply. Message frequency varies. I can reply STOP to opt out at any time. I have read and agree to the <a href="/privacy-policy" className="text-cyan-400 hover:underline">Privacy Policy</a> and <a href="/terms-of-service" className="text-cyan-400 hover:underline">Terms of Service</a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || !phone}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Opt In to SMS
              </button>
            </form>
          )}
        </section>

        {/* Legal Footer */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-neutral-600 text-xs">
            AI Lead Strategies LLC · 600 Eagleview Blvd, Suite 317, Exton, PA 19341
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy-policy" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">Terms of Service</a>
            <a href="mailto:support@aileadstrategies.com" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">Contact</a>
          </div>
        </div>
      </main>
    </div>
  );
}
