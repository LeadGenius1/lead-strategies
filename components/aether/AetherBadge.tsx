'use client';

import { ReactNode } from 'react';

interface AetherBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'live' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function AetherBadge({
  children,
  variant = 'default',
  className = '',
}: AetherBadgeProps) {
  const variantClasses = {
    default: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    live: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    success: 'border-green-500/30 bg-green-500/10 text-green-300',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] md:text-xs font-medium tracking-wide ${variantClasses[variant]} ${className}`}>
      {variant === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
      )}
      {children}
    </div>
  );
}
