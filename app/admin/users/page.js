'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadUsers()
  }, [filter])

  async function loadUsers() {
    try {
      const adminToken = Cookies.get('admin_token')
      const params = filter !== 'all' ? `?tier=${filter}` : ''
      const response = await api.get(`/api/admin/users${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      const raw = response.data?.data?.users ?? response.data?.users ?? response.data
      setUsers(Array.isArray(raw) ? raw : [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSuspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) return

    try {
      const adminToken = Cookies.get('admin_token')
      await api.post(`/api/admin/users/${userId}/suspend`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      toast.success('User suspended')
      loadUsers()
    } catch (error) {
      toast.error('Failed to suspend user')
    }
  }

  async function handleActivateUser(userId) {
    try {
      const adminToken = Cookies.get('admin_token')
      await api.post(`/api/admin/users/${userId}/activate`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      toast.success('User activated')
      loadUsers()
    } catch (error) {
      toast.error('Failed to activate user')
    }
  }

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.email?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.company?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-neutral-400 mt-1">Manage all platform subscribers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          {['all', 'leadsite-ai', 'leadsite-io', 'clientcontact', 'videosite'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                filter === tier
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#050505] border border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {tier === 'all' ? 'All' : tier.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#050505] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">No users found</p>
        </div>
      ) : (
        <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Tier</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{user.name || 'N/A'}</p>
                    <p className="text-sm text-neutral-400">{user.email}</p>
                    {user.company && (
                      <p className="text-xs text-neutral-500">{user.company}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {user.subscription_tier || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
