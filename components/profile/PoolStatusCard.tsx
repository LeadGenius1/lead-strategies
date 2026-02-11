'use client';

import { Zap, Shield, TrendingUp, Calendar, XCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  WARMING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAUSED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DISCONNECTED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface PoolStatusCardProps {
  subscription: {
    id: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    totalDailyLimit: number;
    poolSize: number;
  };
  accounts: Array<{
    id: string;
    email: string;
    status: 'ACTIVE' | 'WARMING' | 'PAUSED' | 'DISCONNECTED' | 'ERROR';
    reputationScore: number;
    dailySentCount: number;
    dailyLimit: number;
    warmupCurrentDay: number;
    poolRotationOrder: number | null;
  }>;
  onCancel: () => void;
}

export default function PoolStatusCard({ subscription, accounts, onCancel }: PoolStatusCardProps) {
  const totalSent = accounts.reduce((sum, a) => sum + a.dailySentCount, 0);
  const avgReputation =
    accounts.length > 0
      ? Math.round(accounts.reduce((sum, a) => sum + a.reputationScore, 0) / accounts.length)
      : 0;

  return (
    <div className="bg-purple-500/[0.03] border border-purple-500/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Managed Pool Status</h3>
        </div>
        {subscription.cancelAtPeriodEnd && (
          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
            Canceling
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{totalSent}</div>
          <div className="text-[10px] text-white/40 mt-0.5">/ {subscription.totalDailyLimit} today</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div className="text-lg font-semibold text-white">{accounts.length}</div>
          <div className="text-[10px] text-white/40 mt-0.5">Rotating Emails</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 text-center">
          <div
            className={`text-lg font-semibold ${
              avgReputation >= 80 ? 'text-green-400' : avgReputation >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}
          >
            {avgReputation}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">Avg Reputation</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {accounts.map((account, i) => (
          <div
            key={account.id}
            className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-4">#{account.poolRotationOrder || i + 1}</span>
              <span className="text-xs text-white/70 font-mono">{account.email}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[account.status] || STATUS_COLORS.DISCONNECTED}`}>
                {account.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/40">
              <span
                className={`flex items-center gap-1 ${
                  account.reputationScore >= 80 ? 'text-green-400' : account.reputationScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}
              >
                <Shield className="w-3 h-3" />
                {account.reputationScore}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {account.dailySentCount}/{account.dailyLimit}
              </span>
              {account.status === 'WARMING' && <span>Day {account.warmupCurrentDay}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="text-xs text-white/40">
          {subscription.cancelAtPeriodEnd ? (
            <span className="text-orange-400">
              Access until{' '}
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : 'end of period'}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Renews{' '}
              {subscription.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : 'monthly'}
            </span>
          )}
        </div>
        {!subscription.cancelAtPeriodEnd && (
          <button
            onClick={onCancel}
            className="text-xs text-red-400/50 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <XCircle className="w-3 h-3" />
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}
