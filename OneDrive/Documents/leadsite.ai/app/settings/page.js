'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'
import { User, Bell, CreditCard, Shield, Save } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-medium tracking-tight mb-8">Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'billing', icon: CreditCard, label: 'Billing' },
                { id: 'security', icon: Shield, label: 'Security' }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/20 border border-indigo-500/50 text-white'
                        : 'bg-neutral-900/40 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="md:col-span-3">
              <div className="bg-neutral-900/40 border border-white/10 rounded-xl p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium mb-6">Profile Settings</h2>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Michael McLeod"
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="michael@aileadstrategies.com"
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Company</label>
                      <input
                        type="text"
                        defaultValue="AI Lead Strategies LLC"
                        className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                      />
                    </div>
                    <button className="relative group inline-flex overflow-hidden rounded-lg p-[1px]">
                      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#6366f1_50%,#000000_100%)]"></span>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium backdrop-blur-3xl">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </span>
                    </button>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-medium mb-6">Billing & Subscription</h2>
                    <div className="p-6 rounded-lg bg-indigo-500/10 border border-indigo-500/50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-white">Tackle.IO</h3>
                          <p className="text-sm text-neutral-400">Full Suite + Voice + CRM</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">$499<span className="text-sm text-neutral-400 font-normal">/mo</span></div>
                          <div className="text-xs text-emerald-400">Active</div>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Change Plan</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
