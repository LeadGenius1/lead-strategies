'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { ExternalLink, FileText } from 'lucide-react'

export default function HTMLPagesPage() {
  // All HTML pages available in the public directory
  const htmlPages = [
    {
      name: 'AI Lead Strategies Homepage',
      file: 'aileadstrategies-homepage-sypha-ui.html',
      description: 'Main homepage with Sypha UI styling'
    },
    {
      name: 'VideoSite AI Landing Page',
      file: 'VIDEOSITE-AI-LANDING-PAGE.html',
      description: 'VideoSite platform landing page'
    },
    {
      name: 'Video Test Page',
      file: 'VIDEO-TEST.html',
      description: 'Video testing interface'
    },
    {
      name: 'Video Test Page (Alt)',
      file: 'VIDEO-TEST (1).html',
      description: 'Alternative video test page'
    },
    {
      name: 'Autocut AI Video Editor',
      file: 'Autocut AI Video Editor Landing Page Template.html',
      description: 'Video editor landing page template'
    },
    {
      name: 'Autocut AI Video Editor (Alt 1)',
      file: 'Autocut AI Video Editor Landing Page Template (1).html',
      description: 'Alternative video editor template'
    },
    {
      name: 'Autocut AI Video Editor (Alt 2)',
      file: 'Autocut AI Video Editor Landing Page Template (2).html',
      description: 'Alternative video editor template'
    },
    {
      name: 'Video Editing Interface',
      file: 'Video Editing Interface Layout.html',
      description: 'Video editing interface layout'
    }
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
              HTML Landing Pages
            </h1>
            <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
              Access all available HTML landing pages and templates
            </p>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {htmlPages.map((page, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-1 truncate">{page.name}</h3>
                      <p className="text-xs text-neutral-400 line-clamp-2">{page.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <a
                      href={`/${page.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>View Page</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-neutral-900/40 border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="font-medium text-white mb-2">About These Pages</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              These HTML pages are static landing pages and templates stored in the <code className="text-indigo-400">/public</code> directory. 
              They can be accessed directly via their URLs or embedded into the Next.js application as needed.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}


