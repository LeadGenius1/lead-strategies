'use client';

import { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl md:text-3xl font-medium text-white mt-2 tracking-tight">{value}</p>
          {sub && <p className="text-neutral-500 text-xs mt-1 font-light">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalQualifiedViews: 0,
    earningsPerView: 1,
    minPayout: 10,
  });
  const [history, setHistory] = useState([]);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    async function loadEarnings() {
      setLoading(true);
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) return;

        const [summaryRes, historyRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/videosite/earnings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/v1/videosite/earnings/history?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (summaryRes.ok) {
          const json = await summaryRes.json();
          const d = json.data || json;
          setSummary({
            totalEarnings: d.totalEarnings ?? 0,
            pendingEarnings: d.pendingEarnings ?? 0,
            paidEarnings: d.paidEarnings ?? 0,
            totalQualifiedViews: d.totalQualifiedViews ?? 0,
            earningsPerView: d.earningsPerView ?? 1,
            minPayout: d.minPayout ?? 10,
          });
        }

        if (historyRes.ok) {
          const json = await historyRes.json();
          const d = json.data || json;
          setHistory(Array.isArray(d.earnings) ? d.earnings : []);
        }
        // Optionally check Stripe status
        try {
          const stripeRes = await fetch(`${apiUrl}/api/v1/videosite/stripe/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (stripeRes.ok) {
            const stripeJson = await stripeRes.json();
            const s = stripeJson.data || stripeJson;
            setStripeConnected(s.connected === true);
          }
        } catch {
          /* ignore */
        }
      } catch (err) {
        console.error('Earnings load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadEarnings();
  }, []);

  const canPayout = summary.pendingEarnings >= summary.minPayout;

  async function handleConnectStripe() {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/v1/videosite/stripe/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const url = json.data?.url;
      if (url) window.location.href = url;
      else alert('Failed to get Stripe link. Please try again.');
    } catch (err) {
      console.error(err);
      alert('Failed to connect Stripe.');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Aether Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-delay" />
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Earnings
          </h1>
          <p className="text-neutral-400 text-sm font-light">$1.00 per qualified view. Payout at ${summary.minPayout}+.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="Total Earnings" value={`$${(summary.totalEarnings || 0).toFixed(2)}`} icon={BanknotesIcon} />
              <StatCard
                label="Pending"
                value={`$${(summary.pendingEarnings || 0).toFixed(2)}`}
                sub="Awaiting payout"
                icon={ClockIcon}
              />
              <StatCard
                label="Paid Out"
                value={`$${(summary.paidEarnings || 0).toFixed(2)}`}
                icon={CheckCircleIcon}
              />
              <StatCard
                label="Qualified Views"
                value={(summary.totalQualifiedViews || 0).toLocaleString()}
                sub={`$${summary.earningsPerView}/view`}
                icon={ArrowTrendingUpIcon}
              />
            </div>

            {/* Stripe Connect & Payout */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 overflow-hidden mb-12">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-indigo-400" />
                Payouts
              </h2>
              {!stripeConnected ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div>
                    <p className="text-white font-medium">Connect your bank account</p>
                    <p className="text-neutral-400 text-sm font-light mt-1">
                      Link Stripe to receive payouts when you reach ${summary.minPayout}+ pending.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectStripe}
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-all"
                  >
                    Connect Stripe
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-neutral-400 text-sm">
                    {canPayout
                      ? `You have $${(summary.pendingEarnings || 0).toFixed(2)} ready to withdraw.`
                      : `Earn $${(summary.minPayout - (summary.pendingEarnings || 0)).toFixed(2)} more to reach the $${summary.minPayout} minimum payout.`}
                  </p>
                </div>
              )}
            </div>

            {/* Earnings History */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-indigo-400" />
                Recent Earnings
              </h2>
              {history.length === 0 ? (
                <p className="text-neutral-500 text-sm font-light">No earnings yet. Create and share videos to earn.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">{e.video?.title || 'Video'}</p>
                        <p className="text-neutral-500 text-xs font-light mt-0.5">
                          {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-indigo-400 font-medium">+${(e.amount || 0).toFixed(2)}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            e.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {e.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
