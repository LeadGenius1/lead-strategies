'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { useAuth } from '@/contexts/AuthContext'
import { contactsAPI } from '@/lib/api'

export default function ContactsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 })

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons()
    }

    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/dashboard/tackle/contacts')
      return
    }

    if (user.tier < 5) {
      router.push('/dashboard')
      return
    }

    fetchContacts()
  }, [router, user, authLoading])

  const fetchContacts = async (page = 1) => {
    try {
      const data = await contactsAPI.getAll({ page, limit: 20, search })
      setContacts(data.contacts || [])
      setPagination(data.pagination || { page: 1, total: 0, limit: 20 })
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchContacts(1)
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
              <Link href="/dashboard/contacts" className="text-white">Contacts</Link>
              <Link href="/dashboard/companies" className="hover:text-white transition-colors">Companies</Link>
              <Link href="/dashboard/activities" className="hover:text-white transition-colors">Activities</Link>
              <Link href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/contacts/new"
                className="text-xs font-medium bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all text-white flex items-center gap-2"
              >
                <i data-lucide="user-plus" className="w-4 h-4"></i>
                Add Contact
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Contacts</h1>
              <p className="text-zinc-400 text-sm">Manage your contact database and relationships.</p>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-900/50 border border-white/5 rounded-lg px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-orange-500/50 w-64"
                />
                <i data-lucide="search" className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              </form>

              <button className="text-xs font-medium bg-zinc-900/50 border border-white/5 hover:border-white/20 px-4 py-2 rounded-lg transition-all text-zinc-400 hover:text-white flex items-center gap-2">
                <i data-lucide="upload" className="w-4 h-4"></i>
                Import
              </button>
            </div>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/dashboard/contacts/${contact.id}`}
                  className="group relative p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                      {contact.firstName?.charAt(0) || contact.email?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-white truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-sm text-zinc-400 truncate">{contact.title || 'No title'}</p>
                      {contact.company && (
                        <p className="text-sm text-blue-400 truncate">{contact.company.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <i data-lucide="mail" className="w-3 h-3"></i>
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <i data-lucide="phone" className="w-3 h-3"></i>
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/20 transition-all">
                      <i data-lucide="more-vertical" className="w-4 h-4"></i>
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="users" className="w-8 h-8 text-zinc-400"></i>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No contacts yet</h3>
                <p className="text-zinc-400 text-sm mb-6">Add your first contact to get started.</p>
                <Link
                  href="/dashboard/contacts/new"
                  className="inline-flex items-center gap-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-all text-white"
                >
                  <i data-lucide="user-plus" className="w-4 h-4"></i>
                  Add Contact
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => fetchContacts(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <button
                onClick={() => fetchContacts(pagination.page + 1)}
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
