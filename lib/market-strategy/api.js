// Market Strategy Pipeline — API Client
// Uses the same Axios-based API client as the rest of the frontend (lib/api.js)
// SSE uses native EventSource with cookie-based auth.

import api from '@/lib/api';
import Cookies from 'js-cookie';

const API_BASE = '/api/v1/market-strategy';

/**
 * Create a new market strategy job.
 * @param {{ targetMarket: string, icp: string, competitors: string[], offer: string, budgetRange: string, platforms: string[], notes?: string }} input
 * @returns {Promise<{ success: boolean, jobId: string }>}
 */
export async function createJob(input) {
  const res = await api.post(API_BASE, input);
  return res.data;
}

/**
 * Get full job status + all agent outputs.
 * @param {string} jobId
 * @returns {Promise<object>}
 */
export async function getJobStatus(jobId) {
  const res = await api.get(`${API_BASE}/${jobId}`);
  return res.data;
}

/**
 * Retry failed agents on a partial/failed job.
 * @param {string} jobId
 * @returns {Promise<object>}
 */
export async function retryJob(jobId) {
  const res = await api.post(`${API_BASE}/${jobId}/retry`);
  return res.data;
}

/**
 * Cancel a running job.
 * @param {string} jobId
 * @returns {Promise<object>}
 */
export async function cancelJob(jobId) {
  const res = await api.delete(`${API_BASE}/${jobId}`);
  return res.data;
}

/**
 * List user's past strategy runs.
 * @returns {Promise<{ success: boolean, jobs: object[] }>}
 */
export async function getHistory() {
  const res = await api.get(`${API_BASE}/history`);
  return res.data;
}

/**
 * Get aggregated cost data.
 * @param {{ startDate?: string, endDate?: string }} params
 * @returns {Promise<object>}
 */
export async function getCosts(params = {}) {
  const res = await api.get(`${API_BASE}/costs`, { params });
  return res.data;
}

/**
 * Open an SSE stream for real-time job progress.
 * Uses native EventSource with cookie-based JWT auth.
 *
 * @param {string} jobId
 * @param {(event: object) => void} onEvent - Called for each parsed SSE event
 * @returns {{ close: () => void }}
 */
export function openSSEStream(jobId, onEvent) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
  const token = Cookies.get('token') || Cookies.get('admin_token');
  const url = `${apiUrl}${API_BASE}/${jobId}/stream${token ? `?token=${token}` : ''}`;

  const eventSource = new EventSource(url, { withCredentials: true });

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);

      // Auto-close on job completion
      if (data.type === 'job_complete') {
        eventSource.close();
      }
    } catch {
      // Ignore parse errors (heartbeats, etc.)
    }
  };

  eventSource.onerror = () => {
    // EventSource auto-reconnects; surface error to caller
    onEvent({ type: 'sse_error', message: 'Connection lost, reconnecting...' });
  };

  return {
    close: () => eventSource.close(),
  };
}
