'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

export default function AdvertiserSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', password: '', phone: '', website: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [token, setToken] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/advertiser/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setToken(data.token);
      setShowAgreement(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/advertiser/accept-agreement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept agreement');
      }
      localStorage.setItem('advertiser_token', token);
      router.push('/advertiser/dashboard');
    } catch (err) {
      setError(err.message);
      setShowAgreement(false);
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center antialiased">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
            Create Advertiser Account
          </h1>
          <p className="text-gray-400 text-sm mt-2">Reach viewers on VideoSite.AI</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Business Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={update('businessName')}
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Contact Name *</label>
              <input
                type="text"
                value={form.contactName}
                onChange={update('contactName')}
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="John Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              required
              minLength={8}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Phone <span className="text-gray-600">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Website <span className="text-gray-600">(optional)</span></label>
              <input
                type="url"
                value={form.website}
                onChange={update('website')}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/advertiser/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* Agreement Modal */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Advertiser Agreement</h2>
              <p className="text-gray-400 text-xs mt-1">Please review and accept before continuing</p>
            </div>

            <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-4 text-sm text-gray-300 leading-relaxed">
              <div>
                <h3 className="text-white font-medium mb-1">1. FTC Compliance</h3>
                <p className="text-gray-400">
                  All advertisements must be clearly labeled as &quot;Sponsored&quot; or &quot;Ad&quot; in accordance with FTC guidelines.
                  Failure to comply may result in legal action and account termination.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">2. Prohibited Content</h3>
                <p className="text-gray-400">
                  The following content categories are strictly prohibited: adult/sexual content, gambling/casino,
                  weapons, illegal drugs, political campaigns, and misleading or deceptive claims.
                  Ads are auto-reviewed and rejected if violations are detected.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">3. Budget &amp; Billing</h3>
                <p className="text-gray-400">
                  Campaign budgets are charged upfront via Stripe. Once a campaign is live and serving impressions,
                  no refunds will be issued. You may pause a campaign at any time, but spent budget is non-refundable.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">4. Violations &amp; Termination</h3>
                <p className="text-gray-400">
                  Violations of this agreement, including submitting prohibited content, manipulating view counts,
                  or engaging in fraudulent activity, will result in immediate account termination and forfeiture
                  of remaining budget.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowAgreement(false); setToken(''); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={acceptLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                {acceptLoading ? 'Accepting...' : 'I Accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
