'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { MessageSquare, Mail, Clock, Check, X, Reply, Star, Loader2, Inbox } from 'lucide-react'

export default function InboxPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    try {
      const response = await api.get('/api/inbox')
      setMessages(response.data?.messages || response.data || [])
    } catch (error) {
      console.error('Error loading inbox:', error)
      // Load mock data for demo
      setMessages([
        {
          id: 1,
          from: 'Sarah Chen',
          email: 'sarah.chen@cloudscale.io',
          subject: 'Re: Quick question about your platform',
          preview: "Thanks for reaching out! I'd love to learn more about your lead generation capabilities...",
          time: '2 hours ago',
          read: false,
          starred: true,
          sentiment: 'positive'
        },
        {
          id: 2,
          from: 'Michael Torres',
          email: 'mtorres@dataflow.ai',
          subject: 'Re: Partnership opportunity',
          preview: "This sounds interesting. Can we schedule a call next week to discuss further?",
          time: '5 hours ago',
          read: true,
          starred: false,
          sentiment: 'positive'
        },
        {
          id: 3,
          from: 'Jennifer Park',
          email: 'j.park@techstartup.co',
          subject: 'Re: Introduction',
          preview: "Not interested at the moment, but please reach out again in Q2.",
          time: '1 day ago',
          read: true,
          starred: false,
          sentiment: 'neutral'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">Inbox</h1>
          <p className="text-neutral-500 mt-1 text-sm">View and respond to prospect replies</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Unread', value: messages.filter(m => !m.read).length, icon: Mail, color: 'indigo' },
            { label: 'Positive', value: messages.filter(m => m.sentiment === 'positive').length, icon: Check, color: 'emerald' },
            { label: 'Neutral', value: messages.filter(m => m.sentiment === 'neutral').length, icon: Clock, color: 'yellow' },
            { label: 'Negative', value: messages.filter(m => m.sentiment === 'negative').length, icon: X, color: 'red' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="p-5 rounded-2xl bg-neutral-900/50 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-white">{stat.value}</p>
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Messages */}
        {loading ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900/50 border border-white/10 text-center">
            <Inbox className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-400 mb-2">Your inbox is empty</p>
            <p className="text-neutral-600 text-sm">Replies from prospects will appear here</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/50 border border-white/10 overflow-hidden divide-y divide-white/5">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-5 cursor-pointer transition-all hover:bg-white/5 ${!message.read ? 'bg-indigo-500/5' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-medium text-indigo-400">
                    {message.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${!message.read ? 'text-white' : 'text-neutral-300'}`}>
                          {message.from}
                        </span>
                        {message.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSentimentStyle(message.sentiment)}`}>
                          {message.sentiment}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">{message.time}</span>
                    </div>
                    <p className={`text-sm ${!message.read ? 'text-neutral-200' : 'text-neutral-400'}`}>
                      {message.subject}
                    </p>
                    <p className="text-sm text-neutral-500 truncate mt-1">{message.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Detail Modal (simplified) */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedMessage(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-white">{selectedMessage.subject}</h2>
                    <p className="text-sm text-neutral-400 mt-1">From: {selectedMessage.from} &lt;{selectedMessage.email}&gt;</p>
                  </div>
                  <button onClick={() => setSelectedMessage(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-neutral-300">{selectedMessage.preview}</p>
              </div>
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm rounded-xl transition-all flex items-center gap-2">
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-sm rounded-xl transition-all flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Star
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
