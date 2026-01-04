'use client'

import { useState } from 'react'

const CHANNELS = [
  { id: 'all', name: 'All Channels', icon: '📥', count: 24 },
  { id: 'email', name: 'Email', icon: '📧', count: 12 },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', count: 5 },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', count: 3 },
  { id: 'instagram', name: 'Instagram', icon: '📸', count: 2 },
  { id: 'sms', name: 'SMS', icon: '💬', count: 2 },
]

const MOCK_MESSAGES = [
  { id: 1, from: 'John Smith', email: 'john@techcorp.com', channel: 'email', subject: 'Re: Partnership Inquiry', preview: 'Thanks for reaching out! I would love to discuss...', time: '2 min ago', unread: true },
  { id: 2, from: 'Sarah Johnson', email: 'sarah@startup.io', channel: 'linkedin', subject: 'LinkedIn Message', preview: 'Hi! I saw your post about AI lead generation...', time: '15 min ago', unread: true },
  { id: 3, from: 'Mike Chen', email: 'mike@enterprise.com', channel: 'email', subject: 'Interested in Tackle.IO', preview: 'We are currently evaluating platforms for our sales team...', time: '1 hour ago', unread: false },
  { id: 4, from: 'Lisa Wang', email: 'lisa@agency.co', channel: 'twitter', subject: 'Twitter DM', preview: 'Love what you are building! Quick question...', time: '3 hours ago', unread: false },
]

export default function InboxPage() {
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)

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
                {channel.count}
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
          {filteredMessages.map((message) => (
            <button
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className={`w-full p-4 text-left hover:bg-dark-surfaceHover transition ${
                selectedMessage?.id === message.id ? 'bg-dark-surfaceHover' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {message.unread && (
                    <span className="w-2 h-2 bg-dark-primary rounded-full"></span>
                  )}
                  <span className={`font-medium ${message.unread ? 'text-dark-text' : 'text-dark-textMuted'}`}>
                    {message.from}
                  </span>
                </div>
                <span className="text-xs text-dark-textMuted">{message.time}</span>
              </div>
              <p className="text-sm text-dark-text mt-1 truncate">{message.subject}</p>
              <p className="text-sm text-dark-textMuted mt-1 truncate">{message.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 p-6">
        {selectedMessage ? (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-dark-text">{selectedMessage.subject}</h2>
                <p className="text-dark-textMuted mt-1">From: {selectedMessage.from} &lt;{selectedMessage.email}&gt;</p>
              </div>
              <span className="text-sm text-dark-textMuted">{selectedMessage.time}</span>
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
              <p className="text-dark-text">{selectedMessage.preview}</p>
            </div>
            <div className="mt-6">
              <textarea
                placeholder="Type your reply..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-textMuted focus:outline-none focus:border-dark-primary resize-none"
              ></textarea>
              <div className="flex justify-between mt-4">
                <button className="px-4 py-2 bg-dark-surfaceHover text-dark-text rounded-lg text-sm">
                  🤖 AI Suggest Reply
                </button>
                <button className="px-6 py-2 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg">
                  Send Reply
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
