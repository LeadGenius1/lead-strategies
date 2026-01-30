'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ChannelIcon from '@/components/icons/ChannelIcon';
import { ArrowLeft, StickyNote, X, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  htmlContent?: string;
  subject?: string;
  direction: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Conversation {
  id: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  channel: string;
  subject?: string;
  status: string;
  priority: string;
  tags: string[];
  labels: string[];
  messages: Message[];
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export default function ConversationPage() {
  const { user, loading, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/dashboard/inbox/${conversationId}`);
    } else if (user) {
      fetchConversation();
    }
  }, [user, loading, conversationId, router]);

  const fetchConversation = async () => {
    setLoadingConversation(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConversation(result.data.conversation);
        }
      }
    } catch (error) {
      console.error('Fetch conversation error:', error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageContent.trim(),
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setMessageContent('');
        fetchConversation(); // Refresh conversation
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (response.ok) {
        fetchConversation();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      setError('Note cannot be empty');
      return;
    }

    setAddingNote(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/conversation-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content: noteContent.trim(),
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setNoteContent('');
        fetchConversation(); // Refresh to get updated notes
      } else {
        setError(result.error || 'Failed to add note');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/v1/conversation-notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        fetchConversation();
      } else {
        setError(result.error || 'Failed to delete note');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading || loadingConversation) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user || !conversation) {
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
            <Link href="/dashboard/inbox" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Inbox
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

      {/* Conversation Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex gap-6">
            <div className={`flex-1 transition-all ${showNotes ? 'max-w-4xl' : 'max-w-4xl mx-auto'}`}>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/inbox"
              className="text-purple-400 hover:text-purple-300 text-sm uppercase tracking-widest mb-4 inline-flex items-center gap-2 transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={16} />
              Back to Inbox
            </Link>
            
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-purple-400">
                    <ChannelIcon channel={conversation.channel} size={32} />
                  </div>
                  <h1 className="text-3xl md:text-5xl uppercase text-white tracking-tighter font-bold" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                    {conversation.contactName || conversation.contactEmail || conversation.contactPhone || 'Unknown Contact'}
                  </h1>
                </div>
                {conversation.subject && (
                  <p className="text-neutral-400 font-geist">{conversation.subject}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-500 font-geist uppercase">
                    {conversation.channel}
                  </span>
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-geist ${
                    conversation.status === 'open' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                  }`}>
                    {conversation.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist flex items-center gap-2"
                >
                  <StickyNote size={14} />
                  Notes ({conversation.notes?.length || 0})
                </button>
                {conversation.status === 'open' ? (
                  <button
                    onClick={() => handleUpdateStatus('closed')}
                    className="bg-neutral-500/20 hover:bg-neutral-500/30 border border-neutral-500/30 text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('open')}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-[#050505] border border-subtle mb-6">
            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
              {conversation.messages.length === 0 ? (
                <div className="text-center text-neutral-500 font-geist py-12">
                  No messages yet.
                </div>
              ) : (
                conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.direction === 'outbound' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex-1 ${message.direction === 'outbound' ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block p-4 rounded-lg ${
                          message.direction === 'outbound'
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-[#030303] border border-subtle'
                        }`}
                      >
                        {message.subject && (
                          <div className="text-sm font-bold text-white font-geist mb-2">
                            {message.subject}
                          </div>
                        )}
                        <div
                          className={`text-sm font-geist ${
                            message.direction === 'outbound' ? 'text-purple-200' : 'text-neutral-300'
                          }`}
                          dangerouslySetInnerHTML={
                            message.htmlContent
                              ? { __html: message.htmlContent }
                              : undefined
                          }
                        >
                          {!message.htmlContent && <p className="whitespace-pre-wrap">{message.content}</p>}
                        </div>
                        <div className="text-xs text-neutral-500 font-geist mt-2">
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Send Message */}
          {conversation.status === 'open' && (
            <div className="bg-[#050505] border border-subtle p-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm font-geist mb-4">
                  {error}
                </div>
              )}
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-[#030303] border border-subtle p-4 text-white outline-none focus:border-purple-500 transition-colors font-geist min-h-[120px] resize-none mb-4"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 font-geist">
                  Press Cmd/Ctrl + Enter to send
                </p>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageContent.trim()}
                  className="bg-white text-black px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </div>
          )}
            </div>

            {/* Notes Sidebar */}
            {showNotes && (
              <div className="w-full md:w-96 bg-[#050505] border border-subtle p-6 h-fit sticky top-40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white font-space-grotesk flex items-center gap-2">
                    <StickyNote size={20} className="text-purple-400" />
                    Internal Notes
                  </h3>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Add Note Form */}
                <div className="mb-6">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add a private note..."
                    className="w-full bg-[#030303] border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist text-sm min-h-[100px] resize-none mb-3"
                    disabled={addingNote}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={addingNote || !noteContent.trim()}
                    className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {conversation.notes && conversation.notes.length > 0 ? (
                    conversation.notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-[#030303] border border-subtle p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="text-xs text-neutral-500 font-geist">
                            {note.createdBy && (
                              <span className="text-purple-400">
                                {note.createdBy.firstName} {note.createdBy.lastName}
                              </span>
                            )}
                            {' · '}
                            {formatTime(note.createdAt)}
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-300 font-geist whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-neutral-600 font-geist text-sm py-8">
                      No notes yet. Add a note to keep track of important information.
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30">
                  <p className="text-xs text-purple-400 font-geist">
                    <strong>Private:</strong> Notes are only visible to your team, not to customers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
