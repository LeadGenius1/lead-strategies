'use client';
import AetherBadge from '@/components/aether/AetherBadge';

export default function StrategyBar({ profile, schedule, isConnected, isReconnecting }) {
  const connectionBadge = isConnected
    ? <AetherBadge variant="live">LIVE</AetherBadge>
    : isReconnecting
      ? <AetherBadge variant="warning">RECONNECTING</AetherBadge>
      : <AetherBadge variant="error">OFFLINE</AetherBadge>;

  const channels = profile?.activeChannels || [];
  const taskCount = schedule?.tasks?.length || 0;

  return (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-900/30 border border-white/[0.06] px-5 py-3 overflow-hidden">
      {/* Business info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-sm">
          {profile?.businessName?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {profile?.businessName || 'Your Business'}
          </p>
          {profile?.targetMarket && (
            <p className="text-[10px] text-neutral-500 truncate">{profile.targetMarket}</p>
          )}
        </div>
      </div>

      {/* Channel badges */}
      {channels.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5">
          {channels.slice(0, 4).map((ch) => (
            <span
              key={ch}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-400"
            >
              {ch}
            </span>
          ))}
          {channels.length > 4 && (
            <span className="text-[10px] text-neutral-600">+{channels.length - 4}</span>
          )}
        </div>
      )}

      {/* Agent count */}
      {schedule?.isActive && taskCount > 0 && (
        <span className="hidden sm:inline text-[10px] text-neutral-500 border border-white/10 rounded-md px-2 py-0.5">
          {taskCount} agents
        </span>
      )}

      {/* Connection status */}
      {connectionBadge}
    </div>
  );
}
