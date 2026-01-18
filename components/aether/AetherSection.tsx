'use client';

import { ReactNode } from 'react';

interface AetherSectionProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
  id?: string;
}

export default function AetherSection({
  children,
  className = '',
  border = false,
  id,
}: AetherSectionProps) {
  return (
    <section 
      id={id}
      className={`relative z-10 py-24 px-6 ${border ? 'border-y border-white/5 bg-neutral-950/50' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

// Hero Section Component
interface AetherHeroProps {
  badge?: string;
  badgeLive?: boolean;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
}

export function AetherHero({ badge, badgeLive = false, title, subtitle, children }: AetherHeroProps) {
  return (
    <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] md:text-xs font-medium tracking-wide mb-8 animate-fade-in-up">
          {badgeLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          )}
          {badge}
        </div>
      )}

      <h1 className="text-4xl md:text-7xl font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 max-w-4xl mx-auto mb-6 leading-[1.1]">
        {title}
      </h1>

      {subtitle && (
        <p className="text-neutral-400 text-sm md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-light">
          {subtitle}
        </p>
      )}

      {children}
    </section>
  );
}

// CTA Section Component
interface AetherCTAProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function AetherCTA({ title, subtitle, children }: AetherCTAProps) {
  return (
    <section className="relative z-10 py-24 px-6">
      <div className="max-w-4xl mx-auto rounded-3xl bg-neutral-900/40 border border-white/10 p-8 md:p-12 text-center overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 relative z-10">{title}</h2>
        
        {subtitle && (
          <p className="text-neutral-400 text-sm md:text-base mb-10 max-w-lg mx-auto font-light relative z-10">
            {subtitle}
          </p>
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </section>
  );
}
