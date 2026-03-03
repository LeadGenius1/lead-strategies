'use client';
// ── useSchedulerFeed — Single source of truth for the Cockpit ───────
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  TASKS,
  ALL_TASK_IDS,
  TASK_STATUS,
  EVENT_CARD_MAP,
  OUTPUT_CARD_MAP,
  CARD_TYPE,
  FEED_MAX_ITEMS,
} from './constants';
import {
  getSchedule,
  getHistory,
  getBusinessProfile,
  openFeedStream,
  triggerTask as apiTriggerTask,
  updateTask as apiUpdateTask,
  approveOutput as apiApproveOutput,
  rejectOutput as apiRejectOutput,
} from './api';

// ── Helpers ─────────────────────────────────────────────────────────

function buildInitialStatuses() {
  const m = {};
  ALL_TASK_IDS.forEach((id) => { m[id] = TASK_STATUS.IDLE; });
  return m;
}

function feedItemFromEvent(event) {
  const cardType =
    event.type === 'task_output'
      ? (OUTPUT_CARD_MAP[event.taskId] || CARD_TYPE.RESULT)
      : (EVENT_CARD_MAP[event.type] || CARD_TYPE.STATUS);

  return {
    id: `${event.type}-${event.taskId || 'sys'}-${event.ts || Date.now()}`,
    cardType,
    ...event,
  };
}

function historyToFeedItems(history) {
  return (history || []).map((run) => ({
    id: `history-${run.taskId}-${run.runId}`,
    cardType: run.status === 'failed' ? CARD_TYPE.ALERT : CARD_TYPE.RESULT,
    type: run.status === 'failed' ? 'task_failed' : 'task_complete',
    taskId: run.taskId,
    taskName: run.taskName || TASKS[run.taskId]?.name,
    taskIcon: run.taskIcon || TASKS[run.taskId]?.icon,
    ts: run.completedAt,
    costUsd: run.costUsd,
    status: run.status,
    runId: run.runId,
  }));
}

// ── Hook ────────────────────────────────────────────────────────────

