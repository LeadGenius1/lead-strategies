'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ChannelIcon from '@/components/icons/ChannelIcon';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Conversation {
  id: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  channel: string;
  subject?: string;
  status: string;
  priority: string;
  unreadCount: number;
  messageCount: number;
  lastMessage?: {
    content: string;
    direction: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  tags: string[];
  labels: string[];
  createdAt: string;
}

interface InboxStats {
  total: number;
  unread: number;
  open: number;
  closed: number;
  byChannel: Array<{ channel: string; count: number }>;
}

export default function InboxPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/inbox');
    } else if (user) {
      fetchStats();
      fetchConversations();
    }
  }, [user, loading, router, selectedStatus, selectedChannel]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/conversations/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedChannel !== 'all') params.append('channel', selectedChannel);

      const response = await fetch(`/api/conversations?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConversations(result.data?.conversations || []);
        }
      }
    } catch (error) {
      console.error('Fetch conversations error:', error);
    } finally {
      setLoadingConversations(false);
    }
  };


  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading || loadingConversations) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-6xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Dashboard
            </Link>
            <Link href="/dashboard/leads" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/websites" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Websites
            </Link>
            <Link href="/dashboard/inbox" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Inbox
            </Link>
            <Link href="/dashboard/settings" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Settings
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            {user.firstName}
          </div>

          <button
            onClick={logout}
            className="bg-transparent border border-subtle text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Inbox Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-bold" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Unified <span className="text-gradient">Inbox</span>
            </h1>
            <p className="text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>All your conversations in one place</p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#050505] border border-subtle p-4">
                <div className="text-2xl font-bold text-white font-space-grotesk">{stats.total}</div>
                <div className="text-xs text-neutral-500 font-geist uppercase tracking-widest">Total</div>
              </div>
              <div className="bg-[#050505] border border-subtle p-4">
                <div className="text-2xl font-bold text-purple-400 font-space-grotesk">{stats.unread}</div>
                <div className="text-xs text-neutral-500 font-geist uppercase tracking-widest">Unread</div>
              </div>
              <div className="bg-[#050505] border border-subtle p-4">
                <div className="text-2xl font-bold text-green-400 font-space-grotesk">{stats.open}</div>
                <div className="text-xs text-neutral-500 font-geist uppercase tracking-widest">Open</div>
              </div>
              <div className="bg-[#050505] border border-subtle p-4">
                <div className="text-2xl font-bold text-neutral-400 font-space-grotesk">{stats.closed}</div>
                <div className="text-xs text-neutral-500 font-geist uppercase tracking-widest">Closed</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#050505] border border-subtle px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors font-geist text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-[#050505] border border-subtle px-4 py-2 text-white outline-none focus:border-purple-500 transition-colors font-geist text-sm"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="messenger">Messenger</option>
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="bg-[#050505] border border-subtle p-12 text-center">
              <p className="text-neutral-500 font-geist mb-4">No conversations found.</p>
              <p className="text-xs text-neutral-600 font-geist">Conversations from all channels will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/inbox/${conv.id}`}
                  className="block bg-[#050505] border border-subtle p-4 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-purple-400">
                      <ChannelIcon channel={conv.channel} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium text-white font-space-grotesk group-hover:text-purple-400 transition-colors">
                              {conv.contactName || conv.contactEmail || conv.contactPhone || 'Unknown Contact'}
                            </h3>
                            {conv.unreadCount > 0 && (
                              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-geist">
                                {conv.unreadCount}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-geist ${
                              conv.status === 'open' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                            }`}>
                              {conv.status}
                            </span>
                          </div>
                          {conv.subject && (
                            <p className="text-sm text-neutral-400 font-geist mb-1">{conv.subject}</p>
                          )}
                          {conv.lastMessage && (
                            <p className="text-sm text-neutral-500 truncate flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {conv.lastMessage.direction === 'inbound' ? (
                                <ArrowLeft size={14} className="text-purple-400" />
                              ) : (
                                <ArrowRight size={14} className="text-purple-400" />
                              )}
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-500 font-geist">
                            {formatTime(conv.lastMessageAt)}
                          </div>
                          <div className="text-xs text-neutral-600 font-geist mt-1">
                            {conv.messageCount} {conv.messageCount === 1 ? 'message' : 'messages'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
