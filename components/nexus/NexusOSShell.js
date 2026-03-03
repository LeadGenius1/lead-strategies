'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X } from 'lucide-react';
import NexusTopBar from './NexusTopBar';
import NexusBottomNav from './NexusBottomNav';
import { getNexusPanels } from '@/lib/nexusFeatures';
import { useSchedulerFeed } from '@/lib/scheduler/useSchedulerFeed';
import AssistantChat from '@/app/(dashboard)/nexus/cockpit/components/AssistantChat';

export default function NexusOSShell({ user, platformType, children }) {
  const pathname = usePathname();
  const [chatOpen, setChatOpen] = useState(false);

  const panels = getNexusPanels(user?.tier);

  // Connection state for top bar status badge
  const { isConnected, isReconnecting } = useSchedulerFeed();

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Top Bar */}
      <NexusTopBar
        user={user}
        platformType={platformType}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
      />

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>

        {/* Assistant Chat — desktop: always visible, mobile: slide-over */}
        {/* Desktop: fixed 320px sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-l border-white/5 bg-black/40 backdrop-blur-md">
          <AssistantChat />
        </aside>

        {/* Mobile: slide-over panel */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setChatOpen(false)}
            />
            {/* Panel */}
            <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-[#0a0a0a] border-l border-white/5 flex flex-col z-10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-sm font-medium text-white">Lead Hunter</span>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <AssistantChat />
            </aside>
          </div>
        )}

        {/* Mobile toggle button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-20 right-4 z-40 lg:hidden w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 transition"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Nav */}
      <NexusBottomNav panels={panels} pathname={pathname} />
    </div>
  );
}
