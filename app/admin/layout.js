'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = Cookies.get('admin_token')
    const adminUser = Cookies.get('admin_user')

    // Allow access to login page without auth
    if (pathname === '/admin/login') {
      setLoading(false)
      return
    }

    if (!adminToken || !adminUser) {
      router.push('/admin/login')
      return
    }

    try {
      const adminData = JSON.parse(adminUser)
      setAdmin(adminData)
    } catch (error) {
      console.error('Error parsing admin user:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show dashboard with sidebar
  return (
    <div className="flex h-screen bg-[#030303] text-white">
      <AdminSidebar admin={admin} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
