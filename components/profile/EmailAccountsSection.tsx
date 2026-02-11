'use client';

import { useState, useEffect } from 'react';
import { Mail, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import EmailTierSelector from './EmailTierSelector';
import ConnectEmailModal from './ConnectEmailModal';
import EmailAccountCard from './EmailAccountCard';
import PoolStatusCard from './PoolStatusCard';

interface EmailAccount {
  id: string;
  email: string;
  displayName: string | null;
  provider: 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'MANAGED_POOL';
  status: 'ACTIVE' | 'WARMING' | 'PAUSED' | 'DISCONNECTED' | 'ERROR';
  tier: 'FREE' | 'PRO';
  reputationScore: number;
  dailyLimit: number;
  dailySentCount: number;
  bounceRate: number;
  spamComplaintRate: number;
  lastHealthCheck: string | null;
  warmupCurrentDay: number;
  poolRotationOrder: number | null;
  createdAt: string;
}

interface PoolSubscription {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  totalDailyLimit: number;
  poolSize: number;
}

export default function EmailAccountsSection() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [poolSubscription, setPoolSubscription] = useState<PoolSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/email-accounts');
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setPoolSubscription(data.poolSubscription || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();

    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.get('pool') === 'success') {
      setTimeout(fetchAccounts, 3000);
      if (typeof window !== 'undefined') window.history.replaceState({}, '', '/profile');
    }
  }, []);

  const freeAccounts = accounts.filter((a) => a.tier === 'FREE' && a.status !== 'DISCONNECTED');
  const poolAccounts = accounts.filter((a) => a.tier === 'PRO');
  const hasActivePool = poolSubscription && ['ACTIVE', 'PAST_DUE'].includes(poolSubscription.status);
  const freeConnectedCount = accounts.filter((a) => a.tier === 'FREE' && a.status !== 'DISCONNECTED').length;

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Disconnect this email account?')) return;
    try {
      await fetch(`/api/user/email-accounts/${accountId}/disconnect`, { method: 'POST' });
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Permanently remove this email account?')) return;
    try {
      await fetch(`/api/user/email-accounts/${accountId}`, { method: 'DELETE' });
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSubscribePool = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/email-pool/subscribe', { method: 'POST' });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPool = async () => {
    if (!confirm("Cancel your Managed Email Pool? You'll keep access until the end of your billing period."))
      return;
    try {
      await fetch('/api/user/email-pool/cancel', { method: 'POST' });
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Email Sending</h2>
        </div>
        <button
          onClick={fetchAccounts}
          className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          title="Refresh"
          type="button"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400" type="button">
            ×
          </button>
        </div>
      )}

      <EmailTierSelector
        hasActivePool={!!hasActivePool}
        freeAccountCount={freeConnectedCount}
        onConnectOwn={() => setShowConnectModal(true)}
        onSubscribePool={handleSubscribePool}
        loading={loading}
      />

      {hasActivePool && poolSubscription && (
        <div className="mt-6">
          <PoolStatusCard
            subscription={poolSubscription}
            accounts={poolAccounts}
            onCancel={handleCancelPool}
          />
        </div>
      )}

      {freeAccounts.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/60">Your Email Accounts</h3>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              type="button"
            >
              <Plus className="w-3 h-3" />
              Add Another
            </button>
          </div>
          <div className="space-y-2">
            {freeAccounts.map((account) => (
              <EmailAccountCard
                key={account.id}
                account={account}
                onDisconnect={() => handleDisconnect(account.id)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
          </div>
        </div>
      )}

      {showConnectModal && (
        <ConnectEmailModal
          onClose={() => setShowConnectModal(false)}
          onSuccess={() => {
            setShowConnectModal(false);
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}
