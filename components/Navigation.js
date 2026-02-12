'use client'

import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const platforms = [
  { name: 'LeadSite.AI', href: '/leadsite-ai', price: '$49/mo', description: 'AI Email Lead Generation' },
  { name: 'LeadSite.IO', href: '/leadsite-io', price: '$49/mo', description: 'AI Website Builder' },
  { name: 'ClientContact.IO', href: '/clientcontact-io', price: '$99/mo', description: '22+ Channel Inbox' },
  { name: 'UltraLead', href: '/ultralead', price: '$499/mo', description: 'Full CRM + 7 AI Agents', featured: true },
  { name: 'VideoSite.AI', href: '/videosite-ai', price: 'FREE', description: 'Earn $1/Viewer' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full"></div>
          <span className="text-sm font-medium tracking-widest uppercase text-white">AI LEAD STRATEGIES</span>
          <span className="text-[10px] text-neutral-500 font-geist normal-case hidden sm:inline">aileadstrategies.com</span>
        </Link>

        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-neutral-400">
          <div className="relative">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Products <ChevronDown className={`w-4 h-4 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-0 mt-1 py-2 w-64 bg-black/95 border border-white/10 rounded-lg shadow-xl z-50">
                {platforms.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="block px-4 py-2 hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
                    onClick={() => setProductsOpen(false)}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-neutral-500 ml-1">— {p.price}</span>
                    {p.featured && <span className="ml-2 text-[10px] bg-purple-500/30 text-purple-300 px-1 rounded">FLAGSHIP</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
            <Link href="/leadsite-ai" className="text-sm text-neutral-400 hover:text-white transition-colors">LeadSite.AI</Link>
            <Link href="/leadsite-io" className="text-sm text-neutral-400 hover:text-white transition-colors">LeadSite.IO</Link>
            <Link href="/clientcontact-io" className="text-sm text-neutral-400 hover:text-white transition-colors">ClientContact.IO</Link>
            <Link href="/ultralead" className="text-sm text-neutral-400 hover:text-white transition-colors">UltraLead</Link>
            <Link href="/videosite-ai" className="text-sm text-neutral-400 hover:text-white transition-colors">VideoSite.AI</Link>
            <Link href="/signup" className="text-sm text-neutral-400 hover:text-white transition-colors">Get Started</Link>
            <Link href="/login" className="text-sm text-white bg-white/10 px-4 py-2 rounded-full text-center">Client Login</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
