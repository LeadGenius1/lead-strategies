// ── Scheduler API Client ────────────────────────────────────────────
import api from '@/lib/api';
import Cookies from 'js-cookie';
import { SSE_EVENTS } from './constants';

const BASE = '/api/v1/scheduler';

// ── REST wrappers ───────────────────────────────────────────────────

export async function getSchedule() {
  const res = await api.get(BASE);
  return res.data;
}

export async function getHistory(days = 7) {
  const res = await api.get(`${BASE}/history`, { params: { days } });
  return res.data;
}

export async function triggerTask(taskId) {
  const res = await api.post(`${BASE}/trigger/${taskId}`);
  return res.data;
}

export async function updateTask(taskId, action) {
  const res = await api.put(`${BASE}/task/${taskId}`, { action });
  return res.data;
}

export async function getTaskOutput(taskId) {
  const res = await api.get(`${BASE}/outputs/${taskId}`);
  return res.data;
}

export async function approveOutput(outputId) {
  const res = await api.post(`${BASE}/approve/${encodeURIComponent(outputId)}`);
  return res.data;
}

export async function rejectOutput(outputId, reason = '') {
  const res = await api.post(`${BASE}/reject/${encodeURIComponent(outputId)}`, { reason });
  return res.data;
}

export async function getBusinessProfile() {
  const res = await api.get('/api/v1/business-profile');
  return res.data;
}

// ── Execution API wrappers ──────────────────────────────────────────

const EXEC_BASE = '/api/v1/execution';

export async function getExecutionHistory(limit = 50) {
  const res = await api.get(`${EXEC_BASE}/history`, { params: { limit } });
  return res.data;
}

export async function retryExecution(execId) {
  const res = await api.post(`${EXEC_BASE}/retry/${encodeURIComponent(execId)}`);
  return res.data;
}

export async function getPlatformStatus() {
  const res = await api.get(`${EXEC_BASE}/platforms`);
  return res.data;
}

// ── SSE Feed Stream ─────────────────────────────────────────────────
// Backend sends named events (event: task_start\n), so we must use
// addEventListener per type — NOT onmessage (which only catches unnamed events).

export function openFeedStream(onEvent) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
  let es = null;
  let closed = false;
  let retryCount = 0;
  let retryTimer = null;
  const MAX_RETRIES = 10;
  const BASE_DELAY = 2000; // 2s → 4s → 8s → 16s → 32s cap

  function connect() {
    if (closed) return;

    const token = Cookies.get('token') || Cookies.get('admin_token');
    if (!token) {
      onEvent({ type: '_error', message: 'No auth token — please log in again' });
      return;
    }

    const url = `${apiUrl}${BASE}/feed?token=${token}`;
    es = new EventSource(url, { withCredentials: true });

    // Register a listener for each named event type
    SSE_EVENTS.forEach((eventType) => {
      es.addEventListener(eventType, (e) => {
        try {
          const data = JSON.parse(e.data);
          onEvent({ ...data, type: eventType });
        } catch {
          if (eventType === 'heartbeat') {
            onEvent({ type: 'heartbeat', ts: new Date().toISOString() });
          }
        }
      });
    });

    es.onopen = () => {
      retryCount = 0; // reset on successful connection
      onEvent({ type: '_connected', ts: new Date().toISOString() });
    };

    es.onerror = () => {
      onEvent({ type: '_error', message: 'Connection lost, reconnecting...' });
      // Close the broken EventSource so it doesn't keep retrying internally
      es.close();

      if (closed || retryCount >= MAX_RETRIES) return;
      retryCount++;
      const delay = Math.min(BASE_DELAY * Math.pow(2, retryCount - 1), 32000);
      retryTimer = setTimeout(connect, delay);
    };
  }

  connect();

  return {
    close: () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (es) es.close();
    },
  };
}
