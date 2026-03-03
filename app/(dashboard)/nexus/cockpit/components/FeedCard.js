'use client';
import { useState } from 'react';
import AetherCard from '@/components/aether/AetherCard';
import AetherBadge from '@/components/aether/AetherBadge';
import AetherButton from '@/components/aether/AetherButton';
import { CARD_TYPE, TASKS, TASK_COLORS, COLOR_CLASSES } from '@/lib/scheduler/constants';

// ── Time helper ─────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── StatusCard — running task with pulsing border ───────────────────

function StatusCard({ item }) {
  const color = TASK_COLORS[item.taskId] || 'indigo';
  const cc = COLOR_CLASSES[color];

  return (
    <div className={`relative rounded-xl bg-neutral-900/30 border ${cc.border} p-4 overflow-hidden animate-pulse-slow`}>
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${cc.gradient} to-transparent`} />
      <div className="flex items-center gap-3">
        <span className="text-xl">{item.taskIcon || TASKS[item.taskId]?.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {item.taskName || TASKS[item.taskId]?.name}
            </span>
            {item.type === 'task_start' || item.type === 'task_progress' ? (
              <AetherBadge variant="live">running</AetherBadge>
            ) : (
              <AetherBadge>queued</AetherBadge>
            )}
          </div>
          {item.message && (
            <p className="text-xs text-neutral-500 mt-1 truncate">{item.message}</p>
          )}
          {item.progress != null && (
            <div className="w-full bg-white/5 rounded-full h-1 mt-2">
              <div
                className={`h-1 rounded-full ${cc.bg} transition-all duration-500`}
                style={{ width: `${Math.min(100, item.progress)}%` }}
              />
            </div>
          )}
        </div>
        <span className="text-[10px] text-neutral-600 whitespace-nowrap">{timeAgo(item.ts)}</span>
      </div>
    </div>
  );
}

// ── ResultCard — completed task ─────────────────────────────────────

function ResultCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const color = TASK_COLORS[item.taskId] || 'indigo';
  const cc = COLOR_CLASSES[color];

  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4 overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${cc.gradient} to-transparent`} />
      <div className="flex items-center gap-3">
        <span className="text-xl">{item.taskIcon || TASKS[item.taskId]?.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">
              {item.taskName || TASKS[item.taskId]?.name}
            </span>
            <AetherBadge variant="success">completed</AetherBadge>
          </div>
          {item.message && (
            <p className="text-xs text-neutral-500 mt-1">{item.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.costUsd != null && (
            <span className="text-[10px] text-neutral-600">${item.costUsd.toFixed(3)}</span>
          )}
          <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
        </div>
      </div>
      {item.outputPreview && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {expanded ? '[ - ] Hide details' : '[ + ] Show details'}
          </button>
          {expanded && (
            <pre className="mt-2 text-xs text-neutral-400 whitespace-pre-wrap bg-black/30 rounded-lg p-3 border border-white/5 max-h-48 overflow-y-auto">
              {typeof item.outputPreview === 'string' ? item.outputPreview : JSON.stringify(item.outputPreview, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

// ── DraftCard — content awaiting approval ───────────────────────────

function DraftCard({ item, approvalMode, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (item.approved) {
    return (
      <div className="relative rounded-xl bg-neutral-900/30 border border-emerald-500/20 p-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="flex items-center gap-3">
          <span className="text-xl">✍️</span>
          <span className="text-sm text-white flex-1">{item.taskName || 'Content Draft'}</span>
          <AetherBadge variant="success">approved</AetherBadge>
          <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
        </div>
      </div>
    );
  }

  if (item.rejected) {
    return (
      <div className="relative rounded-xl bg-neutral-900/30 border border-red-500/20 p-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="flex items-center gap-3">
          <span className="text-xl">✍️</span>
          <span className="text-sm text-white flex-1">{item.taskName || 'Content Draft'}</span>
          <AetherBadge variant="error">rejected</AetherBadge>
          <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-indigo-500/20 p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">✍️</span>
        <span className="text-sm font-medium text-white flex-1">
          {item.taskName || 'Content Draft'}
        </span>
        {item.channel && <AetherBadge>{item.channel}</AetherBadge>}
        <AetherBadge variant="warning">review</AetherBadge>
        <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
      </div>

      {/* Content preview */}
      {item.feedMessage && (
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 mb-3">
          <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {item.feedMessage}
          </p>
        </div>
      )}
      {item.outputPreview && !item.feedMessage && (
        <div className="bg-black/30 rounded-lg p-3 border border-white/5 mb-3">
          <pre className="text-xs text-neutral-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {typeof item.outputPreview === 'string' ? item.outputPreview : JSON.stringify(item.outputPreview, null, 2)}
          </pre>
        </div>
      )}

      {/* Approval buttons (only in review mode) */}
      {approvalMode === 'review' && item.outputKey && (
        <>
          {!rejecting ? (
            <div className="flex items-center gap-2">
              <AetherButton
                variant="primary"
                onClick={() => onApprove?.(item.outputKey)}
                className="!py-1.5 !px-4 !text-xs"
              >
                Approve
              </AetherButton>
              <AetherButton
                variant="ghost"
                onClick={() => setRejecting(true)}
                className="!py-1.5 !px-4 !text-xs !text-red-400 hover:!text-red-300"
              >
                Reject
              </AetherButton>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500/30"
              />
              <AetherButton
                variant="ghost"
                onClick={() => { onReject?.(item.outputKey, reason); setRejecting(false); }}
                className="!py-1.5 !px-4 !text-xs !text-red-400"
              >
                Confirm
              </AetherButton>
              <button
                onClick={() => setRejecting(false)}
                className="text-xs text-neutral-600 hover:text-neutral-400"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── ProspectCard — found prospects ──────────────────────────────────

function ProspectCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-purple-500/20 p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <div className="flex items-center gap-3">
        <span className="text-xl">🎯</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Prospect Finder</span>
            <AetherBadge variant="success">completed</AetherBadge>
          </div>
          {item.feedMessage && (
            <p className="text-xs text-neutral-500 mt-1">{item.feedMessage}</p>
          )}
        </div>
        <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
      </div>
      {item.outputPreview && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
          >
            {expanded ? '[ - ] Hide prospects' : '[ + ] View prospects'}
          </button>
          {expanded && (
            <pre className="mt-2 text-xs text-neutral-400 whitespace-pre-wrap bg-black/30 rounded-lg p-3 border border-white/5 max-h-60 overflow-y-auto">
              {typeof item.outputPreview === 'string' ? item.outputPreview : JSON.stringify(item.outputPreview, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}

// ── ReportCard — inline stats ───────────────────────────────────────

function ReportCard({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <AetherCard hover={false} variant="indigo" className="!p-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">{item.taskIcon || TASKS[item.taskId]?.icon || '📊'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {item.taskName || TASKS[item.taskId]?.name}
            </span>
            <AetherBadge variant="success">completed</AetherBadge>
          </div>
          {item.feedMessage && (
            <p className="text-xs text-neutral-500 mt-1">{item.feedMessage}</p>
          )}
        </div>
        <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
      </div>
      {item.outputPreview && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {expanded ? '[ - ] Hide report' : '[ + ] View report'}
          </button>
          {expanded && (
            <pre className="mt-2 text-xs text-neutral-400 whitespace-pre-wrap bg-black/30 rounded-lg p-3 border border-white/5 max-h-60 overflow-y-auto">
              {typeof item.outputPreview === 'string' ? item.outputPreview : JSON.stringify(item.outputPreview, null, 2)}
            </pre>
          )}
        </>
      )}
    </AetherCard>
  );
}

// ── AlertCard — error/warning ───────────────────────────────────────

function AlertCard({ item, onDismiss }) {
  const isError = item.type === 'task_failed';
  const borderColor = isError ? 'border-red-500/30' : 'border-amber-500/30';
  const gradientColor = isError ? 'via-red-500/40' : 'via-amber-500/40';
  const textColor = isError ? 'text-red-400' : 'text-amber-400';

  return (
    <div className={`relative rounded-xl bg-neutral-900/30 border ${borderColor} p-4 overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${gradientColor} to-transparent`} />
      <div className="flex items-center gap-3">
        <span className="text-xl">{isError ? '🚨' : '⚠️'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {item.taskName || TASKS[item.taskId]?.name || 'Alert'}
            </span>
            <AetherBadge variant={isError ? 'error' : 'warning'}>
              {isError ? 'failed' : 'warning'}
            </AetherBadge>
          </div>
          <p className={`text-xs ${textColor} mt-1`}>
            {item.error || item.message || 'An error occurred'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
          {onDismiss && (
            <button onClick={onDismiss} className="text-neutral-600 hover:text-neutral-400 text-xs">
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MilestoneCard — daily summary celebration ───────────────────────

function MilestoneCard({ item }) {
  return (
    <div className="relative rounded-xl bg-neutral-900/30 border border-white/[0.06] p-4 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/60 via-purple-500/60 to-cyan-500/60" />
      <div className="flex items-center gap-3">
        <span className="text-xl">🏆</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white">Daily Summary</span>
          {item.message && (
            <p className="text-xs text-neutral-400 mt-1">{item.message}</p>
          )}
          {item.stats && (
            <div className="flex items-center gap-4 mt-2">
              {item.stats.tasksCompleted != null && (
                <span className="text-[10px] text-emerald-400">{item.stats.tasksCompleted} completed</span>
              )}
              {item.stats.tasksFailed != null && item.stats.tasksFailed > 0 && (
                <span className="text-[10px] text-red-400">{item.stats.tasksFailed} failed</span>
              )}
              {item.stats.totalCost != null && (
                <span className="text-[10px] text-neutral-500">${item.stats.totalCost.toFixed(3)} cost</span>
              )}
            </div>
          )}
        </div>
        <span className="text-[10px] text-neutral-600">{timeAgo(item.ts)}</span>
      </div>
    </div>
  );
}

// ── FeedCard Dispatcher ─────────────────────────────────────────────

export default function FeedCard({ item, approvalMode, onApprove, onReject }) {
  switch (item.cardType) {
    case CARD_TYPE.STATUS:
      return <StatusCard item={item} />;
    case CARD_TYPE.RESULT:
      return <ResultCard item={item} />;
    case CARD_TYPE.DRAFT:
      return (
        <DraftCard
          item={item}
          approvalMode={approvalMode}
          onApprove={onApprove}
          onReject={onReject}
        />
      );
    case CARD_TYPE.PROSPECT:
      return <ProspectCard item={item} />;
    case CARD_TYPE.REPORT:
      return <ReportCard item={item} />;
    case CARD_TYPE.ALERT:
      return <AlertCard item={item} />;
    case CARD_TYPE.MILESTONE:
      return <MilestoneCard item={item} />;
    default:
      return <ResultCard item={item} />;
  }
}
