'use client'

import Link from 'next/link'
import { useState } from 'react'

const PLATFORM_TABS = [
  { id: 'ai-lead', label: 'AI LEAD', href: '/' },
  { id: 'leadsite-ai', label: 'LEADSITE.AI', href: '/leadsite-ai' },
  { id: 'leadsite-io', label: 'LEADSITE.IO', href: '/leadsite-io' },
  { id: 'clientcontact', label: 'CLIENTCONTACT', href: '/clientcontact-io' },
  { id: 'tackle', label: 'TACKLE.IO', href: '/tackle-io' },
]

export default function PlatformHeader({ activePlatform = 'ai-lead' }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Platform Tabs */}
        <div className="flex items-center gap-6 text-xs font-medium">
          {PLATFORM_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`hover:text-white transition-colors ${
                activePlatform === tab.id ? 'text-white' : 'text-neutral-500'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span className="text-sm font-bold text-white tracking-wider">AI LEAD</span>
        </div>

        {/* CTA Button */}
        <Link
          href="/signup"
          className="px-6 py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-100 transition-colors"
        >
          START FREE TRIAL
        </Link>
      </div>
    </nav>
  )
}
