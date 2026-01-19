'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';

export default function CopilotChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Copilot. I can help you find leads, create campaigns, generate email copy, and more. What would you like to do?",
      suggestions: [
        'Find 100 CTOs at SaaS companies',
        'Create a warmup campaign',
        'Generate email copy for healthcare leads',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/copilot', {
        message: userMessage.content,
        context: {},
      });

      const responseData = response.data?.data || response.data || {};
      const assistantMessage = {
        role: 'assistant',
        content: responseData.response || responseData.message || 'I processed your request.',
        agent: responseData.agent,
        actions: responseData.actions || [],
        suggestions: responseData.suggestions || [],
        data: responseData,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleAction = async (action) => {
    if (action.type === 'show_leads') {
      // Navigate to leads view or show modal
      console.log('Show leads:', action.leads);
    } else if (action.type === 'create_campaign') {
      // Navigate to campaign creation
      console.log('Create campaign');
    } else if (action.type === 'preview_sequence') {
      // Show email sequence preview
      console.log('Preview sequence:', action.sequence);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border border-subtle rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-subtle bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-space-grotesk text-white">AI Copilot</h2>
          {messages[messages.length - 1]?.agent && (
            <span className="text-xs text-neutral-400 font-geist">
              ({messages[messages.length - 1].agent.replace(/_/g, ' ')})
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-500/20 text-white border border-purple-500/30'
                  : message.error
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-[#050505] text-neutral-200 border border-subtle'
              }`}
            >
              <p className="font-geist text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => handleAction(action)}
                      className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded text-purple-300 font-geist transition-colors"
                    >
                      {action.type.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, suggestionIndex) => (
                    <button
                      key={suggestionIndex}
                      onClick={() => handleSuggestion(suggestion)}
                      className="px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 border border-subtle rounded text-neutral-300 font-geist transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#050505] border border-subtle rounded-lg p-4">
              <div className="flex items-center gap-2 text-neutral-400 font-geist text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/30">
          <p className="text-xs text-red-400 font-geist">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-subtle bg-[#050505]">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything... (e.g., 'Find 100 CTOs at SaaS companies')"
            className="flex-1 px-4 py-2.5 bg-black border border-subtle rounded-lg text-white placeholder-neutral-500 font-geist text-sm focus:outline-none focus:border-purple-500/50"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg font-geist text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
