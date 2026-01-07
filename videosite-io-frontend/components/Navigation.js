'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navigation() {
  const pathname = usePathname()

  // Don't show nav on login/signup pages or homepage (has its own nav)
  if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
    return null
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300 border-b border-white/5 bg-void/70 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <Link
          href="/dashboard"
          className="font-serif text-lg font-bold tracking-widest text-gold-100 hover:text-gold-500 transition-colors uppercase z-50"
        >
          VideoSite.IO
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/dashboard/campaigns"
            className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
          >
            Campaigns
          </Link>
          <Link
            href="/dashboard/videos"
            className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
          >
            Videos
          </Link>
          <Link
            href="/dashboard/analytics"
            className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
          >
            Analytics
          </Link>
        </div>

        <Link
          href="/dashboard/settings"
          className="relative group px-6 py-2 overflow-hidden border border-gold-500/30 hover:border-gold-500 transition-all duration-500"
        >
          <div className="absolute inset-0 w-0 bg-gold-500/10 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
          <span className="relative text-[10px] font-semibold uppercase tracking-widest text-gold-300 group-hover:text-gold-100 flex items-center gap-2">
            Dashboard
          </span>
        </Link>
      </div>
    </nav>
  )
}




