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
export async function streamChat(message, sessionId, onEvent, { fileIds } = {}) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
  const token = Cookies.get('token') || Cookies.get('admin_token');

  const body = { message, sessionId };
  if (fileIds?.length) body.fileIds = fileIds;

  const response = await fetch(`${apiUrl}${BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
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

/**
 * Upload a file for the assistant.
 * @param {File} file
 * @param {string} [sessionId]
 * @returns {Promise<{ success: boolean, file: { id: string, filename: string, size: number, extractedText: string|null } }>}
 */
export async function uploadFile(file, sessionId) {
  const formData = new FormData();
  formData.append('file', file);
  if (sessionId) formData.append('sessionId', sessionId);

  const { data } = await api.post(`${BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * Get all memories for the current user.
 */
export async function getMemories(category) {
  const params = category ? { category } : {};
  const { data } = await api.get(`${BASE}/memories`, { params });
  return data;
}

/**
 * Delete a specific memory.
 */
export async function deleteMemory(memoryId) {
  const { data } = await api.delete(`${BASE}/memories/${memoryId}`);
  return data;
}

/**
 * Clear all memories.
 */
export async function clearMemories() {
  const { data } = await api.delete(`${BASE}/memories`);
  return data;
}

// ─── MCP Integration API ───────────────────────────────

const MCP_BASE = '/api/v1/mcp';

/**
 * List available MCP providers.
 */
export async function getMcpProviders() {
  const { data } = await api.get(`${MCP_BASE}/providers`);
  return data;
}

/**
 * List user's MCP connections.
 */
export async function getMcpConnections() {
  const { data } = await api.get(`${MCP_BASE}/connections`);
  return data;
}

/**
 * Connect an MCP provider.
 */
export async function connectMcpProvider(providerId, config) {
  const { data } = await api.post(`${MCP_BASE}/connect`, { providerId, config });
  return data;
}

/**
 * Disconnect an MCP provider.
 */
export async function disconnectMcpProvider(connectionId) {
  const { data } = await api.delete(`${MCP_BASE}/connections/${connectionId}`);
  return data;
}

// ─── Social OAuth API ─────────────────────────────────

/**
 * Get social channel connections (Facebook, Instagram, LinkedIn, Twitter).
 */
export async function getSocialConnections() {
  const { data } = await api.get(`${MCP_BASE}/social/connections`);
  return data;
}

/**
 * Get OAuth authorize URL for a social platform.
 */
export async function getSocialAuthUrl(platform, returnTo = '/nexus/settings') {
  const { data } = await api.get(`${MCP_BASE}/social/authorize/${platform}`, {
    params: { returnTo },
  });
  return data;
}

/**
 * Disconnect a social channel.
 */
export async function disconnectSocialChannel(platform) {
  const { data } = await api.delete(`${MCP_BASE}/social/connections/${platform}`);
  return data;
}
