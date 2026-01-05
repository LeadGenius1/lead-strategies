'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { Mail, Check, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'

export default function LeadSiteAIPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
            <Mail className="w-4 h-4" />
            LeadSite.AI Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
            Email Lead Generation<br />Powered by AI
          </h1>
          
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            Generate high-quality leads through AI-powered email prospecting. Target the right prospects, craft personalized messages, and close more deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard/leadsite-ai">
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
          <h2 className="text-3xl font-medium text-center mb-12">Everything You Need to Generate Leads</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Zap className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">AI-Powered Targeting</h3>
              <p className="text-neutral-400">Find the perfect prospects using advanced AI algorithms that analyze company data, job titles, and engagement patterns.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Target className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Personalized Outreach</h3>
              <p className="text-neutral-400">Craft personalized email campaigns that resonate with your target audience and drive higher response rates.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <TrendingUp className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Analytics & Insights</h3>
              <p className="text-neutral-400">Track open rates, responses, and conversions with detailed analytics to optimize your campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">Start Generating Leads Today</h2>
          <p className="text-neutral-400 mb-8">$59/month - All features included</p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}

