'use client';

import { ReactNode } from 'react';

interface AetherCardProps {
  children: ReactNode;
  variant?: 'default' | 'indigo' | 'purple' | 'cyan';
  className?: string;
  hover?: boolean;
}

export default function AetherCard({
  children,
  variant = 'default',
  className = '',
  hover = true,
}: AetherCardProps) {
  const variantClasses = {
    default: hover ? 'hover:border-indigo-500/50' : '',
    indigo: hover ? 'hover:border-indigo-500/50' : '',
    purple: hover ? 'hover:border-purple-500/50' : '',
    cyan: hover ? 'hover:border-cyan-500/50' : '',
  };

  const gradientClasses = {
    default: 'from-indigo-500/10',
    indigo: 'from-indigo-500/10',
    purple: 'from-purple-500/10',
    cyan: 'from-cyan-500/10',
  };

  return (
    <div className={`group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 transition-all duration-500 overflow-hidden ${variantClasses[variant]} ${className}`}>
      {hover && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[variant]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Icon Container Component
interface AetherIconProps {
  children: ReactNode;
  variant?: 'indigo' | 'purple' | 'cyan';
  className?: string;
}

export function AetherIcon({ children, variant = 'indigo', className = '' }: AetherIconProps) {
  const colorClasses = {
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${colorClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ value, label, icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`stat-card-aether ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
          {trend && (
            <div className={`text-xs mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="text-indigo-400 opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
