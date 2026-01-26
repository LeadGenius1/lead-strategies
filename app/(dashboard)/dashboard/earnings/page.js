'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EarningsPage() {
  const [balance, setBalance] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, payoutsRes, connectRes] = await Promise.all([
        api.get('/api/v1/payouts/balance'),
        api.get('/api/v1/payouts/history'),
        api.get('/api/v1/payouts/connect').catch(() => ({ data: { data: { connected: false } } }))
      ]);

      setBalance(balanceRes.data?.data || {});
      setPayouts(payoutsRes.data?.data?.payouts || []);
      setStripeConnected(connectRes.data?.data?.connected || false);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const res = await api.get('/api/v1/payouts/connect');
      if (res.data?.data?.onboardingUrl) {
        window.location.href = res.data.data.onboardingUrl;
      }
    } catch (err) {
      alert('Failed to connect Stripe: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert('Please enter a valid payout amount');
      return;
    }

    setRequesting(true);
    try {
      await api.post('/api/v1/payouts/request', { amount: parseFloat(payoutAmount) });
      alert('Payout requested successfully!');
      setPayoutAmount('');
      fetchData();
    } catch (err) {
      alert('Failed to request payout: ' + (err.response?.data?.error || err.message));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Earnings & Payouts</h1>
          <p className="text-neutral-400">Manage your video earnings and request payouts</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 text-sm">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${balance?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
            <p className="text-neutral-400 text-sm">All-time earnings from videos</p>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-neutral-400 text-sm">Available Balance</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${balance?.balanceAvailable?.toFixed(2) || '0.00'}
            </p>
            <p className="text-neutral-400 text-sm">Ready for payout</p>
          </div>
        </div>

        {/* Stripe Connect */}
        {!stripeConnected && (
          <div className="bg-neutral-900 rounded-xl border border-yellow-500/30 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-2">Connect Stripe to Receive Payouts</h3>
                <p className="text-neutral-400 text-sm">
                  Complete Stripe Connect onboarding to enable payouts
                </p>
              </div>
              <button
                onClick={handleConnectStripe}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
              >
                Connect Stripe
              </button>
            </div>
          </div>
        )}

        {/* Request Payout */}
        {stripeConnected && balance?.balanceAvailable > 0 && (
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 mb-8">
            <h3 className="text-white font-medium mb-4">Request Payout</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder={`Max: $${balance?.balanceAvailable?.toFixed(2)}`}
                max={balance?.balanceAvailable}
                min="1"
                step="0.01"
                className="flex-1 px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleRequestPayout}
                disabled={requesting || !payoutAmount}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
              >
                {requesting ? 'Processing...' : 'Request Payout'}
              </button>
            </div>
          </div>
        )}

        {/* Payout History */}
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <h3 className="text-white font-medium mb-4">Payout History</h3>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              No payouts yet
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {payout.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : payout.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        ${parseFloat(payout.amount).toFixed(2)} {payout.currency}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payout.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      payout.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
