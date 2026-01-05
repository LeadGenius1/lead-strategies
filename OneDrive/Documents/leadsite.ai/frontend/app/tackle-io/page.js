'use client'

import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { Briefcase, Check, ArrowRight, Phone, Database, Headphones } from 'lucide-react'

export default function TackleIOPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
            <Briefcase className="w-4 h-4" />
            Tackle.IO Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">
            Complete Business Suite<br />Voice + CRM + Everything
          </h1>
          
          <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
            The ultimate all-in-one platform. Includes all features from every platform plus AI voice calls, advanced CRM, and dedicated account manager.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard/tackle-io">
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
          <h2 className="text-3xl font-medium text-center mb-12">Everything Your Business Needs</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Phone className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">AI Voice Calls</h3>
              <p className="text-neutral-400">Make and receive AI-powered voice calls to automate your sales and support processes.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Database className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Advanced CRM</h3>
              <p className="text-neutral-400">Complete customer relationship management with advanced analytics and automation.</p>
            </div>

            <div className="p-6 rounded-xl bg-neutral-900/50 border border-white/10">
              <Headphones className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Priority Support</h3>
              <p className="text-neutral-400">Get dedicated account manager and priority support for all your business needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">Get The Complete Suite</h2>
          <p className="text-neutral-400 mb-8">$499/month - All platform features + Voice + CRM + Priority Support</p>
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

