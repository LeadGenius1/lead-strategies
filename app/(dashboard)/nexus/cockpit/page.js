'use client';
import { useSchedulerFeed } from '@/lib/scheduler/useSchedulerFeed';
import StrategyBar from './components/StrategyBar';
import AgentSidebar from './components/AgentSidebar';
import LiveFeed from './components/LiveFeed';

export default function CockpitPage() {
  const {
    profile,
    schedule,
    feedItems,
    taskStatuses,
    stats,
    isConnected,
    isReconnecting,
    error,
    loading,
    triggerTask,
    pauseTask,
    resumeTask,
    approveOutput,
    rejectOutput,
  } = useSchedulerFeed();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-neutral-500">Loading cockpit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-4 md:p-6 lg:p-8">
      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Strategy Bar (top) */}
      <StrategyBar
        profile={profile}
        schedule={schedule}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* Main: Sidebar + Feed */}
      <div className="flex gap-5 mt-5 flex-1 min-h-0" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Agent Sidebar (left, hidden <1024px) */}
        <AgentSidebar
          stats={stats}
          taskStatuses={taskStatuses}
          onTrigger={triggerTask}
          onPause={pauseTask}
          onResume={resumeTask}
        />

        {/* Live Feed (center, flex-1) */}
        <LiveFeed
          feedItems={feedItems}
          approvalMode={schedule?.approvalMode}
          onApprove={approveOutput}
          onReject={rejectOutput}
          profileComplete={profile?.profileComplete ?? null}
        />
      </div>
    </div>
  );
}
