'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { Video, Check, ArrowRight, Play, DollarSign, Radio } from 'lucide-react'

export default function VideoSiteIOPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300 text-xs font-medium mb-8">
            <Video className="w-4 h-4" />
            VideoSite.IO Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
            Video Platform<br />With Creator Payments
          </h1>
          
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Host, monetize, and distribute video content globally. YouTube competitor with built-in payment system for creators.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard/videosite-io">
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
          <h2 className="text-3xl font-medium text-center mb-12">Everything Creators Need</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Play className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Video Hosting</h3>
              <p className="text-neutral-400">Upload and host unlimited videos with fast global CDN delivery.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <DollarSign className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Creator Payments</h3>
              <p className="text-neutral-400">Built-in payment system so creators can monetize their content directly.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Radio className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Live Streaming</h3>
              <p className="text-neutral-400">Stream live to your audience with professional streaming tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">Start Hosting Videos</h2>
          <p className="text-neutral-400 mb-8">$99/month - Video hosting + monetization tools</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

