'use client';

import { LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { PLATFORM_DISPLAY_NAMES } from '@/lib/platformFeatures';

export default function NexusTopBar({ user, platformType, isConnected, isReconnecting }) {
  const router = useRouter();
  const platformName = PLATFORM_DISPLAY_NAMES[platformType] || 'NEXUS';
  const planLabel = user?.plan_tier || user?.planTier || 'Free';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin;

  const handleLogout = () => {
    Cookies.remove('token');
    if (Cookies.get('admin_token')) {
      Cookies.remove('admin_token');
      Cookies.remove('admin_user');
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  // Connection status
  let statusColor = 'bg-red-500';
  let statusLabel = 'Offline';
  if (isConnected) {
    statusColor = 'bg-emerald-500';
    statusLabel = 'Connected';
  } else if (isReconnecting) {
    statusColor = 'bg-amber-500';
    statusLabel = 'Reconnecting';
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-black/60 backdrop-blur-md border-b border-white/5 flex-shrink-0 z-30">
      {/* Left: Brand + platform */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-white tracking-wide">NEXUS OS</span>
        <span className="hidden sm:inline text-xs text-neutral-500">{platformName}</span>
      </div>

      {/* Center-left: Lead Hunter status */}
      <div className="hidden sm:flex items-center gap-2 ml-4">
        <div className={`w-2 h-2 rounded-full ${statusColor} ${isReconnecting ? 'animate-pulse' : ''}`} />
        <span className="text-xs text-neutral-400">Lead Hunter: {statusLabel}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Admin link + User info + logout */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link
            href="/nexus/command-center"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/25 transition"
            title="Command Center"
          >
            <Shield className="h-3 w-3" />
            <span>Command Center</span>
          </Link>
        )}
        {user && (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-white truncate max-w-[140px]">
                {user.name || user.email}
              </span>
              <span className="text-[10px] text-indigo-400">{planLabel}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xs text-indigo-300 font-medium">
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          </>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
