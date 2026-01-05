'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { Globe, Check, ArrowRight, Sparkles, Code, Search } from 'lucide-react'

export default function LeadSiteIOPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8">
            <Globe className="w-4 h-4" />
            LeadSite.IO Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
            AI Website Builder<br />With Lead Generation
          </h1>
          
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Build stunning websites in minutes with AI. Includes all LeadSite.AI features plus custom domain, SEO optimization, and website hosting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard/leadsite-io">
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
          <h2 className="text-3xl font-medium text-center mb-12">Build, Deploy, Generate Leads</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">AI Website Builder</h3>
              <p className="text-neutral-400">Create professional websites in minutes using AI-powered design tools. No coding required.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Code className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Custom Domain</h3>
              <p className="text-neutral-400">Connect your own domain and build your brand with professional web presence.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Search className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">SEO Optimization</h3>
              <p className="text-neutral-400">Built-in SEO tools to help your website rank higher in search results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">Start Building Today</h2>
          <p className="text-neutral-400 mb-8">$79/month - Website builder + all LeadSite.AI features</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

