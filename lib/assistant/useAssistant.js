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

    (async () => {
      try {
        // Create fresh session
        const { sessionId: newId } = await createConversation();
        setSessionId(newId);

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
        setSessionId(crypto.randomUUID());
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
   */
  const send = useCallback(
    async (text) => {
      if (!text?.trim() || !sessionId || isStreaming) return;
      setError(null);

      const userMsg = { role: 'user', content: text.trim(), toolCalls: [] };
      const assistantMsg = { role: 'assistant', content: '', toolCalls: [], isStreaming: true };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      try {
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
        });
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
