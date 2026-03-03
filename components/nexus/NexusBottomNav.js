'use client';

import Link from 'next/link';
import {
  Activity,
  Target,
  Mail,
  Users,
  Globe,
  PlayCircle,
  Settings,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ICON_MAP = {
  Activity,
  Target,
  Mail,
  Users,
  Globe,
  PlayCircle,
  Settings,
};

export default function NexusBottomNav({ panels, pathname }) {
  return (
    <nav className="flex items-center bg-black/60 backdrop-blur-md border-t border-white/5 overflow-x-auto flex-shrink-0 z-30">
      {panels.map((panel) => {
        const Icon = ICON_MAP[panel.icon] || Activity;
        const isActive =
          pathname === panel.href || pathname.startsWith(panel.href + '/');

        if (panel.locked) {
          return (
            <button
              key={panel.id}
              onClick={() =>
                toast('Upgrade to UltraLead to unlock this feature', {
                  icon: '🔒',
                  duration: 3000,
                })
              }
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 min-w-[72px] text-neutral-600 relative"
            >
              <div className="relative">
                <Icon className="h-5 w-5 opacity-40" />
                <Lock className="h-2.5 w-2.5 absolute -top-0.5 -right-1 text-neutral-500" />
              </div>
              <span className="text-[10px] truncate opacity-40">{panel.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={panel.id}
            href={panel.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2.5 min-w-[72px] transition-colors ${
              isActive
                ? 'bg-indigo-500/10 border-t-2 border-indigo-500/60 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border-t-2 border-transparent'
            }`}
          >
            <Icon
              className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`}
            />
            <span className="text-[10px] truncate">{panel.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
