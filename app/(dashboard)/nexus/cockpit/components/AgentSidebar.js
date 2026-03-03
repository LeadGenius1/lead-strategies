'use client';
import AetherBadge from '@/components/aether/AetherBadge';
import AetherButton from '@/components/aether/AetherButton';
import { TASKS, ALL_TASK_IDS, TASK_STATUS, TASK_COLORS, COLOR_CLASSES } from '@/lib/scheduler/constants';

const STATUS_BADGE_MAP = {
  [TASK_STATUS.IDLE]: { variant: 'default', label: 'idle' },
  [TASK_STATUS.QUEUED]: { variant: 'warning', label: 'queued' },
  [TASK_STATUS.RUNNING]: { variant: 'live', label: 'running' },
  [TASK_STATUS.COMPLETED]: { variant: 'success', label: 'done' },
  [TASK_STATUS.FAILED]: { variant: 'error', label: 'failed' },
  [TASK_STATUS.PAUSED]: { variant: 'default', label: 'paused' },
};

function QuickStats({ stats }) {
  const items = [
    { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
    { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
    { label: 'Drafts', value: stats.drafts, color: 'text-indigo-400' },
    { label: 'Cost', value: `$${(stats.costToday || 0).toFixed(2)}`, color: 'text-neutral-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg bg-black/30 border border-white/[0.06] p-3 text-center"
        >
          <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
          <p className="text-[10px] text-neutral-600 uppercase tracking-wider">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function AgentRow({ taskId, status, onTrigger, onPause, onResume }) {
  const task = TASKS[taskId];
  if (!task) return null;

  const color = TASK_COLORS[taskId];
  const cc = COLOR_CLASSES[color] || COLOR_CLASSES.indigo;
  const badge = STATUS_BADGE_MAP[status] || STATUS_BADGE_MAP[TASK_STATUS.IDLE];
  const isPaused = status === TASK_STATUS.PAUSED;
  const isRunning = status === TASK_STATUS.RUNNING || status === TASK_STATUS.QUEUED;

  return (
    <div className="flex items-center gap-2.5 py-2 group">
      <span className="text-base flex-shrink-0">{task.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{task.name}</p>
        <p className="text-[10px] text-neutral-600">{task.schedule}</p>
      </div>
      <AetherBadge variant={badge.variant} className="!text-[9px] !px-1.5 !py-0">
        {badge.label}
      </AetherBadge>

      {/* Hover actions */}
      <div className="hidden group-hover:flex items-center gap-1">
        {!isRunning && !isPaused && (
          <button
            onClick={() => onTrigger(taskId)}
            className="text-[10px] text-cyan-400 hover:text-cyan-300"
            title="Run now"
          >
            ▶
          </button>
        )}
        {isPaused ? (
          <button
            onClick={() => onResume(taskId)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300"
            title="Resume"
          >
            ▶
          </button>
        ) : !isRunning ? (
          <button
            onClick={() => onPause(taskId)}
            className="text-[10px] text-amber-400 hover:text-amber-300"
            title="Pause"
          >
            ⏸
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AgentSidebar({
  stats,
  taskStatuses,
  onTrigger,
  onPause,
  onResume,
}) {
  return (
    <aside className="hidden lg:block w-[280px] flex-shrink-0 space-y-4">
      {/* Quick Stats */}
      <div className="rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4">
        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Today&apos;s Stats
        </h3>
        <QuickStats stats={stats} />
      </div>

      {/* Agent List */}
      <div className="rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4">
        <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Agents
        </h3>
        <div className="divide-y divide-white/5">
          {ALL_TASK_IDS.map((id) => (
            <AgentRow
              key={id}
              taskId={id}
              status={taskStatuses[id] || TASK_STATUS.IDLE}
              onTrigger={onTrigger}
              onPause={onPause}
              onResume={onResume}
            />
          ))}
        </div>
      </div>

      {/* AI Chat placeholder */}
      <div className="rounded-xl border-2 border-dashed border-white/10 p-4 text-center">
        <p className="text-sm text-neutral-600">AI Chat</p>
        <p className="text-[10px] text-neutral-700 mt-1">Coming soon</p>
      </div>
    </aside>
  );
}
