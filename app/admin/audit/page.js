'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadAuditLogs()
  }, [filter])

  async function loadAuditLogs() {
    try {
      const adminToken = Cookies.get('admin_token')
      const params = filter !== 'all' ? `?action=${filter}` : ''
      const response = await api.get(`/api/admin/audit${params}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      setLogs(response.data?.logs || response.data || [])
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-neutral-400 mt-1">Track all admin actions (super_admin only)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'create', 'update', 'delete', 'login'].map((action) => (
          <button
            key={action}
            onClick={() => setFilter(action)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === action
                ? 'bg-purple-500 text-white'
                : 'bg-[#050505] border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[#050505] border border-white/10 rounded-xl p-8 text-center">
          <p className="text-neutral-400">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Admin</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Action</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Resource</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-300">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log, index) => (
                <tr key={log.id || index} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{log.admin_email || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      log.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                      log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.action || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-sm">
                    {log.resource_type || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-neutral-400 text-sm">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
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
