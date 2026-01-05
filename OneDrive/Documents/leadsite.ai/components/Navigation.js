'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
          <span className="text-sm font-medium tracking-widest uppercase text-white">AI LEAD STRATEGIES</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
          <Link href="/#platforms" className="hover:text-white transition-colors">Platforms</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
        </div>

        <Link 
          href="/login"
          className="hidden md:flex text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-full transition-all text-white"
        >
          Client Login
        </Link>

        <button 
          className="md:hidden text-neutral-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-b border-white/5">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link href="/#platforms" className="text-sm text-neutral-400 hover:text-white transition-colors">Platforms</Link>
            <Link href="/#features" className="text-sm text-neutral-400 hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm text-neutral-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/signup" className="text-sm text-neutral-400 hover:text-white transition-colors">Get Started</Link>
            <Link href="/login" className="text-sm text-white bg-white/10 px-4 py-2 rounded-full text-center">Client Login</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
