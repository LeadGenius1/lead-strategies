// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT FRONTEND API CLIENT
// SSE streaming + REST wrappers for the assistant endpoints.
// ═══════════════════════════════════════════════════════════════

import api from '@/lib/api';
import Cookies from 'js-cookie';

const BASE = '/api/v1/assistant';

/**
 * Stream chat via POST with SSE parsing.
 * @param {string} message
 * @param {string} sessionId
 * @param {(event: { type: string, data: object }) => void} onEvent
 * @returns {Promise<void>}
 */
export async function streamChat(message, sessionId, onEvent) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
  const token = Cookies.get('token') || Cookies.get('admin_token');

  const response = await fetch(`${apiUrl}${BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Chat request failed' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer

    let currentEvent = null;

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ') && currentEvent) {
        try {
          const data = JSON.parse(line.slice(6));
          onEvent({ type: currentEvent, data });
        } catch {
          // Skip malformed JSON
        }
        currentEvent = null;
      } else if (line === '') {
        currentEvent = null;
      }
    }
  }
}

/**
 * Get context-aware greeting.
 */
export async function getGreeting() {
  const { data } = await api.get(`${BASE}/greeting`);
  return data;
}

/**
 * Create a new conversation session.
 */
export async function createConversation() {
  const { data } = await api.post(`${BASE}/conversation`);
  return data;
}

/**
 * List user's conversation sessions.
 */
export async function getConversations() {
  const { data } = await api.get(`${BASE}/conversations`);
  return data;
}

/**
 * Get messages for a specific session.
 */
export async function getConversation(sessionId) {
  const { data } = await api.get(`${BASE}/conversation/${sessionId}`);
  return data;
}

/**
 * Delete a conversation session.
 */
export async function deleteConversation(sessionId) {
  const { data } = await api.delete(`${BASE}/conversation/${sessionId}`);
  return data;
}
