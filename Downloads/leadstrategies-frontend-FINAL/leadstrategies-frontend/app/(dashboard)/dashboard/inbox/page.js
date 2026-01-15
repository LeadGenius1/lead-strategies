'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const CHANNELS = [
  { id: 'all', name: 'All Channels', icon: '📥' },
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'sms', name: 'SMS', icon: '💬' },
]

export default function InboxPage() {
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [channelCounts, setChannelCounts] = useState({})

  useEffect(() => {
    loadConversations()
    // Poll for updates every 30 seconds
    const interval = setInterval(loadConversations, 30000)
    return () => clearInterval(interval)
  }, [selectedChannel, searchQuery])

  async function loadConversations() {
    try {
      const params = new URLSearchParams()
      if (selectedChannel !== 'all') params.append('channel', selectedChannel)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await api.get(`/api/conversations?${params.toString()}`)
      const data = response.data
      // Backend returns { success: true, data: { conversations: [...] } }
      const convs = data.conversations || data || []
      setConversations(convs)
      
      // Calculate channel counts
      const counts = {}
      convs.forEach(conv => {
        const channel = conv.channel || 'email'
        counts[channel] = (counts[channel] || 0) + (conv.unreadCount || 0)
      })
      setChannelCounts(counts)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  async function loadConversationDetails(conversationId) {
    try {
      const response = await api.get(`/api/conversations/${conversationId}`)
      const data = response.data
      setSelectedConversation(data.conversation || data)
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  async function handleReply() {
    if (!replyText.trim() || !selectedConversation) return

    setSendingReply(true)
    try {
      await api.post(`/api/conversations/${selectedConversation.id}/messages`, {
        content: replyText,
        subject: selectedConversation.subject ? `Re: ${selectedConversation.subject}` : undefined,
      })
      toast.success('Reply sent!')
      setReplyText('')
      // Reload conversation to get updated messages
      await loadConversationDetails(selectedConversation.id)
      await loadConversations()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  async function handleAISuggest() {
    if (!selectedConversation) return

    setAiSuggesting(true)
    try {
      // Backend doesn't have AI suggest endpoint yet, using mock for now
      // TODO: Implement /api/inbox/ai-suggest or /api/conversations/:id/ai-suggest
      toast.error('AI suggest not yet implemented in backend')
      // const response = await api.post(`/api/inbox/ai-suggest`, {
      //   conversationId: selectedConversation.id,
      //   messageId: selectedConversation.messages?.[0]?.id
      // })
      // setReplyText(response.data.suggestion || '')
    } catch (error) {
      toast.error('Failed to generate AI suggestion')
    } finally {
      setAiSuggesting(false)
    }
  }

  async function handleMarkRead(conversationId, isRead) {
    try {
      await api.put(`/api/conversations/${conversationId}`, {
        status: isRead ? 'open' : 'open', // Conversations API handles read status via messages
      })
      await loadConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function handleDeleteMessage(conversationId) {
    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      await api.put(`/api/conversations/${conversationId}`, {
        status: 'closed'
      })
      toast.success('Conversation deleted')
      setSelectedConversation(null)
      await loadConversations()
    } catch (error) {
      toast.error('Failed to delete conversation')
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredConversations = conversations

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-dark-border p-4">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Channels</h2>
        <div className="space-y-1">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                selectedChannel === channel.id
                  ? 'bg-dark-primary text-white'
                  : 'text-dark-textMuted hover:bg-dark-surfaceHover hover:text-dark-text'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{channel.icon}</span>
                <span>{channel.name}</span>
              </span>
              <span className="text-xs bg-dark-surfaceHover px-2 py-0.5 rounded-full">
                {channelCounts[channel.id] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-dark-border">
          <h3 className="text-sm font-medium text-dark-textMuted mb-3">Connected Platforms</h3>
          <p className="text-xs text-dark-textMuted">22 channels integrated</p>
          <button className="mt-3 text-sm text-dark-primary hover:text-dark-primaryHover">
            + Connect Channel
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="w-96 border-r border-dark-border overflow-y-auto">
        <div className="p-4 border-b border-dark-border">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary"
          />
        </div>
        <div className="divide-y divide-dark-border">
          {loading ? (
            <div className="p-4 text-center text-dark-textMuted">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-dark-textMuted">No conversations found</div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  loadConversationDetails(conversation.id)
                }}
                className={`w-full p-4 text-left hover:bg-dark-surfaceHover transition ${
                  selectedConversation?.id === conversation.id ? 'bg-dark-surfaceHover' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {(conversation.unreadCount > 0 || !conversation.lastMessageRead) && (
                      <span className="w-2 h-2 bg-dark-primary rounded-full"></span>
                    )}
                    <span className={`font-medium ${(conversation.unreadCount > 0 || !conversation.lastMessageRead) ? 'text-dark-text' : 'text-dark-textMuted'}`}>
                      {conversation.contactName || conversation.contactEmail || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-dark-textMuted">
                    {formatTime(conversation.lastMessageAt || conversation.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-dark-text mt-1 truncate">{conversation.subject || 'No subject'}</p>
                <p className="text-sm text-dark-textMuted mt-1 truncate">
                  {conversation.messages?.[0]?.content?.substring(0, 100) || conversation.preview || 'No preview'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedConversation ? (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-dark-text">{selectedConversation.subject || 'No subject'}</h2>
                <p className="text-dark-textMuted mt-1">
                  From: {selectedConversation.contactName || 'Unknown'} &lt;{selectedConversation.contactEmail || 'No email'}&gt;
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-textMuted">
                  {formatTime(selectedConversation.lastMessageAt || selectedConversation.createdAt)}
                </span>
                <button
                  onClick={() => handleDeleteMessage(selectedConversation.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {/* Messages Thread */}
            <div className="space-y-4 mb-6">
              {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-dark-primary/10 ml-auto max-w-[80%]'
                        : 'bg-dark-surface border border-dark-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-dark-text">
                        {message.direction === 'outbound' ? 'You' : selectedConversation.contactName}
                      </span>
                      <span className="text-xs text-dark-textMuted">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-dark-text whitespace-pre-wrap">
                      {message.content || message.htmlContent || ''}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
                  <p className="text-dark-textMuted">No messages in this conversation</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary resize-none"
              ></textarea>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleAISuggest}
                  disabled={aiSuggesting}
                  className="px-4 py-2 bg-dark-surfaceHover text-dark-text rounded-lg text-sm hover:bg-dark-border transition disabled:opacity-50"
                >
                  {aiSuggesting ? 'Generating...' : '🤖 AI Suggest Reply'}
                </button>
                <button
                  onClick={handleReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="px-6 py-2 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition disabled:opacity-50"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-dark-textMuted">
            Select a message to view
          </div>
        )}
      </div>
    </div>
  )
}
