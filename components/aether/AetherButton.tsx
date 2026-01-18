'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AetherButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
}

export default function AetherButton({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
}: AetherButtonProps) {
  const baseClasses = 'transition-all duration-200 font-medium inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'relative overflow-hidden rounded-full p-[1px] focus:outline-none hover:scale-105 active:scale-95',
    secondary: 'text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full text-white',
    ghost: 'text-xs text-neutral-400 hover:text-white px-4 py-2',
    cta: 'bg-white text-black px-6 py-3 rounded-lg text-sm hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]',
  };

  const content = variant === 'primary' ? (
    <>
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
      <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors gap-2">
        {children}
        {icon && <span className="group-hover:translate-x-1 transition-transform">{icon}</span>}
      </span>
    </>
  ) : (
    <>
      {children}
      {icon && <span className="group-hover:translate-x-1 transition-transform">{icon}</span>}
    </>
  );

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className} group`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${combinedClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {content}
    </button>
  );
}

// Arrow Icon Component
export function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
