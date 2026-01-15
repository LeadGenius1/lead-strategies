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
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [channelCounts, setChannelCounts] = useState({})

  const filteredMessages = selectedChannel === 'all' 
    ? MOCK_MESSAGES 
    : MOCK_MESSAGES.filter(m => m.channel === selectedChannel)

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
            placeholder="Search messages..."
            className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary"
          />
        </div>
        <div className="divide-y divide-dark-border">
          {loading ? (
            <div className="p-4 text-center text-dark-textMuted">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-4 text-center text-dark-textMuted">No messages found</div>
          ) : (
            filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.is_read) {
                    handleMarkRead(message.id, true)
                  }
                }}
                className={`w-full p-4 text-left hover:bg-dark-surfaceHover transition ${
                  selectedMessage?.id === message.id ? 'bg-dark-surfaceHover' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {!message.is_read && (
                      <span className="w-2 h-2 bg-dark-primary rounded-full"></span>
                    )}
                    <span className={`font-medium ${!message.is_read ? 'text-dark-text' : 'text-dark-textMuted'}`}>
                      {message.from_name || message.from}
                    </span>
                  </div>
                  <span className="text-xs text-dark-textMuted">
                    {formatTime(message.received_at || message.created_at)}
                  </span>
                </div>
                <p className="text-sm text-dark-text mt-1 truncate">{message.subject}</p>
                <p className="text-sm text-dark-textMuted mt-1 truncate">
                  {message.body?.substring(0, 100) || message.preview}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 p-6">
        {selectedMessage ? (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-dark-text">{selectedMessage.subject}</h2>
                <p className="text-dark-textMuted mt-1">
                  From: {selectedMessage.from_name || selectedMessage.from} &lt;{selectedMessage.from_email || selectedMessage.email}&gt;
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-dark-textMuted">
                  {formatTime(selectedMessage.received_at || selectedMessage.created_at)}
                </span>
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <p className="text-dark-text whitespace-pre-wrap">
                {selectedMessage.body || selectedMessage.preview}
              </p>
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
