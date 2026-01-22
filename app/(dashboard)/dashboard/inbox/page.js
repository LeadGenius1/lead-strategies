'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import websocketClient from '@/lib/websocket';
import Cookies from 'js-cookie';
import { 
  Mail, MessageSquare, Phone, Search, Sparkles, Send, 
  Paperclip, RefreshCw, Settings, MoreVertical, CheckCircle2, X,
  AlertCircle, TrendingUp
} from 'lucide-react';

const CHANNELS = {
  all: { name: 'All Channels', icon: Mail, bgClass: 'bg-gray-100', textClass: 'text-gray-700' },
  email: { name: 'Email', icon: Mail, bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  sms: { name: 'SMS', icon: MessageSquare, bgClass: 'bg-green-100', textClass: 'text-green-700' },
  whatsapp: { name: 'WhatsApp', icon: MessageSquare, bgClass: 'bg-green-100', textClass: 'text-green-700' },
  webchat: { name: 'Web Chat', icon: MessageSquare, bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  voice: { name: 'Phone', icon: Phone, bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
  facebook: { name: 'Facebook', icon: MessageSquare, bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  instagram: { name: 'Instagram', icon: MessageSquare, bgClass: 'bg-pink-100', textClass: 'text-pink-700' },
};

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filters, setFilters] = useState({ channel: 'all', status: 'open', search: '' });

  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.channel !== 'all') params.append('channel', filters.channel);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/api/v1/conversations?${params}`);
      const data = res.data?.data || res.data || {};
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // WebSocket connection
  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      websocketClient.connect(token);
      
      // Listen for new messages
      websocketClient.on('message:new', (data) => {
        if (selected && data.conversation.id === selected.id) {
          setMessages(prev => [data.message, ...prev]);
        }
        fetchConversations(); // Refresh conversation list
      });

      // Listen for conversation updates
      websocketClient.on('conversation:updated', (data) => {
        fetchConversations(); // Refresh conversation list
      });

      // Subscribe to selected conversation
      if (selected) {
        websocketClient.subscribeToConversation(selected.id);
      }
    }

    return () => {
      if (selected) {
        websocketClient.unsubscribeFromConversation(selected.id);
      }
      websocketClient.disconnect();
    };
  }, [selected, fetchConversations]);

  useEffect(() => {
    fetchConversations();
    // Reduced polling interval since we have WebSocket (fallback only)
    const interval = setInterval(fetchConversations, 60000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (conv) => {
    setSelected(conv);
    setSuggestions([]);
    setAnalysis(null);
    setLoadingSuggestions(true);

    try {
      const res = await api.get(`/api/v1/conversations/${conv.id}`);
      const data = res.data?.data || res.data || {};
      setMessages(data.messages || []);

      // Get AI suggestions
      try {
        const sugRes = await api.get(`/api/v1/inbox-ai/conversations/${conv.id}/suggestions`);
        const sugData = sugRes.data?.data || sugRes.data || [];
        setSuggestions(Array.isArray(sugData) ? sugData : []);
      } catch (sugErr) {
        console.error('Suggestions error:', sugErr);
        setSuggestions([]);
      }

      // Analyze last inbound message
      const lastInbound = data.messages?.filter(m => m.direction === 'inbound').pop();
      if (lastInbound) {
        try {
          const analyzeRes = await api.post('/api/v1/inbox-ai/analyze', {
            message: lastInbound.content,
            conversationId: conv.id
          });
          const analyzeData = analyzeRes.data?.data || analyzeRes.data || {};
          setAnalysis(analyzeData);
        } catch (analyzeErr) {
          console.error('Analysis error:', analyzeErr);
        }
      }
    } catch (err) {
      console.error('Select error:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const sendMessage = async (content) => {
    if (!selected || !content.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      await api.post(`/api/v1/conversations/${selected.id}/messages`, { content });
      setNewMessage('');
      await selectConversation(selected);
      fetchConversations();
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const generateAiReply = async () => {
    if (!selected) return;
    setLoadingSuggestions(true);
    try {
      const res = await api.post(`/api/v1/inbox-ai/conversations/${selected.id}/generate-reply`, { prompt: '' });
      const data = res.data?.data || res.data || {};
      if (data.response) setNewMessage(data.response);
    } catch (err) {
      console.error('AI error:', err);
      alert('Failed to generate AI reply');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selected) return;
    try {
      await api.put(`/api/v1/conversations/${selected.id}`, { status });
      fetchConversations();
      setSelected(prev => ({ ...prev, status }));
    } catch (err) {
      console.error('Status error:', err);
      alert('Failed to update status');
    }
  };

  const getChannel = (id) => CHANNELS[id] || CHANNELS.email;

  return (
    <div className="flex h-screen bg-black">
      {/* Left Sidebar - Channels */}
      <aside className="w-64 bg-neutral-900 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-semibold text-white">Inbox</h1>
          <p className="text-sm text-neutral-400 mt-1">{conversations.length} conversations</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase">Channels</p>
          {Object.entries(CHANNELS).map(([key, channel]) => {
            const Icon = channel.icon;
            const count = key === 'all' ? conversations.length : conversations.filter(c => c.channel === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilters(f => ({ ...f, channel: key }))}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                  filters.channel === key 
                    ? 'bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30' 
                    : 'text-neutral-400 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3"><Icon size={18} />{channel.name}</span>
                {count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">{count}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <p className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase mb-2">Status</p>
          {['all', 'open', 'pending', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilters(f => ({ ...f, status }))}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                filters.status === status 
                  ? 'bg-indigo-500/20 text-indigo-300 font-medium' 
                  : 'text-neutral-400 hover:bg-white/5'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/10">
          <a 
            href="/dashboard/inbox-settings" 
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Settings size={18} /> Inbox Settings
          </a>
        </div>
      </aside>

      {/* Conversation List */}
      <div className="w-80 bg-neutral-900 border-r border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
              <p className="text-neutral-400 font-medium">No conversations</p>
              <p className="text-sm text-neutral-500 mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            conversations.map(conv => {
              const channel = getChannel(conv.channel);
              const ChannelIcon = channel.icon;
              const lead = conv.lead || {};
              const name = lead.firstName ? `${lead.firstName} ${lead.lastName || ''}`.trim() : conv.contactName || 'Unknown';
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all ${
                    selected?.id === conv.id ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {name[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${channel.bgClass} border-2 border-neutral-900`}>
                        <ChannelIcon size={10} className={channel.textClass} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate">{name}</p>
                        <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mb-2">
                        {conv.subject || conv.lastMessage?.content?.substring(0, 50) || 'No subject'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${channel.bgClass} ${channel.textClass} border-current/20`}>
                          {conv.channel}
                        </span>
                        {conv.priority === 'urgent' && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Urgent</span>
                        )}
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-white/10">
          <button 
            onClick={fetchConversations} 
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="flex-1 flex flex-col bg-black">
        {selected ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-neutral-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {(selected.lead?.firstName || selected.contactName || '?')[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {selected.lead?.firstName ? `${selected.lead.firstName} ${selected.lead.lastName || ''}`.trim() : selected.contactName || 'Unknown'}
                    </h2>
                    <p className="text-sm text-neutral-400">
                      {selected.lead?.email || selected.contactEmail || selected.lead?.phone || selected.contactPhone || 'No contact'} • {selected.channel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={generateAiReply} 
                    disabled={loadingSuggestions} 
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30 disabled:opacity-50 transition-all"
                  >
                    <Sparkles size={16} />
                    {loadingSuggestions ? 'Generating...' : 'AI Reply'}
                  </button>
                  <select 
                    value={selected.status} 
                    onChange={(e) => updateStatus(e.target.value)} 
                    className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {analysis && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    analysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    analysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    analysis.sentiment === 'urgent' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {analysis.sentiment}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {analysis.intent}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {analysis.suggestedCategory}
                  </span>
                  {analysis.requiresHuman && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Needs Human
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-950">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-neutral-500">No messages yet</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.direction === 'outbound' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-neutral-800 text-white border border-white/10'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-2 ${
                        msg.direction === 'outbound' ? 'text-indigo-200' : 'text-neutral-400'
                      }`}>
                        {new Date(msg.createdAt || msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                <p className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} />AI Suggestions
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {suggestions.map((sug, i) => (
                    <button 
                      key={i} 
                      onClick={() => setNewMessage(sug.content)} 
                      className="flex-shrink-0 px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-xs hover:bg-purple-500/10 max-w-[220px] text-left transition-all"
                    >
                      <span className="font-medium text-purple-300 mr-1">{sug.type}:</span>
                      <span className="text-neutral-300">{sug.content.substring(0, 40)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compose */}
            <div className="p-4 border-t border-white/10 bg-neutral-900">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        sendMessage(newMessage); 
                      } 
                    }}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button className="text-neutral-400 hover:text-neutral-300 transition-colors">
                      <Paperclip size={18} />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => sendMessage(newMessage)} 
                  disabled={!newMessage.trim() || sendingMessage} 
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {sendingMessage ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-950">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-lg font-medium text-neutral-300">Select a conversation</p>
              <p className="text-sm text-neutral-500 mt-1">Choose from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
