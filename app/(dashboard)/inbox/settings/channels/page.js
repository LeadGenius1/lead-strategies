'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Mail, MessageSquare, Phone, Settings, CheckCircle2, X,
  RefreshCw, Facebook, Instagram, Twitter, Linkedin,
  Slack, Video, Globe, Plus, ChevronDown, ExternalLink,
  ArrowRight, Zap, Hash, Youtube
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
      { id: 'gmail', name: 'Gmail', desc: 'Send and receive emails from your Gmail inbox', signupUrl: 'https://gmail.com', live: false },
      { id: 'outlook', name: 'Outlook', desc: 'Connect Microsoft 365 or Outlook email', signupUrl: 'https://outlook.com', live: false },
      { id: 'imap', name: 'IMAP Email', desc: 'Connect any custom email account via IMAP', signupUrl: null, live: false, configForm: true },
      { id: 'sms', name: 'SMS / Twilio', desc: 'Send and receive text messages via Twilio', signupUrl: 'https://twilio.com/try-twilio', live: false },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    emoji: '\u{1F4F1}',
    channels: [
      { id: 'facebook', name: 'Facebook Messenger', desc: 'Respond to Facebook Page messages', signupUrl: 'https://www.facebook.com/business', live: true },
      { id: 'instagram', name: 'Instagram', desc: 'Handle Instagram DMs and comments', signupUrl: 'https://business.instagram.com', live: false },
      { id: 'linkedin', name: 'LinkedIn', desc: 'Manage messages and connection requests', signupUrl: 'https://www.linkedin.com/business', live: false },
      { id: 'twitter', name: 'Twitter / X', desc: 'Manage DMs and mentions', signupUrl: 'https://twitter.com', live: true },
      { id: 'tiktok', name: 'TikTok', desc: 'Monitor TikTok comments and DMs', signupUrl: 'https://www.tiktok.com/business', live: false },
      { id: 'youtube', name: 'YouTube', desc: 'Manage YouTube video comments', signupUrl: 'https://youtube.com', live: false },
      { id: 'pinterest', name: 'Pinterest', desc: 'Manage Pinterest business messages', signupUrl: 'https://pinterest.com/business', live: false },
      { id: 'snapchat', name: 'Snapchat', desc: 'Connect Snapchat for Business', signupUrl: 'https://forbusiness.snapchat.com', live: false },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    emoji: '\u{1F4AC}',
    channels: [
      { id: 'whatsapp', name: 'WhatsApp Business', desc: 'Two-way WhatsApp messaging via Twilio', signupUrl: 'https://business.whatsapp.com', live: false },
      { id: 'telegram', name: 'Telegram', desc: 'Connect a Telegram bot to your inbox', signupUrl: 'https://telegram.org', live: false },
      { id: 'discord', name: 'Discord', desc: 'Monitor Discord server messages', signupUrl: 'https://discord.com/developers', live: false },
      { id: 'slack', name: 'Slack', desc: 'Receive Slack messages as inbox threads', signupUrl: 'https://slack.com/intl/en-us/get-started', live: false },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    emoji: '\u{1F527}',
    channels: [
      { id: 'hubspot', name: 'HubSpot', desc: 'Sync HubSpot contact conversations', signupUrl: 'https://app.hubspot.com/signup', live: false },
      { id: 'salesforce', name: 'Salesforce', desc: 'Pull Salesforce case and email activity', signupUrl: 'https://www.salesforce.com/form/signup', live: false },
      { id: 'zapier', name: 'Zapier', desc: 'Trigger inbox actions from Zapier workflows', signupUrl: 'https://zapier.com/sign-up', live: false },
      { id: 'intercom', name: 'Intercom', desc: 'Pull in Intercom conversations', signupUrl: 'https://app.intercom.com/a/signup', live: false },
      { id: 'zendesk', name: 'Zendesk', desc: 'Sync Zendesk support tickets', signupUrl: 'https://www.zendesk.com/register', live: false },
      { id: 'webhook', name: 'Custom Webhook', desc: 'Receive messages from any external source', signupUrl: null, live: false, configForm: true },
    ],
  },
];

export default function ChannelsSettingsPage() {
  const [channels, setChannels] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [showAddChannel, setShowAddChannel] = useState(false);

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

  const connectChannel = async (channelId) => {
    setConnecting(channelId);
    try {
      const res = await api.get(`/api/v1/channels/oauth/${channelId}/authorize`);
      const data = res.data?.data || res.data || {};

      if (data.authUrl) {
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
          data.authUrl,
          'OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        setTimeout(() => {
          fetchConnections();
          setConnecting(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Connect error:', err);
      alert('Failed to connect channel: ' + (err.response?.data?.error || err.message));
      setConnecting(null);
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

  const getConnectionForChannel = (channelId) => {
    return connections.find(c => c.channel === channelId && c.isActive);
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
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Connected Channels
          </h2>

          {connectedChannels.length === 0 ? (
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <Settings className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400 text-sm">No channels connected yet.</p>
              <p className="text-neutral-500 text-xs mt-1 font-light">Click "Add a Channel" below to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedChannels.map((conn) => {
                const info = getChannelInfo(conn.channel);
                const Icon = CHANNEL_ICONS[conn.channel] || Globe;
                const isDisconnecting = connecting === conn.channel;

                return (
                  <div
                    key={conn.id || conn.channel}
                    className="relative rounded-2xl bg-neutral-900/30 border border-green-500/20 p-5 group hover:border-green-500/40 transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
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
                    </div>

                    <button
                      onClick={() => disconnectChannel(conn.channel)}
                      disabled={isDisconnecting}
                      className="w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {isDisconnecting ? (
                        <><RefreshCw className="w-3 h-3 animate-spin" /> Disconnecting...</>
                      ) : (
                        <><X className="w-3 h-3" /> Disconnect</>
                      )}
                    </button>
                  </div>
                );
              })}
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
                  <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>{category.emoji}</span>
                    {category.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.channels.map((channel) => {
                      const Icon = CHANNEL_ICONS[channel.id] || Globe;
                      const connected = isConnected(channel.id);
                      const isConnecting = connecting === channel.id;

                      return (
                        <div
                          key={channel.id}
                          className={`rounded-2xl border p-4 transition-all ${
                            connected
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-neutral-900/30 border-white/10 hover:border-indigo-500/30'
                          }`}
                        >
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
                                {channel.live ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30 flex-shrink-0">
                                    Live
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex-shrink-0">
                                    Coming Soon
                                  </span>
                                )}
                                {connected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-neutral-500 text-xs leading-relaxed">{channel.desc}</p>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 mt-3">
                                {channel.signupUrl && (
                                  <a
                                    href={channel.signupUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1"
                                  >
                                    Sign Up <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}

                                {connected ? (
                                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-green-400">
                                    Connected
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => connectChannel(channel.id)}
                                    disabled={isConnecting}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isConnecting ? (
                                      <><RefreshCw className="w-3 h-3 animate-spin" /> Connecting...</>
                                    ) : (
                                      <>Connect <ArrowRight className="w-3 h-3" /></>
                                    )}
                                  </button>
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