export function useSchedulerFeed() {
  // State
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [feedItems, setFeedItems] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState(buildInitialStatuses);
  const [stats, setStats] = useState({ completed: 0, pending: 0, drafts: 0, costToday: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs
  const sseRef = useRef(null);
  const feedRef = useRef([]);  // mirror of feedItems for non-stale access in callbacks

  // ── Add item to feed (newest first, capped) ──────────────────────
  const pushFeedItem = useCallback((item) => {
    feedRef.current = [item, ...feedRef.current].slice(0, FEED_MAX_ITEMS);
    setFeedItems(feedRef.current);
  }, []);

  // ── SSE event handler ────────────────────────────────────────────
  const handleEvent = useCallback((event) => {
    switch (event.type) {
      case '_connected':
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        break;

      case '_error':
        setIsConnected(false);
        setIsReconnecting(true);
        break;

      case 'heartbeat':
        setIsConnected(true);
        setIsReconnecting(false);
        break;

      case 'task_queued':
        setTaskStatuses((prev) => ({ ...prev, [event.taskId]: TASK_STATUS.QUEUED }));
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'task_start':
        setTaskStatuses((prev) => ({ ...prev, [event.taskId]: TASK_STATUS.RUNNING }));
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'task_progress':
        // Update the latest status card for this task instead of adding a new one
        feedRef.current = feedRef.current.map((item) =>
          item.taskId === event.taskId && item.type === 'task_start'
            ? { ...item, progress: event.progress, message: event.message }
            : item
        );
        setFeedItems([...feedRef.current]);
        break;

      case 'task_complete':
        setTaskStatuses((prev) => ({ ...prev, [event.taskId]: TASK_STATUS.COMPLETED }));
        setStats((prev) => ({
          ...prev,
          completed: prev.completed + 1,
          costToday: prev.costToday + (event.costUsd || 0),
        }));
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'task_failed':
        setTaskStatuses((prev) => ({ ...prev, [event.taskId]: TASK_STATUS.FAILED }));
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'task_output':
        if (OUTPUT_CARD_MAP[event.taskId] === CARD_TYPE.DRAFT) {
          setStats((prev) => ({ ...prev, drafts: prev.drafts + 1 }));
        }
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'schedule_update':
        refreshSchedule();
        pushFeedItem(feedItemFromEvent(event));
        break;

      case 'daily_summary':
        pushFeedItem(feedItemFromEvent(event));
        break;

      default:
        break;
    }
  }, [pushFeedItem]);

  // ── Load initial data ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [profileRes, scheduleRes, historyRes] = await Promise.allSettled([
          getBusinessProfile(),
          getSchedule(),
          getHistory(7),
        ]);

        if (cancelled) return;

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value?.data || profileRes.value);
        }

        if (scheduleRes.status === 'fulfilled') {
          const sched = scheduleRes.value;
          setSchedule(sched);
          setStats({
            completed: sched.todayStats?.tasksCompleted || 0,
            pending: sched.todayStats?.tasksPending || 0,
            drafts: sched.todayStats?.draftsAwaitingReview || 0,
            costToday: sched.todayStats?.costToday || 0,
          });
          // Set task statuses from schedule
          if (sched.tasks) {
            const statuses = { ...buildInitialStatuses() };
            sched.tasks.forEach((t) => {
              statuses[t.taskId] = t.status === 'active' ? TASK_STATUS.IDLE : TASK_STATUS.PAUSED;
            });
            setTaskStatuses(statuses);
          }
        }

        if (historyRes.status === 'fulfilled' && historyRes.value?.history) {
          const items = historyToFeedItems(historyRes.value.history);
          feedRef.current = items.slice(0, FEED_MAX_ITEMS);
          setFeedItems(feedRef.current);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load cockpit data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // ── Open SSE feed after initial load ──────────────────────────────
  useEffect(() => {
    if (loading) return;

    const stream = openFeedStream(handleEvent);
    sseRef.current = stream;

    return () => {
      stream.close();
      sseRef.current = null;
    };
  }, [loading, handleEvent]);

  // ── Actions ───────────────────────────────────────────────────────
  const triggerTask = useCallback(async (taskId) => {
    try {
      await apiTriggerTask(taskId);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const pauseTask = useCallback(async (taskId) => {
    try {
      await apiUpdateTask(taskId, 'pause');
      setTaskStatuses((prev) => ({ ...prev, [taskId]: TASK_STATUS.PAUSED }));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const resumeTask = useCallback(async (taskId) => {
    try {
      await apiUpdateTask(taskId, 'resume');
      setTaskStatuses((prev) => ({ ...prev, [taskId]: TASK_STATUS.IDLE }));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const approveOutput = useCallback(async (outputId) => {
    try {
      await apiApproveOutput(outputId);
      // Update the feed item to show approved
      feedRef.current = feedRef.current.map((item) =>
        item.outputKey === outputId ? { ...item, approved: true } : item
      );
      setFeedItems([...feedRef.current]);
      setStats((prev) => ({ ...prev, drafts: Math.max(0, prev.drafts - 1) }));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const rejectOutput = useCallback(async (outputId, reason) => {
    try {
      await apiRejectOutput(outputId, reason);
      feedRef.current = feedRef.current.map((item) =>
        item.outputKey === outputId ? { ...item, rejected: true } : item
      );
      setFeedItems([...feedRef.current]);
      setStats((prev) => ({ ...prev, drafts: Math.max(0, prev.drafts - 1) }));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, []);

  const refreshSchedule = useCallback(async () => {
    try {
      const sched = await getSchedule();
      setSchedule(sched);
    } catch {
      // silent — non-critical
    }
  }, []);

  return {
    // Data
    profile,
    schedule,
    feedItems,
    taskStatuses,
    stats,
    // Connection
    isConnected,
    isReconnecting,
    error,
    loading,
    // Actions
    triggerTask,
    pauseTask,
    resumeTask,
    approveOutput,
    rejectOutput,
    refreshSchedule,
  };
}
