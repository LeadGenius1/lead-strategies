'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useAssistant from '@/lib/assistant/useAssistant';
import { uploadFile } from '@/lib/assistant/api';

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

const ACCEPTED_FILE_TYPES = '.pdf,.docx,.csv,.xlsx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp';

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

function FilePill({ filename, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {filename}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 hover:text-red-400 transition-colors">&times;</button>
      )}
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
        {/* File attachment pills */}
        {msg.files?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {msg.files.map((f, i) => (
              <FilePill key={i} filename={typeof f === 'string' ? f : f.filename} />
            ))}
          </div>
        )}

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
    sessionId,
    isStreaming,
    suggestions,
    error,
    send,
    newConversation,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState([]); // [{ id, filename }]
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    try {
      const result = await uploadFile(file, sessionId);
      if (result.success) {
        setAttachedFiles((prev) => [...prev, { id: result.file.id, filename: result.file.filename }]);
      }
    } catch (err) {
      console.error('[AssistantChat] Upload error:', err.message);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [uploading, sessionId]);

  const removeFile = useCallback((index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    const fileIds = attachedFiles.map((f) => f.id);
    send(input.trim(), fileIds.length ? { fileIds } : undefined);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, send, attachedFiles]);

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

      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1 px-2 pb-1">
          {attachedFiles.map((f, i) => (
            <FilePill key={f.id} filename={f.filename} onRemove={() => removeFile(i)} />
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/[0.06] p-2">
        <div className="flex items-end gap-1.5">
          {/* Paperclip upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || uploading}
            className="px-1.5 py-1.5 text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            title="Attach file"
          >
            {uploading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileSelect}
            className="hidden"
          />
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
