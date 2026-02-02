'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/auth'
import Cookies from 'js-cookie'
import Link from 'next/link'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdminMode, setIsAdminMode] = useState(false)

  useEffect(() => {
    async function loadUser() {
      await new Promise(resolve => setTimeout(resolve, 100))

      const token = Cookies.get('token')
      const adminToken = Cookies.get('admin_token')
      const adminUser = Cookies.get('admin_user')

      // Admin can access all dashboards with full features (inspection, upgrades, system checks)
      if (adminToken && adminUser) {
        try {
          const adminData = JSON.parse(adminUser)
          setUser({
            email: adminData.email,
            name: adminData.name || 'Admin',
            subscription_tier: 'admin',
            tier: 5,
            isAdmin: true,
          })
          setSubscription({
            features: {
              websites: true,
              campaigns: true,
              prospects: true,
              inbox: true,
              voice: true,
              crm: true,
              videos: true,
            },
          })
          setIsAdminMode(true)
          setAuthChecked(true)
        } catch {
          router.replace('/admin/login')
        } finally {
          setLoading(false)
        }
        return
      }

      if (!token) {
        setAuthChecked(true)
        router.replace('/login')
        setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser()
        if (data) {
          const userData = data.user || data
          const subscriptionData = data.subscription || {}
          const tierFeatures = subscriptionData.tierFeatures || []
          const subscriptionTier = userData?.subscription_tier || userData?.tier
          const tier = userData?.tier
          const features = {
            websites: tierFeatures.includes('website_builder') || subscriptionTier === 'leadsite-io' || subscriptionTier === 'clientcontact-io',
            campaigns: tierFeatures.includes('email_campaigns') || true,
            prospects: tierFeatures.includes('leads') || true,
            inbox: tierFeatures.includes('unified_inbox') || subscriptionTier === 'clientcontact-io',
            voice: subscriptionTier === 'clientcontact-io' && tier === 5,
            crm: subscriptionTier === 'clientcontact-io' && tier === 5,
            videos: tierFeatures.includes('video') || subscriptionTier === 'videosite-io' || subscriptionTier === 'videosite',
          }
          setUser(userData)
          setSubscription({ ...subscriptionData, features })
          setAuthChecked(true)
        } else {
          Cookies.remove('token')
          setAuthChecked(true)
          router.replace('/login')
        }
      } catch (error) {
        console.error('[Dashboard] Error loading user:', error)
        Cookies.remove('token')
        setAuthChecked(true)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  // Show loading state
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth checked and no user, show nothing (redirect is happening)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Aether ambient background – stars, grid, glow blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div className="stars absolute w-[1px] h-[1px] bg-transparent rounded-full opacity-50 top-0 left-0" />
        <div className="absolute inset-0 aether-bg-grid opacity-30" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] glow-blob" style={{ animationDelay: '2s' }} />
      </div>
      <Sidebar features={subscription?.features || {}} isAdminMode={isAdminMode} />
      <main className="flex-1 overflow-y-auto w-full lg:w-auto p-0 sm:p-4 md:p-6 lg:p-8 relative z-10">
        {isAdminMode && (
          <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 py-2 bg-purple-500/20 border-b border-purple-500/30 text-sm">
            <span className="text-purple-300 font-medium">Admin mode — viewing all product dashboards for inspection and system checks</span>
            <Link href="/admin/dashboard" className="text-purple-400 hover:text-white transition-colors whitespace-nowrap">← Back to Admin Panel</Link>
          </div>
        )}
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
