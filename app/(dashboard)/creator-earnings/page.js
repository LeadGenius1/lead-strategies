'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  DollarSign, Wallet, Clock, CheckCircle2, ArrowDownToLine,
  CreditCard, Mail, Zap, X, RefreshCw, AlertCircle,
} from 'lucide-react';

export default function CreatorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarned: 0, totalPaid: 0, pendingPayout: 0,
    availableBalance: 0, minPayoutCents: 1000, recentEarnings: [],
  });
  const [payouts, setPayouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [method, setMethod] = useState('stripe_connect');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [earningsRes, historyRes] = await Promise.allSettled([
        api.get('/api/v1/creator/payout/earnings'),
        api.get('/api/v1/creator/payout/history'),
      ]);
      if (earningsRes.status === 'fulfilled') {
        const d = earningsRes.value?.data?.data || earningsRes.value?.data || {};
        setEarnings({
          totalEarned: d.totalEarned || 0,
          totalPaid: d.totalPaid || 0,
          pendingPayout: d.pendingPayout || 0,
          availableBalance: d.availableBalance || 0,
          minPayoutCents: d.minPayoutCents || 1000,
          recentEarnings: d.recentEarnings || [],
        });
      }
      if (historyRes.status === 'fulfilled') {
        const d = historyRes.value?.data?.data || historyRes.value?.data || {};
        setPayouts(d.payouts || []);
      }
    } catch (err) {
      console.error('Load earnings error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest() {
    setRequesting(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      const body = { method };
      if (method === 'paypal') body.paypalEmail = paypalEmail;
      const res = await api.post('/api/v1/creator/payout/request', body);
      const d = res.data?.data || res.data;
      setRequestSuccess(`Payout request created for $${(d.amountCents / 100).toFixed(2)} via ${methodLabel(d.method)}`);
      setShowModal(false);
      loadData();
    } catch (err) {
      setRequestError(err.response?.data?.error || 'Failed to create payout request');
    } finally {
      setRequesting(false);
    }
  }

  function methodLabel(m) {
    if (m === 'stripe_connect') return 'Stripe Connect';
    if (m === 'paypal') return 'PayPal';
    if (m === 'platform_credits') return 'Platform Credits';
    return m;
  }

  function statusBadge(status) {
    const map = {
      pending: 'bg-amber-500/20 text-amber-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-emerald-500/20 text-emerald-400',
      rejected: 'bg-red-500/20 text-red-400',
    };
    return map[status] || 'bg-neutral-500/20 text-neutral-400';
  }

  const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
  const available = earnings.availableBalance;
  const canPayout = available >= earnings.minPayoutCents && earnings.pendingPayout === 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white antialiased selection:bg-purple-500/30">
      {/* AETHER Background */}
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
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-950/15 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl uppercase tracking-tighter font-space-grotesk font-light text-white">
            Creator <span className="text-gradient">Earnings</span>
          </h1>
          <p className="text-neutral-400 text-sm font-geist mt-2">$1.00 per qualified view. Minimum payout: {fmt(earnings.minPayoutCents)}.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Success message */}
            {requestSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-sm font-geist flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {requestSuccess}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Earned', value: fmt(earnings.totalEarned), icon: DollarSign },
                { label: 'Available to Withdraw', value: fmt(available), icon: Wallet },
                { label: 'Pending Payout', value: fmt(earnings.pendingPayout), icon: Clock },
                { label: 'Total Paid Out', value: fmt(earnings.totalPaid), icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.label} className="relative bg-[#050505] border border-white/[0.06] p-6 backdrop-blur-sm">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist">{s.label}</p>
                      <p className="text-2xl font-space-grotesk text-white mt-2">{s.value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/20 to-violet-600/20 border border-purple-500/20 flex items-center justify-center">
                      <s.icon className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Payout */}
            <div className="relative bg-[#050505] border border-white/[0.06] p-6 sm:p-8 backdrop-blur-sm mb-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg uppercase tracking-tighter font-space-grotesk text-white">
                    Request <span className="text-gradient">Payout</span>
                  </h2>
                  <p className="text-neutral-400 text-sm font-geist mt-1">
                    {canPayout
                      ? `You have ${fmt(available)} ready to withdraw.`
                      : earnings.pendingPayout > 0
                      ? 'You have a pending payout request being processed.'
                      : `Earn ${fmt(earnings.minPayoutCents - available)} more to reach the ${fmt(earnings.minPayoutCents)} minimum.`}
                  </p>
                </div>
                <button
                  onClick={() => { setShowModal(true); setRequestError(''); setRequestSuccess(''); }}
                  disabled={!canPayout}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 flex items-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Request Payout
                </button>
              </div>
            </div>

            {/* Payout History */}
            <div className="relative bg-[#050505] border border-white/[0.06] backdrop-blur-sm mb-10">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <div className="p-6 sm:p-8 border-b border-white/[0.06]">
                <h2 className="text-lg uppercase tracking-tighter font-space-grotesk text-white">
                  Payout <span className="text-gradient">History</span>
                </h2>
              </div>
              {payouts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-500 text-sm font-geist">No payout requests yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/[0.06]">
                      <tr>
                        <th className="p-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Date</th>
                        <th className="p-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Amount</th>
                        <th className="p-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Method</th>
                        <th className="p-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Status</th>
                        <th className="p-4 text-left text-[10px] uppercase tracking-widest text-neutral-500 font-geist">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="p-4 text-sm text-neutral-300 font-geist">
                            {p.requestedAt ? new Date(p.requestedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-4 text-sm text-white font-space-grotesk">{fmt(p.amountCents)}</td>
                          <td className="p-4 text-sm text-neutral-400 font-geist">{methodLabel(p.method)}</td>
                          <td className="p-4">
                            <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 font-geist ${statusBadge(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-neutral-500 font-geist max-w-[200px] truncate">{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Earnings */}
            <div className="relative bg-[#050505] border border-white/[0.06] backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <div className="p-6 sm:p-8 border-b border-white/[0.06]">
                <h2 className="text-lg uppercase tracking-tighter font-space-grotesk text-white">
                  Recent <span className="text-gradient">Earnings</span>
                </h2>
              </div>
              {earnings.recentEarnings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-neutral-500 text-sm font-geist">No earnings yet. Create and share videos to earn $1 per qualified view.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {earnings.recentEarnings.map((e) => (
                    <div key={e.id} className="p-4 sm:px-8 flex items-center justify-between hover:bg-white/[0.02]">
                      <div>
                        <p className="text-sm text-white font-geist">{e.videoTitle || 'Video'}</p>
                        <p className="text-[10px] text-neutral-500 font-geist uppercase tracking-widest mt-0.5">
                          {e.qualifiedAt ? new Date(e.qualifiedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400 font-space-grotesk">+{fmt(e.earnedCents)}</span>
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${e.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {e.paid ? 'paid' : 'pending'}
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

      {/* ── Payout Method Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative bg-[#0a0a0a] border border-white/[0.08] w-full max-w-md p-6 sm:p-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl uppercase tracking-tighter font-space-grotesk text-white mb-1">
              Request <span className="text-gradient">Payout</span>
            </h3>
            <p className="text-neutral-400 text-sm font-geist mb-6">
              Withdrawing <span className="text-white font-space-grotesk">{fmt(available)}</span>
            </p>

            {requestError && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-500/20 text-red-400 text-sm font-geist flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {requestError}
              </div>
            )}

            {/* Method selection */}
            <div className="space-y-3 mb-6">
              {[
                { id: 'stripe_connect', label: 'Stripe Connect', desc: 'Direct bank transfer (2-3 days)', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', desc: 'PayPal transfer (1-2 business days)', icon: Mail },
                { id: 'platform_credits', label: 'Platform Credits', desc: 'Apply to your AILS subscription', icon: Zap },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMethod(opt.id)}
                  className={`w-full text-left p-4 border transition-all flex items-start gap-4 ${
                    method === opt.id
                      ? 'bg-purple-500/10 border-purple-500/40'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    method === opt.id
                      ? 'bg-gradient-to-br from-purple-600 to-violet-600'
                      : 'bg-white/[0.05] border border-white/[0.08]'
                  }`}>
                    <opt.icon className={`w-4 h-4 ${method === opt.id ? 'text-white' : 'text-neutral-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-space-grotesk ${method === opt.id ? 'text-white' : 'text-neutral-300'}`}>{opt.label}</p>
                    <p className="text-xs text-neutral-500 font-geist mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* PayPal email input */}
            {method === 'paypal' && (
              <div className="mb-6">
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-geist mb-2">PayPal Email</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/[0.08] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 font-geist"
                />
              </div>
            )}

            <button
              onClick={handleRequest}
              disabled={requesting || (method === 'paypal' && !paypalEmail)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs uppercase tracking-widest font-geist transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
            >
              {requesting ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><ArrowDownToLine className="w-4 h-4" /> Confirm Payout Request</>
              )}
            </button>

            <p className="text-[10px] text-neutral-600 font-geist text-center mt-4 uppercase tracking-widest">
              Minimum payout: {fmt(earnings.minPayoutCents)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
