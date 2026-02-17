'use client';

import { useState } from 'react';
import { X, Copy, Check, Mail, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { generateShareLinks, getWatchUrl, copyToClipboard } from '@/lib/share';

const PLATFORMS = [
  { key: 'facebook', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', icon: 'f' },
  { key: 'twitter', label: 'X / Twitter', color: 'bg-neutral-700 hover:bg-neutral-600', icon: '𝕏' },
  { key: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800', icon: 'in' },
  { key: 'whatsapp', label: 'WhatsApp', color: 'bg-green-600 hover:bg-green-700', IconComponent: MessageCircle },
  { key: 'telegram', label: 'Telegram', color: 'bg-sky-500 hover:bg-sky-600', IconComponent: Send },
  { key: 'reddit', label: 'Reddit', color: 'bg-orange-600 hover:bg-orange-700', icon: 'r/' },
  { key: 'email', label: 'Email', color: 'bg-neutral-600 hover:bg-neutral-500', IconComponent: Mail },
];

export default function ShareModal({ videoId, videoTitle, videoDescription, onClose }) {
  const [copied, setCopied] = useState(false);
  const links = generateShareLinks(videoId, videoTitle, videoDescription);
  const watchUrl = getWatchUrl(videoId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(watchUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlatformClick = (key) => {
    const url = links[key];
    if (!url) return;
    if (key === 'email') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">Share Video</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Video title preview */}
          <p className="text-sm text-neutral-400 truncate">{videoTitle}</p>

          {/* Platform grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {PLATFORMS.map((p) => (
              <button
                key={p.key}
                onClick={() => handlePlatformClick(p.key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${p.color} text-white text-xs font-medium transition-all hover:scale-105`}
              >
                {p.IconComponent ? (
                  <p.IconComponent className="w-5 h-5" />
                ) : (
                  <span className="text-base font-bold leading-5">{p.icon}</span>
                )}
                <span className="truncate w-full text-center">{p.label}</span>
              </button>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <input
              readOnly
              value={watchUrl}
              className="flex-1 px-3 py-2.5 rounded-xl bg-neutral-800/50 border border-white/10 text-sm text-neutral-300 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
