'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import FeedCard from './FeedCard';

// ── Helpers ─────────────────────────────────────────────────────────

function groupByDay(items) {
  const groups = [];
  let currentLabel = null;

  for (const item of items) {
    const label = dayLabel(item.ts);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, items: [] });
    }
    groups[groups.length - 1].items.push(item);
  }

  return groups;
}

function dayLabel(ts) {
  if (!ts) return 'Unknown';
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (today - itemDay) / 86400000;

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ── LiveFeed Component ──────────────────────────────────────────────

export default function LiveFeed({ feedItems, approvalMode, onApprove, onReject }) {
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showJump, setShowJump] = useState(false);
  const prevCountRef = useRef(feedItems.length);

  // Auto-scroll to top when new items arrive (newest-first)
  useEffect(() => {
    if (autoScroll && feedItems.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevCountRef.current = feedItems.length;
  }, [feedItems.length, autoScroll]);

  // Detect manual scroll → pause auto-scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop } = scrollRef.current;
    const isAtTop = scrollTop < 50;
    setAutoScroll(isAtTop);
    setShowJump(!isAtTop);
  }, []);

  const jumpToLatest = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setAutoScroll(true);
    setShowJump(false);
  };

  const groups = groupByDay(feedItems);

  // Empty state
  if (feedItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🚀</p>
          <p className="text-sm text-neutral-400 mb-1">No activity yet</p>
          <p className="text-xs text-neutral-600">
            When your agents start running, their activity will appear here in real-time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative min-h-0">
      {/* Scrollable feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {groups.map((group) => (
          <div key={group.label}>
            {/* Day separator */}
            <div className="sticky top-0 z-10 flex items-center gap-3 py-2 bg-[#050505]/80 backdrop-blur-sm">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium">
                {group.label}
              </span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {group.items.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  approvalMode={approvalMode}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Jump to latest pill */}
      {showJump && (
        <button
          onClick={jumpToLatest}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-400 hover:bg-cyan-500/30 transition-colors backdrop-blur-sm"
        >
          Jump to latest
        </button>
      )}
    </div>
  );
}
