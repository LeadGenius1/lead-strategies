'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Mail, MessageSquare, Phone, Settings, CheckCircle2, X, 
  RefreshCw, Facebook, Instagram, Twitter, Linkedin, 
  Slack, Video, Globe
} from 'lucide-react';
import Link from 'next/link';

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  webchat: MessageSquare,
  voice: Phone,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  slack: Slack,
  discord: MessageSquare,
  teams: Video,
  telegram: MessageSquare
};

export default function ChannelsSettingsPage() {
  const [channels, setChannels] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

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
      // This endpoint would need to be created
      // For now, we'll use the channels endpoint
      const res = await api.get('/api/v1/channels');
      // In production, would fetch from /api/v1/channels/connections
      setConnections([]);
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
        // Open OAuth popup
        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;
        
        window.open(
          data.authUrl,
          'OAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Poll for connection status (in production, use WebSocket or callback)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading channels...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/inbox"
            className="text-neutral-400 hover:text-white mb-4 inline-flex items-center gap-2 text-sm"
          >
            ← Back to Inbox
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Channel Connections</h1>
          <p className="text-neutral-400">Connect your communication channels to the unified inbox</p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const Icon = CHANNEL_ICONS[channel.id] || Globe;
            const connected = isConnected(channel.id);
            const isConnecting = connecting === channel.id;

            return (
              <div
                key={channel.id}
                className="bg-neutral-900 rounded-xl border border-white/10 p-6 hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channel.bgClass || 'bg-neutral-800'}`}>
                      <Icon className={`w-5 h-5 ${channel.textClass || 'text-neutral-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{channel.name}</h3>
                      <p className="text-neutral-400 text-xs">{channel.provider || 'Internal'}</p>
                    </div>
                  </div>
                  {connected && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>

                {channel.description && (
                  <p className="text-neutral-400 text-sm mb-4">{channel.description}</p>
                )}

                <button
                  onClick={() => connected ? disconnectChannel(channel.id) : connectChannel(channel.id)}
                  disabled={isConnecting}
                  className={`w-full px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    connected
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : connected ? (
                    <>
                      <X className="w-4 h-4" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {channels.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No channels available</h3>
            <p className="text-neutral-400">Channels will appear here when configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
