'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    try {
      const adminToken = Cookies.get('admin_token')
      const response = await api.get('/api/admin/admins', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      setAdmins(response.data?.admins || response.data || [])
    } catch (error) {
      console.error('Error loading admins:', error)
      toast.error('Failed to load admin users')
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAdmin(adminId) {
    if (!confirm('Are you sure you want to delete this admin user?')) return

    try {
      const adminToken = Cookies.get('admin_token')
      await api.delete(`/api/admin/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      toast.success('Admin user deleted')
      loadAdmins()
    } catch (error) {
      toast.error('Failed to delete admin user')
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Users</h1>
          <p className="text-neutral-400 mt-1">Manage admin staff (super_admin only)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
        >
          + Add Admin
        </button>
      </div>

      {loading ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">Loading admin users...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">No admin users found</p>
        </div>
      ) : (
        <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Created</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{admin.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      admin.role === 'super_admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-sm">
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
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
