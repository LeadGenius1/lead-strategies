// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — useAssistant HOOK
// React hook managing chat state, streaming, and conversations.
// ═══════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  streamChat,
  getGreeting,
  createConversation,
  getConversation,
} from './api';

/**
 * @typedef {{ role: 'user' | 'assistant', content: string, toolCalls?: Array, isStreaming?: boolean }} Message
 */

export default function useAssistant() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const sessionInitRef = useRef(false);

  // Initialize session + greeting on mount
  useEffect(() => {
    if (sessionInitRef.current) return;
    sessionInitRef.current = true;

    const STORAGE_KEY = 'lead-hunter-sessionId';

    (async () => {
      try {
        // Reuse existing session from localStorage (preserves file uploads across refreshes)
        let existingId = null;
        try { existingId = localStorage.getItem(STORAGE_KEY); } catch {}

        if (existingId) {
          setSessionId(existingId);

          // Try to reload conversation history
          try {
            const data = await getConversation(existingId);
            if (data.messages?.length > 0) {
              setMessages(
                data.messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                  toolCalls: m.toolCalls || [],
                }))
              );
              // Load greeting for suggestions
              const greetingData = await getGreeting();
              setSuggestions(greetingData.suggestions || []);
              return;
            }
          } catch {
            // Session may have been deleted or invalid — fall through to create new
          }
        }

        // Create fresh session
        const { sessionId: newId } = await createConversation();
        setSessionId(newId);
        try { localStorage.setItem(STORAGE_KEY, newId); } catch {}

        // Load greeting
        const greetingData = await getGreeting();
        setGreeting(greetingData.greeting);
        setSuggestions(greetingData.suggestions || []);

        // Add greeting as first assistant message
        setMessages([
          {
            role: 'assistant',
            content: greetingData.greeting,
            toolCalls: [],
          },
        ]);
      } catch (err) {
        console.error('[useAssistant] Init error:', err.message);
        setError('Failed to initialize assistant');
        // Fallback session ID
        const fallbackId = crypto.randomUUID();
        setSessionId(fallbackId);
        try { localStorage.setItem(STORAGE_KEY, fallbackId); } catch {}
        setMessages([
          {
            role: 'assistant',
            content: 'Ready to help. What do you need?',
            toolCalls: [],
          },
        ]);
      }
    })();
  }, []);

  /**
   * Send a message and stream the response.
   * @param {string} text
   * @param {{ fileIds?: string[] }} [opts]
   */
  const send = useCallback(
    async (text, opts) => {
      if (!text?.trim() || !sessionId || isStreaming) return;
      setError(null);

      const userMsg = { role: 'user', content: text.trim(), toolCalls: [], files: opts?.fileIds || [] };
      const assistantMsg = { role: 'assistant', content: '', toolCalls: [], isStreaming: true };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
        const fileIds = opts?.fileIds;
        await streamChat(text.trim(), sessionId, (event) => {
          switch (event.type) {
            case 'token':
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  last.content += event.data.text;
                }
                return updated;
              });
              break;

            case 'tool_start':
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  last.toolCalls = [
                    ...(last.toolCalls || []),
                    { tool: event.data.tool, status: 'running', toolUseId: event.data.toolUseId },
                  ];
                }
                return updated;
              });
              break;

            case 'tool_result':
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant' && last.toolCalls) {
                  const tc = last.toolCalls.find((t) => t.toolUseId === event.data.toolUseId);
                  if (tc) {
                    tc.status = event.data.success ? 'done' : 'failed';
                  }
                }
                return updated;
              });
              break;

            case 'done':
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  last.isStreaming = false;
                }
                return updated;
              });
              break;

            case 'error':
              setError(event.data.message || 'Stream error');
              break;
          }
        }, { fileIds });
      } catch (err) {
        console.error('[useAssistant] Send error:', err.message);
        setError(err.message);
        // Mark streaming as done on the last message
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            last.isStreaming = false;
            if (!last.content) {
              last.content = 'Something went wrong. Try again.';
            }
          }
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, isStreaming]
  );

  /**
   * Load an existing conversation by session ID.
   */
  const loadConversation = useCallback(async (id) => {
    try {
      setError(null);
      const data = await getConversation(id);
      setSessionId(id);
      try { localStorage.setItem('lead-hunter-sessionId', id); } catch {}
      setMessages(
        data.messages.map((m) => ({
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls || [],
        }))
      );
    } catch (err) {
      console.error('[useAssistant] Load error:', err.message);
      setError('Failed to load conversation');
    }
  }, []);

  /**
   * Start a new conversation.
   */
  const newConversation = useCallback(async () => {
    try {
      setError(null);
      const { sessionId: newId } = await createConversation();
      setSessionId(newId);
      try { localStorage.setItem('lead-hunter-sessionId', newId); } catch {}

      const greetingData = await getGreeting();
      setGreeting(greetingData.greeting);
      setSuggestions(greetingData.suggestions || []);
      setMessages([
        {
          role: 'assistant',
          content: greetingData.greeting,
          toolCalls: [],
        },
      ]);
    } catch (err) {
      console.error('[useAssistant] New conversation error:', err.message);
      setError('Failed to create new conversation');
    }
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    greeting,
    suggestions,
    error,
    send,
    loadConversation,
    newConversation,
  };
}
