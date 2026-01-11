'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { isAuthenticated, getCurrentUser } from '../../../lib/auth'
import { companiesAPI } from '../../../lib/api'

export default function CompaniesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    setUser(getCurrentUser())
    fetchCompanies()
  }, [router])

  const fetchCompanies = async (page = 1) => {
    try {
      const data = await companiesAPI.getAll({ page, limit: 20, search })
      setCompanies(data.companies || [])
      setPagination(data.pagination || { page: 1, total: 0, limit: 20 })
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCompanies(1)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  if (loading) {
    return (
      <div className="bg-[#050505] text-white antialiased min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://unpkg.com/lucide@latest"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons()
          }
        }}
      />

      <div className="bg-[#050505] text-white antialiased min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <i data-lucide="target" className="w-4 h-4 text-white"></i>
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-white">Tackle.IO</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/dashboard/deals" className="hover:text-white transition-colors">Deals</Link>
              <Link href="/dashboard/contacts" className="hover:text-white transition-colors">Contacts</Link>
              <Link href="/dashboard/companies" className="text-white">Companies</Link>
              <Link href="/dashboard/activities" className="hover:text-white transition-colors">Activities</Link>
              <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/companies/new"
                className="text-xs font-medium bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all text-white flex items-center gap-2"
              >
                <i data-lucide="building-2" className="w-4 h-4"></i>
                Add Company
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Companies</h1>
              <p className="text-zinc-400 text-sm">Manage your B2B accounts and organizations.</p>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-orange-500/50 w-64"
                />
                <i data-lucide="search" className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              </form>
            </div>
          </div>

          {/* Companies Table */}
          <div className="rounded-2xl bg-zinc-900/30 border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Company</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Industry</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Size</th>
                  <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Contacts</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-4">Deal Value</th>
                  <th className="text-right text-xs font-medium text-zinc-400 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <tr key={company.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/companies/${company.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {company.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white hover:text-orange-400 transition-colors">
                              {company.name}
                            </div>
                            {company.website && (
                              <div className="text-xs text-zinc-400">{company.website}</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{company.industry || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                          {company.size || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-400">{company._count?.contacts || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-green-400">
                        {formatCurrency(company.totalDealValue)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/companies/${company.id}`}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <i data-lucide="eye" className="w-4 h-4"></i>
                          </Link>
                          <Link
                            href={`/dashboard/companies/${company.id}/edit`}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <i data-lucide="edit-2" className="w-4 h-4"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="building-2" className="w-8 h-8 text-zinc-400"></i>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No companies yet</h3>
                      <p className="text-zinc-400 text-sm mb-6">Add your first company to start building relationships.</p>
                      <Link
                        href="/dashboard/companies/new"
                        className="inline-flex items-center gap-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-all text-white"
                      >
                        <i data-lucide="building-2" className="w-4 h-4"></i>
                        Add Company
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchCompanies(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => fetchCompanies(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
