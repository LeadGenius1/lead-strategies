'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useAssistant from '@/lib/assistant/useAssistant';

const PLACEHOLDER_COMMANDS = [
  'Run content generator now...',
  'How are my campaigns doing?',
  'Generate a LinkedIn post about...',
  'Pause competitor watch',
  'Research my target market...',
  'Check email sender health',
  'Update my ICP to...',
  'Show today\'s results',
];

function ToolPill({ tool, status }) {
  const isRunning = status === 'running';
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
        isRunning
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : status === 'failed'
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      }`}
    >
      {isRunning ? '\u26A1' : status === 'failed' ? '\u2717' : '\u2713'}
      {' '}
      {tool.replace(/_/g, ' ')}
      {isRunning && <span className="animate-pulse">...</span>}
    </span>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/20'
            : 'bg-white/[0.04] text-neutral-300 border border-white/[0.06]'
        }`}
      >
        {/* Tool pills */}
        {msg.toolCalls?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {msg.toolCalls.map((tc, i) => (
              <ToolPill key={tc.toolUseId || i} tool={tc.tool} status={tc.status} />
            ))}
          </div>
        )}

        {/* Message text */}
        <div className="whitespace-pre-wrap break-words">
          {msg.content}
          {msg.isStreaming && <span className="inline-block w-1.5 h-3.5 bg-indigo-400 ml-0.5 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function SuggestionChips({ suggestions, onSelect, disabled }) {
  if (!suggestions?.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1 mb-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="px-2 py-1 text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full hover:bg-indigo-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function AssistantChat({ profileComplete }) {
  const {
    messages,
    isStreaming,
    suggestions,
    error,
    send,
    newConversation,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_COMMANDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    send(input.trim());
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, send]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleSuggestion = useCallback(
    (text) => {
      if (isStreaming) return;
      send(text);
    },
    [isStreaming, send]
  );

  // Auto-resize textarea
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  }, []);

  return (
    <div className="rounded-xl bg-neutral-900/30 border border-white/[0.06] flex flex-col" style={{ height: '360px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Lead Hunter</span>
        </div>
        <button
          onClick={newConversation}
          className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
          title="New conversation"
        >
          + New
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (show after greeting or last assistant message) */}
      {!isStreaming && suggestions.length > 0 && messages.length <= 1 && (
        <SuggestionChips
          suggestions={suggestions}
          onSelect={handleSuggestion}
          disabled={isStreaming}
        />
      )}

      {/* FTUX: Profile CTA when incomplete */}
      {profileComplete === false && messages.length <= 1 && (
        <div className="px-2 mb-2">
          <Link
            href="/nexus/setup"
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-300 hover:bg-indigo-600/30 transition-colors"
          >
            Complete Your Profile {'\u2192'}
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-3 py-1 text-[10px] text-red-400 bg-red-500/10 border-t border-red-500/20">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] p-2">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_COMMANDS[placeholderIndex]}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-black/30 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 resize-none focus:outline-none focus:border-indigo-500/40 disabled:opacity-50 transition-colors"
            style={{ maxHeight: '80px' }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-2 py-1.5 bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 hover:bg-indigo-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isStreaming ? '...' : '\u2191'}
          </button>
        </div>
      </div>
    </div>
  );
}
