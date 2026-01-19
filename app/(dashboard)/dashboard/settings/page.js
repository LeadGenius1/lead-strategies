'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { User, Building2, Mail, Shield, Link2, Trash2, Save, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    company: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    async function loadUser() {
      const data = await getCurrentUser()
      const userData = data?.user || data
      setUser(userData)
      setProfileData({
        name: userData?.name || '',
        company: userData?.company || '',
      })
      setLoading(false)
    }
    loadUser()
  }, [])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/api/users/profile', profileData)
      toast.success('Profile updated successfully!')
      const data = await getCurrentUser()
      setUser(data?.user || data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      await api.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const integrations = [
    { name: 'Gmail', icon: Mail, connected: true, description: 'Send emails via Gmail' },
    { name: 'LinkedIn', icon: Link2, connected: false, description: 'Sync LinkedIn contacts' },
    { name: 'Slack', icon: () => <span className="text-lg">#</span>, connected: true, description: 'Get notifications in Slack' },
    { name: 'Calendly', icon: () => <span className="text-lg">📅</span>, connected: false, description: 'Schedule meetings' },
  ]

  const tierInfo = {
    'tackle': { name: 'TackleAI', price: '$549/mo' },
    'clientcontact': { name: 'ClientContact.IO', price: '$199/mo' },
    'leadsite-io': { name: 'LeadSite.IO', price: '$114/mo' },
    'leadsite-ai': { name: 'LeadSite.AI', price: '$69/mo' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  const currentTier = tierInfo[user?.subscription_tier] || tierInfo['leadsite-ai']

  return (
    <div className="relative min-h-screen bg-black p-6">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">Settings</h1>
          <p className="text-neutral-500 mt-1 text-sm">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Profile</h2>
              <p className="text-xs text-neutral-500">Your personal information</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-neutral-500 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Company</label>
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Role</label>
                <input
                  type="text"
                  value={user?.role || 'User'}
                  disabled
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-neutral-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Subscription Section */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Subscription</h2>
              <p className="text-xs text-neutral-500">Your current plan and usage</p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-white">{currentTier.name}</p>
              <p className="text-sm text-neutral-500">{currentTier.price}</p>
            </div>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-xl text-sm transition-all">
              Manage Plan
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Websites', value: '3 / 5' },
              { label: 'Campaigns', value: '12 / 50' },
              { label: 'Prospects', value: '847 / 1000' },
              { label: 'Emails/mo', value: '2451 / 5000' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-black/50 border border-white/10">
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="text-sm font-medium text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Password Section */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Security</h2>
              <p className="text-xs text-neutral-500">Change your password</p>
            </div>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>

        {/* Integrations Section */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Integrations</h2>
              <p className="text-xs text-neutral-500">Connect your tools</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <div key={integration.name} className="p-4 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400">
                      {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{integration.name}</p>
                      <p className="text-xs text-neutral-500">{integration.description}</p>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                      integration.connected
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300'
                    }`}
                  >
                    {integration.connected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Connected
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-red-400">Danger Zone</h2>
              <p className="text-xs text-neutral-500">Irreversible actions</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <div>
              <p className="text-white">Delete Account</p>
              <p className="text-sm text-neutral-500">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
