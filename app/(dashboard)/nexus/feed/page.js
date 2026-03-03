'use client';

import { useSchedulerFeed } from '@/lib/scheduler/useSchedulerFeed';
import StrategyBar from '../cockpit/components/StrategyBar';
import LiveFeed from '../cockpit/components/LiveFeed';

export default function NexusFeedPage() {
  const {
    profile,
    schedule,
    feedItems,
    stats,
    isConnected,
    isReconnecting,
    error,
    loading,
    approveOutput,
    rejectOutput,
  } = useSchedulerFeed();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Completed" value={stats.completed} color="emerald" />
        <StatCard label="Pending" value={stats.pending} color="amber" />
        <StatCard label="Drafts" value={stats.drafts} color="indigo" />
        <StatCard label="Cost Today" value={`$${stats.costToday.toFixed(2)}`} color="neutral" />
      </div>

      {/* Strategy Bar */}
      <StrategyBar
        profile={profile}
        schedule={schedule}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* Live Feed */}
      <div className="flex-1 min-h-0" style={{ height: 'calc(100vh - 340px)' }}>
        <LiveFeed
          feedItems={feedItems}
          approvalMode={schedule?.approvalMode}
          onApprove={approveOutput}
          onReject={rejectOutput}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    emerald: 'border-emerald-500/20 text-emerald-400',
    amber: 'border-amber-500/20 text-amber-400',
    indigo: 'border-indigo-500/20 text-indigo-400',
    neutral: 'border-white/10 text-neutral-300',
  };
  return (
    <div className={`rounded-lg border ${colors[color] || colors.neutral} bg-white/[0.02] px-4 py-3`}>
      <p className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}
