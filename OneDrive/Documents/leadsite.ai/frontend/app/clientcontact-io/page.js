'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { MessageSquare, Check, ArrowRight, Share2, Inbox, Zap } from 'lucide-react'

export default function ClientContactIOPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-8">
            <MessageSquare className="w-4 h-4" />
            ClientContact.IO Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
            Omnichannel Marketing<br />Across 22+ Platforms
          </h1>
          
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Manage all your marketing channels from one unified dashboard. LinkedIn, Instagram, Facebook, Twitter, TikTok, YouTube, Email, SMS, WhatsApp and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard/clientcontact-io">
              <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-medium transition-colors border border-white/10">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-medium text-center mb-12">Connect With Your Audience Everywhere</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Share2 className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">22+ Social Platforms</h3>
              <p className="text-neutral-400">Manage LinkedIn, Instagram, Facebook, Twitter, TikTok, YouTube, and more from one place.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Inbox className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Unified Inbox</h3>
              <p className="text-neutral-400">See all messages, comments, and interactions across all platforms in one unified inbox.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Zap className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Advanced Automation</h3>
              <p className="text-neutral-400">Automate your marketing workflows and save hours every day with smart automation tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">Start Managing All Channels</h2>
          <p className="text-neutral-400 mb-8">$149/month - All previous features + 22+ social platforms</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

