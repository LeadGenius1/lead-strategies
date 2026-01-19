'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Send, 
  ChevronRight, 
  Sparkles, 
  Target, 
  Mail, 
  BarChart3, 
  Users, 
  Zap, 
  Search,
  FileText,
  TrendingUp,
  Shield,
  Flame,
  MessageSquare,
  Loader2,
  BrainCircuit
} from 'lucide-react';

export default function CopilotChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Lead Hunter, your AI-powered lead generation assistant. I can help you find qualified prospects, create campaigns, generate email copy, and more. What would you like to do?",
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
    const actionMessages = {
      'find_leads': 'Start a lead search for me',
      'view_saved_leads': 'Show my saved leads',
      'create_campaign': 'Help me create a new campaign',
      'show_leads': 'Show the leads you found',
      'preview_sequence': 'Preview the email sequence',
      'create_email': 'Help me create an email',
      'view_templates': 'Show me email templates',
      'view_campaigns': 'Show my campaigns'
    };
    
    const message = actionMessages[action.type] || action.label || action.type.replace(/_/g, ' ');
    setInput(message);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-black rounded-2xl overflow-hidden border border-white/10">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-medium tracking-wide text-white">Lead Hunter</h2>
              <p className="text-[10px] text-neutral-500">AI-Powered Lead Generation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wide">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group relative max-w-[85%] rounded-2xl p-5 transition-all duration-300 ${
                message.role === 'user'
                  ? 'bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-500/50'
                  : message.error
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-neutral-900/50 border border-white/10 hover:border-white/20'
              }`}
            >
              {/* Hover Gradient */}
              {!message.error && (
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-500/10 to-transparent' 
                    : 'bg-gradient-to-br from-white/5 to-transparent'
                }`}></div>
              )}
              
              <div className="relative z-10">
                <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed font-light">{message.content}</p>

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.actions.map((action, actionIndex) => {
                    const getActionIcon = (type) => {
                      const icons = {
                        'find_leads': <Search className="w-3.5 h-3.5" />,
                        'view_saved_leads': <Users className="w-3.5 h-3.5" />,
                        'create_campaign': <Zap className="w-3.5 h-3.5" />,
                        'show_leads': <Target className="w-3.5 h-3.5" />,
                        'preview_sequence': <Mail className="w-3.5 h-3.5" />,
                        'create_email': <FileText className="w-3.5 h-3.5" />,
                        'view_templates': <FileText className="w-3.5 h-3.5" />,
                        'view_campaigns': <BarChart3 className="w-3.5 h-3.5" />
                      };
                      return icons[type] || <Sparkles className="w-3.5 h-3.5" />;
                    };
                    
                    return (
                      <button
                        key={actionIndex}
                        onClick={() => handleAction(action)}
                        className="group/btn relative px-4 py-2 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-full text-indigo-300 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {getActionIcon(action.type)}
                          {action.label || action.type.replace(/_/g, ' ')}
                          <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, suggestionIndex) => {
                    const getSuggestionIcon = (text) => {
                      const lowerText = text.toLowerCase();
                      if (lowerText.includes('find') || lowerText.includes('search')) return <Search className="w-3 h-3" />;
                      if (lowerText.includes('email') || lowerText.includes('sequence')) return <Mail className="w-3 h-3" />;
                      if (lowerText.includes('campaign')) return <Zap className="w-3 h-3" />;
                      if (lowerText.includes('analytics') || lowerText.includes('report')) return <BarChart3 className="w-3 h-3" />;
                      if (lowerText.includes('export') || lowerText.includes('csv')) return <TrendingUp className="w-3 h-3" />;
                      if (lowerText.includes('save') || lowerText.includes('list')) return <Users className="w-3 h-3" />;
                      if (lowerText.includes('warmup')) return <Flame className="w-3 h-3" />;
                      if (lowerText.includes('compliance')) return <Shield className="w-3 h-3" />;
                      return <MessageSquare className="w-3 h-3" />;
                    };
                    
                    return (
                      <button
                        key={suggestionIndex}
                        onClick={() => handleSuggestion(suggestion)}
                        className="group/sug px-4 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full text-neutral-400 hover:text-white transition-all duration-300 flex items-center gap-2"
                      >
                        <span className="text-neutral-500 group-hover/sug:text-indigo-400 transition-colors">
                          {getSuggestionIcon(suggestion)}
                        </span>
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 text-neutral-400 text-sm">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <span className="font-medium text-white">Analyzing your request...</span>
                  <p className="text-xs text-neutral-500 mt-0.5">Lead Hunter is working on it</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative z-10 px-6 py-3 bg-red-500/10 border-t border-red-500/30">
          <p className="text-xs text-red-400 font-light">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 px-6 py-4 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Lead Hunter anything..."
            className="flex-1 px-5 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm font-light focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="group relative px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium disabled:from-neutral-800 disabled:to-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
              Send
            </span>
          </button>
        </div>
        <p className="mt-3 text-[10px] text-neutral-600 text-center flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-indigo-500/50" />
          <span>Powered by 47 intent signals • GDPR & CAN-SPAM compliant</span>
          <Shield className="w-3 h-3 text-emerald-500/50" />
        </p>
      </div>
    </div>
  );
}
