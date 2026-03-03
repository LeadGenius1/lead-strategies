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
  const token = Cookies.get('token') || Cookies.get('admin_token');
  const url = `${apiUrl}${BASE}/feed${token ? `?token=${token}` : ''}`;

  const es = new EventSource(url, { withCredentials: true });

  // Register a listener for each named event type
  SSE_EVENTS.forEach((eventType) => {
    es.addEventListener(eventType, (e) => {
      try {
        const data = JSON.parse(e.data);
        onEvent({ ...data, type: eventType });
      } catch {
        // ignore parse errors (e.g. heartbeat with no JSON body)
        if (eventType === 'heartbeat') {
          onEvent({ type: 'heartbeat', ts: new Date().toISOString() });
        }
      }
    });
  });

  es.onopen = () => {
    onEvent({ type: '_connected', ts: new Date().toISOString() });
  };

  es.onerror = () => {
    onEvent({ type: '_error', message: 'Connection lost, reconnecting...' });
  };

  return {
    close: () => es.close(),
  };
}
