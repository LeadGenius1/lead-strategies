'use client';

import { Mail, Shield, TrendingUp, MoreVertical, Unplug, Trash2 } from 'lucide-react';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  WARMING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAUSED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  DISCONNECTED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ERROR: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const PROVIDER_LABELS: Record<string, string> = {
  GMAIL: '🔵 Gmail',
  OUTLOOK: '🟦 Outlook',
  SMTP: '⚙️ SMTP',
  MANAGED_POOL: '🏊 Pool',
};

interface EmailAccountCardProps {
  account: {
    id: string;
    email: string;
    displayName: string | null;
    provider: 'GMAIL' | 'OUTLOOK' | 'SMTP' | 'MANAGED_POOL';
    status: 'ACTIVE' | 'WARMING' | 'PAUSED' | 'DISCONNECTED' | 'ERROR';
    tier: 'FREE' | 'PRO';
    reputationScore: number;
    dailyLimit: number;
    dailySentCount: number;
    bounceRate: number;
    warmupCurrentDay: number;
  };
  onDisconnect: () => void;
  onDelete: () => void;
}

export default function EmailAccountCard({ account, onDisconnect, onDelete }: EmailAccountCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{account.email}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[account.status] || STATUS_COLORS.DISCONNECTED}`}>
              {account.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/40">
            <span>{PROVIDER_LABELS[account.provider] || account.provider}</span>
            <span>Free Plan • {account.dailyLimit}/day</span>
            {account.status === 'WARMING' && <span>Day {account.warmupCurrentDay}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <Shield
            className={`w-3.5 h-3.5 ${
              account.reputationScore >= 80 ? 'text-green-400' : account.reputationScore >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}
          />
          <span className="text-white/50">{account.reputationScore}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <TrendingUp className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/50">
            {account.dailySentCount}/{account.dailyLimit}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} aria-hidden="true" />
              <div className="absolute right-0 top-8 z-50 w-44 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-1">
                <button
                  onClick={() => {
                    onDisconnect();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                >
                  <Unplug className="w-4 h-4" />
                  Disconnect
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
