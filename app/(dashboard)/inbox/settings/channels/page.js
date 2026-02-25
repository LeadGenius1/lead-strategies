'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Mail, MessageSquare, Phone, Settings, CheckCircle2, X,
  Facebook, Instagram, Twitter, Linkedin,
  Slack, Video, Globe, Plus, ChevronDown, ExternalLink,
  Zap, Hash, Youtube, Send
} from 'lucide-react';
import Link from 'next/link';

const CHANNEL_ICONS = {
  email: Mail,
  gmail: Mail,
  outlook: Mail,
  imap: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  webchat: MessageSquare,
  voice: Phone,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  slack: Slack,
  discord: Hash,
  teams: Video,
  telegram: MessageSquare,
  tiktok: Video,
  youtube: Youtube,
  pinterest: Globe,
  snapchat: Globe,
  hubspot: Zap,
  salesforce: Zap,
  zapier: Zap,
  intercom: MessageSquare,
  zendesk: MessageSquare,
  webhook: Globe,
  livechat: MessageSquare,
  internal: MessageSquare,
};

// All 22 channels organized by category
const CHANNEL_CATEGORIES = [
  {
    id: 'email-sms',
    label: 'Email & SMS',
    emoji: '\u{1F4E7}',
    channels: [
      { id: 'gmail', name: 'Gmail', desc: 'Send and receive emails from your Gmail inbox', signupUrl: 'https://gmail.com', dashboardUrl: 'https://mail.google.com' },
      { id: 'outlook', name: 'Outlook', desc: 'Connect Microsoft 365 or Outlook email', signupUrl: 'https://outlook.com', dashboardUrl: 'https://outlook.live.com' },
      { id: 'imap', name: 'IMAP Email', desc: 'Connect any custom email account via IMAP', signupUrl: null, dashboardUrl: null },
      { id: 'sms', name: 'SMS / Twilio', desc: 'Send and receive text messages via Twilio', signupUrl: 'https://twilio.com/try-twilio', dashboardUrl: 'https://console.twilio.com' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    emoji: '\u{1F4F1}',
    channels: [
      { id: 'facebook', name: 'Facebook Messenger', desc: 'Respond to Facebook Page messages', signupUrl: 'https://www.facebook.com/business', dashboardUrl: 'https://business.facebook.com' },
      { id: 'instagram', name: 'Instagram', desc: 'Handle Instagram DMs and comments', signupUrl: 'https://business.instagram.com', dashboardUrl: 'https://www.instagram.com/accounts/login' },
      { id: 'linkedin', name: 'LinkedIn', desc: 'Manage messages and connection requests', signupUrl: 'https://www.linkedin.com/business', dashboardUrl: 'https://www.linkedin.com/messaging' },
      { id: 'twitter', name: 'Twitter / X', desc: 'Manage DMs and mentions', signupUrl: 'https://twitter.com', dashboardUrl: 'https://twitter.com/messages' },
      { id: 'tiktok', name: 'TikTok', desc: 'Monitor TikTok comments and DMs', signupUrl: 'https://www.tiktok.com/business', dashboardUrl: 'https://www.tiktok.com/creator-center' },
      { id: 'youtube', name: 'YouTube', desc: 'Manage YouTube video comments', signupUrl: 'https://youtube.com', dashboardUrl: 'https://studio.youtube.com' },
      { id: 'pinterest', name: 'Pinterest', desc: 'Manage Pinterest business messages', signupUrl: 'https://pinterest.com/business', dashboardUrl: 'https://analytics.pinterest.com' },
      { id: 'snapchat', name: 'Snapchat', desc: 'Connect Snapchat for Business', signupUrl: 'https://forbusiness.snapchat.com', dashboardUrl: 'https://ads.snapchat.com' },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    emoji: '\u{1F4AC}',
    channels: [
      { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Two-way WhatsApp messaging via Twilio', signupUrl: 'https://business.whatsapp.com', dashboardUrl: 'https://business.whatsapp.com' },
      { id: 'telegram', name: 'Telegram', desc: 'Connect a Telegram bot to your inbox', signupUrl: 'https://telegram.org', dashboardUrl: 'https://web.telegram.org' },
      { id: 'discord', name: 'Discord', desc: 'Monitor Discord server messages', signupUrl: 'https://discord.com/developers', dashboardUrl: 'https://discord.com/app' },
      { id: 'slack', name: 'Slack', desc: 'Receive Slack messages as inbox threads', signupUrl: 'https://slack.com/intl/en-us/get-started', dashboardUrl: 'https://app.slack.com' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    emoji: '\u{1F527}',
    channels: [
      { id: 'hubspot', name: 'HubSpot', desc: 'Sync HubSpot contact conversations', signupUrl: 'https://app.hubspot.com/signup', dashboardUrl: 'https://app.hubspot.com' },
      { id: 'salesforce', name: 'Salesforce', desc: 'Pull Salesforce case and email activity', signupUrl: 'https://www.salesforce.com/form/signup', dashboardUrl: 'https://login.salesforce.com' },
      { id: 'zapier', name: 'Zapier', desc: 'Trigger inbox actions from Zapier workflows', signupUrl: 'https://zapier.com/sign-up', dashboardUrl: 'https://zapier.com/app/dashboard' },
      { id: 'intercom', name: 'Intercom', desc: 'Pull in Intercom conversations', signupUrl: 'https://app.intercom.com/a/signup', dashboardUrl: 'https://app.intercom.com' },
      { id: 'zendesk', name: 'Zendesk', desc: 'Sync Zendesk support tickets', signupUrl: 'https://www.zendesk.com/register', dashboardUrl: 'https://www.zendesk.com/login' },
      { id: 'webhook', name: 'Custom Webhook', desc: 'Receive messages from any external source', signupUrl: null, dashboardUrl: null },
    ],
  },
];

export default function ChannelsSettingsPage() {
  const [channels, setChannels] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    fetchChannels();
    fetchConnections();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await api.get('/api/v1/channels');
      const data = res.data?.data || res.data || {};
      setChannels(data.enabled || []);
    } catch (err) {
      console.error('Fetch channels error:', err);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/api/v1/channels/connections');
      const data = res.data?.data || res.data || {};
      setConnections(data.connections || []);
    } catch (err) {
      console.error('Fetch connections error:', err);
      setConnections([]);
    }
  };

  const disconnectChannel = async (channelId) => {
    if (!confirm(`Disconnect from ${channelId}?`)) return;

    try {
      await api.delete(`/api/v1/channels/oauth/${channelId}/disconnect`);
      fetchConnections();
    } catch (err) {
      console.error('Disconnect error:', err);
      alert('Failed to disconnect channel');
    }
  };

  const isConnected = (channelId) => {
    return connections.some(c => c.channel === channelId && c.isActive);
  };

  // Find channel display info from categories
  const getChannelInfo = (channelId) => {
    for (const cat of CHANNEL_CATEGORIES) {
      const ch = cat.channels.find(c => c.id === channelId);
      if (ch) return ch;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const connectedChannels = connections.filter(c => c.isActive);

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* AETHER Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-delay" />
      </div>

      <div className="relative z-10 p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/inbox"
            className="text-neutral-400 hover:text-white mb-4 inline-flex items-center gap-2 text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Inbox
          </Link>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Channel Hub
          </h1>
          <p className="text-neutral-400 text-sm font-light">
            Connect your communication channels to the unified inbox.
            {connectedChannels.length > 0 && (
              <span className="text-indigo-400 ml-2">{connectedChannels.length} connected</span>
            )}
          </p>
        </div>

        {/* ── CONNECTED CHANNELS ── */}
        <div className="mb-8">
          <h2 className="text-neutral-400 text-xs font-medium uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Connected Channels
          </h2>

          {connectedChannels.length === 0 ? (
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <Settings className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No channels connected yet.</p>
              <p className="text-neutral-500 text-xs mt-1 font-light">Click &quot;Add a Channel&quot; below to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectedChannels.map((conn) => {
                  const info = getChannelInfo(conn.channel);
                  const Icon = CHANNEL_ICONS[conn.channel] || Globe;

                  return (
                    <div
                      key={conn.id || conn.channel}
                      className="relative rounded-2xl bg-green-500/5 border border-green-500/30 p-4 group hover:border-green-500/50 transition-all overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Icon className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">
                            {info?.name || conn.name || conn.channel}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-green-400 text-xs">Connected</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {info?.dashboardUrl && (
                          <a
                            href={info.dashboardUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-1.5"
                          >
                            Open Account <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => disconnectChannel(conn.channel)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3 h-3" /> Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Post to All Channels */}
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-purple-400" />
                  <h3 className="text-white font-medium text-sm">Post to All Channels</h3>
                </div>
                <p className="text-neutral-500 text-xs font-light mb-4">
                  AI agent will format and publish your content to all connected channels.
                </p>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your post content here..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white text-sm font-light placeholder-neutral-500 focus:outline-none focus:border-purple-500/50 resize-none mb-3"
                />
                <button
                  disabled={!postContent.trim() || connectedChannels.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Publish to {connectedChannels.length} Channel{connectedChannels.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── ADD A CHANNEL BUTTON ── */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddChannel(!showAddChannel)}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
            Add a Channel
            <ChevronDown className={`w-4 h-4 transition-transform ${showAddChannel ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* ── ADD CHANNEL DROPDOWN ── */}
        {showAddChannel && (
          <div className="relative bg-neutral-900/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">All Channels</h2>
              <button
                onClick={() => setShowAddChannel(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              {CHANNEL_CATEGORIES.map((category) => (
                <div key={category.id}>
                  <h3 className="text-neutral-400 text-xs font-medium uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>{category.emoji}</span>
                    {category.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.channels.map((channel) => {
                      const Icon = CHANNEL_ICONS[channel.id] || Globe;
                      const connected = isConnected(channel.id);

                      return (
                        <div
                          key={channel.id}
                          className={`relative rounded-2xl border p-4 transition-all overflow-hidden ${
                            connected
                              ? 'bg-green-500/5 border-green-500/30'
                              : 'bg-neutral-900/30 border-white/10 hover:border-indigo-500/30'
                          }`}
                        >
                          {connected && (
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                          )}
                          {!connected && (
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              connected ? 'bg-green-500/10' : 'bg-white/5'
                            }`}>
                              <Icon className={`w-4 h-4 ${
                                connected ? 'text-green-400' : 'text-neutral-400'
                              }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-white text-sm font-medium truncate">{channel.name}</h4>
                                {connected && (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                  </>
                                )}
                              </div>
                              <p className="text-neutral-500 text-xs leading-relaxed">{channel.desc}</p>

                              {/* Action button */}
                              <div className="flex items-center gap-2 mt-3">
                                {connected ? (
                                  channel.dashboardUrl && (
                                    <a
                                      href={channel.dashboardUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center gap-1.5"
                                    >
                                      Open Account <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )
                                ) : (
                                  channel.signupUrl && (
                                    <a
                                      href={channel.signupUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 transition-all flex items-center gap-1.5"
                                    >
                                      Sign Up <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
