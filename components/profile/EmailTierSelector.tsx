'use client';

import { Mail, Zap, Shield, Clock, Check, ArrowRight, Loader2 } from 'lucide-react';

interface EmailTierSelectorProps {
  hasActivePool: boolean;
  freeAccountCount: number;
  onConnectOwn: () => void;
  onSubscribePool: () => void;
  loading: boolean;
}

export default function EmailTierSelector({
  hasActivePool,
  freeAccountCount,
  onConnectOwn,
  onSubscribePool,
  loading,
}: EmailTierSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 hover:border-white/[0.15] transition-all">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Use Your Own Email</h3>
            <span className="text-xs text-green-400 font-medium">Free</span>
          </div>
        </div>

        <ul className="space-y-2 mb-4">
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            Connect Gmail, Outlook, or custom SMTP
          </li>
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            50 emails/day limit to protect your reputation
          </li>
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            Basic health monitoring included
          </li>
        </ul>

        {freeAccountCount > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{freeAccountCount} connected</span>
            <button
              onClick={onConnectOwn}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              Add Another <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectOwn}
            className="w-full py-2.5 px-4 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Connect Your Email
          </button>
        )}
      </div>

      <div
        className={`relative bg-white/[0.03] border rounded-xl p-5 transition-all ${
          hasActivePool
            ? 'border-green-500/30 bg-green-500/[0.02]'
            : 'border-purple-500/20 hover:border-purple-500/40'
        }`}
      >
        {!hasActivePool && (
          <div className="absolute -top-2.5 right-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Recommended
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              hasActivePool ? 'bg-green-500/10' : 'bg-purple-500/10'
            }`}
          >
            <Zap className={`w-4 h-4 ${hasActivePool ? 'text-green-400' : 'text-purple-400'}`} />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Managed Email Pool</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-400 font-medium">$49/month</span>
              {hasActivePool && (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        <ul className="space-y-2 mb-4">
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Zap className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
            4 pre-warmed rotating email addresses
          </li>
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            800 emails/day (200 per address × 4)
          </li>
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            Fully managed warmup & reputation by AI
          </li>
          <li className="flex items-start gap-2 text-xs text-white/50">
            <Clock className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
            Auto-rotation: if one flagged, shifts to others
          </li>
        </ul>

        {hasActivePool ? (
          <div className="text-xs text-green-400/60 text-center">
            ✓ Your pool is active and managed
          </div>
        ) : (
          <button
            onClick={onSubscribePool}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Subscribe — $49/mo
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
