'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '../../../components/Navigation'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { Mail, TrendingUp, Users, Target, Plus, Search, Download, Filter } from 'lucide-react'

function LeadSiteAIDashboardContent() {
  const [stats, setStats] = useState({
    totalLeads: 8547,
    activeLeads: 2341,
    openRate: 34.2,
    responseRate: 12.8
  })

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight">LeadSite.AI</h1>
                <p className="text-neutral-500 text-sm">Email Lead Generation Dashboard</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Stat 1 */}
            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Total Leads</div>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.totalLeads.toLocaleString()}</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12.5% from last month</span>
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Active Leads</div>
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.activeLeads.toLocaleString()}</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+8.3% from last month</span>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Open Rate</div>
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.openRate}%</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+5.2% from last month</span>
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="group relative p-6 rounded-xl bg-neutral-900/40 border border-white/10 hover:border-pink-500/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-neutral-400 text-xs font-medium uppercase tracking-wide">Response Rate</div>
                  <Target className="w-4 h-4 text-pink-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.responseRate}%</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+3.7% from last month</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 rounded-lg transition-all text-sm font-medium">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <Link href="/dashboard/leadsite-ai/new-campaign">
              <button className="relative group flex items-center justify-center gap-2 overflow-hidden rounded-lg p-[1px] transition-transform hover:scale-[1.02]">
                <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl border border-white/10 group-hover:bg-neutral-900/80 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Campaign</span>
                </span>
              </button>
            </Link>
          </div>

          {/* Recent Leads Table */}
          <div className="bg-neutral-900/40 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-medium">Recent Leads</h2>
              <p className="text-sm text-neutral-500 mt-1">Your latest email prospects</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-white/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">Company</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">Last Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-neutral-400 uppercase tracking-wide">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp Inc', status: 'Active', lastContact: '2 hours ago', score: 95 },
                    { name: 'Michael Chen', email: 'michael@startupxyz.com', company: 'StartupXYZ', status: 'Active', lastContact: '5 hours ago', score: 88 },
                    { name: 'Emily Rodriguez', email: 'emily@designco.io', company: 'DesignCo', status: 'Responded', lastContact: '1 day ago', score: 92 },
                    { name: 'David Kim', email: 'david@innovate.ai', company: 'Innovate AI', status: 'Active', lastContact: '2 days ago', score: 85 },
                    { name: 'Jessica Taylor', email: 'jessica@growth.com', company: 'Growth Partners', status: 'Contacted', lastContact: '3 days ago', score: 78 },
                  ].map((lead, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-neutral-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-300">{lead.company}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'Active' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' :
                          lead.status === 'Responded' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{lead.lastContact}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-white w-8">{lead.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function LeadSiteAIDashboard() {
  return (
    <ProtectedRoute requiredTier="leadsite-ai">
      <LeadSiteAIDashboardContent />
    </ProtectedRoute>
  )
}
