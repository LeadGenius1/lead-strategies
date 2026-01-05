'use client'

import { useState } from 'react'
import Navigation from '../../../components/Navigation'
import { Globe, TrendingUp, Eye, MousePointerClick, Plus, Search, Download } from 'lucide-react'

export default function LeadSiteIODashboard() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">LeadSite.IO</h1>
                <p className="text-neutral-500 text-sm">AI Website Builder Dashboard</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Active Sites</div>
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">12</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3 this month</span>
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Total Visitors</div>
                  <Eye className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">45.2K</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18.7% from last month</span>
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-pink-500/50 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Conversion Rate</div>
                  <MousePointerClick className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">8.4%</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.1% from last month</span>
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-indigo-500/50 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Leads Generated</div>
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">3,847</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+22.3% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-white/10 rounded-xl p-8 text-center">
            <h2 className="text-xl font-medium mb-4">Your Websites</h2>
            <p className="text-neutral-500 text-sm mb-6">Manage and create AI-powered websites</p>
            <button className="relative group inline-flex overflow-hidden rounded-lg p-[1px]">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#a855f7_50%,#000000_100%)]"></span>
              <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl">
                <Plus className="w-4 h-4" />
                <span>Create New Website</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
