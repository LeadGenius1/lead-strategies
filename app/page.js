import Link from 'next/link'
import { Zap, Users, Mail, TrendingUp, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm">
            🟢 ALL SYSTEMS OPERATIONAL
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Email Campaigns
            </span>
            <br />
            That Actually Convert
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Automate your email outreach with LeadSite.AI. Manage up to 50 leads, 
            create unlimited campaigns, and track your success - all for just $59/month.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Campaigns</h3>
            <p className="text-slate-300">
              Create and automate email campaigns with our easy-to-use template editor.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-cyan-500/20 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
            <p className="text-slate-300">
              Organize and track up to 50 leads with our intuitive CRM system.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-teal-500/20 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-slate-300">
              Track opens, clicks, and replies to optimize your campaigns.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automation</h3>
            <p className="text-slate-300">
              Set it and forget it. Your campaigns run on autopilot 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-300">Everything you need to start growing</p>
        </div>
        
        <div className="max-w-md mx-auto glass-card p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">LeadSite.AI</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">$59</span>
              <span className="text-slate-400">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Up to 50 leads</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Unlimited email campaigns</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Basic CRM</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Email analytics</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Email support</span>
            </li>
          </ul>
          
          <Link href="/signup" className="btn-primary w-full block text-center">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2025 LeadSite.AI - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}

