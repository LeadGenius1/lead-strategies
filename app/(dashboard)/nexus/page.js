'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';

export default function NexusDashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await api.get('/api/v1/nexus/chat');
      if (res.data?.success) {
        setMessages(res.data.history || []);
        setSessionId(res.data.sessionId);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userMessage = input;
    setInput('');

    // Add user message optimistically
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);

    try {
      const res = await api.post('/api/v1/nexus/chat', {
        message: userMessage,
        sessionId,
      });

      if (res.data?.success) {
        setMessages(res.data.history || []);
        setSessionId(res.data.sessionId);
      }
    } catch (error) {
      console.error('Send message failed:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <h1 className="text-2xl font-bold">NEXUS MASTER AI ASSISTANT</h1>
        </div>
        <p className="text-slate-400">Autonomous Operations Manager</p>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto">
        {/* Messages */}
        <div className="bg-slate-900 rounded-lg p-6 mb-4 h-[600px] overflow-y-auto">
          {messages.length === 0 && !loading && (
            <div className="text-center text-slate-500 mt-20">
              <p className="text-lg mb-2">Welcome to NEXUS</p>
              <p className="text-sm">Try: &quot;Research AI agent market trends&quot; or &quot;Analyze sales automation industry&quot;</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-[80%] text-left ${
                  msg.role === 'user'
                    ? 'bg-indigo-600'
                    : msg.role === 'assistant'
                    ? 'bg-slate-800'
                    : 'bg-slate-700 text-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.agentName && (
                  <div className="text-xs text-slate-400 mt-1">
                    {msg.agentName}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-center text-slate-400">
              <div className="inline-block animate-pulse">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message NEXUS..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
