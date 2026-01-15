'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import api from '@/lib/api'
import toast from 'react-hot-toast'

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
      // Reload user data
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  async function handleConnectIntegration(service) {
    try {
      // In a real app, this would redirect to OAuth flow
      // For now, we'll simulate it
      const authUrl = `/api/integrations/${service}/connect`
      window.location.href = authUrl
    } catch (error) {
      toast.error(`Failed to connect ${service}`)
    }
  }

  async function handleDisconnectIntegration(service) {
    try {
      await api.delete(`/api/integrations/${service}/disconnect`)
      toast.success(`${service} disconnected successfully`)
      // Reload user to update integration status
      const data = await getCurrentUser()
      setUser(data?.user || data)
    } catch (error) {
      toast.error(`Failed to disconnect ${service}`)
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    const password = prompt('Please enter your password to confirm:')
    if (!password) {
      return
    }

    try {
      await api.delete('/api/users/account', {
        data: { password },
      })
      toast.success('Account deleted successfully')
      // Redirect to login
      window.location.href = '/login'
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-dark-textMuted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Settings</h1>
        <p className="text-dark-textMuted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-textMuted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">Company</label>
            <input
              type="text"
              value={profileData.company}
              onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">Role</label>
            <input
              type="text"
              value={user?.role || 'User'}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-textMuted cursor-not-allowed"
            />
          </div>
        </div>
        <form onSubmit={handleSaveProfile}>
          <button type="submit" disabled={saving} className="mt-6 px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Subscription</h2>
        <div className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
          <div>
            <p className="font-medium text-dark-text">
              {user?.subscription_tier === 'tackle' ? 'Tackle.IO Enterprise' :
               user?.subscription_tier === 'clientcontact' ? 'ClientContact.IO' :
               user?.subscription_tier === 'leadsite-io' ? 'LeadSite.IO' :
               'LeadSite.AI Starter'}
            </p>
            <p className="text-sm text-dark-textMuted mt-1">
              {user?.subscription_tier === 'tackle' ? '$499/month' :
               user?.subscription_tier === 'clientcontact' ? '$149/month' :
               user?.subscription_tier === 'leadsite-io' ? '$29/month' :
               '$49/month'}
            </p>
          </div>
          <button className="px-4 py-2 bg-dark-surfaceHover hover:bg-dark-border text-dark-text rounded-lg transition">
            Manage Plan
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Websites', value: '3 / 5' },
            { label: 'Campaigns', value: '12 / 50' },
            { label: 'Prospects', value: '847 / 1000' },
            { label: 'Emails/mo', value: '2451 / 5000' },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-dark-bg rounded-lg">
              <p className="text-sm text-dark-textMuted">{item.label}</p>
              <p className="text-lg font-semibold text-dark-text mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-textMuted mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-dark-text focus:outline-none focus:border-dark-primary"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-dark-primary hover:bg-dark-primaryHover text-white rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Integrations Section */}
      <div className="bg-dark-surface border border-dark-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-dark-text mb-4">Integrations</h2>
        <div className="space-y-4">
          {[
            { name: 'Gmail', icon: '📧', connected: true },
            { name: 'LinkedIn', icon: '💼', connected: false },
            { name: 'Slack', icon: '💬', connected: true },
            { name: 'Calendly', icon: '📅', connected: false },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <span className="font-medium text-dark-text">{integration.name}</span>
              </div>
              <button
                type="button"
                onClick={() => integration.connected 
                  ? handleDisconnectIntegration(integration.name.toLowerCase())
                  : handleConnectIntegration(integration.name.toLowerCase())
                }
                className={`px-4 py-2 rounded-lg transition ${
                  integration.connected
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-dark-surfaceHover text-dark-textMuted hover:text-dark-text'
                }`}
              >
                {integration.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-dark-surface border border-red-900/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-text">Delete Account</p>
            <p className="text-sm text-dark-textMuted">Permanently delete your account and all data</p>
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
