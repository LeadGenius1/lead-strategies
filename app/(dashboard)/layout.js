'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/auth'
import Cookies from 'js-cookie'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function loadUser() {
      // Small delay to ensure cookie is set after login redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const token = Cookies.get('token')
      console.log('[Dashboard] Token check:', token ? 'Found' : 'Not found')
      
      if (!token) {
        console.log('[Dashboard] No token, redirecting to login')
        setAuthChecked(true)
        router.replace('/login')
        return
      }

      try {
        console.log('[Dashboard] Fetching user data...')
        const data = await getCurrentUser()
        console.log('[Dashboard] User data:', data ? 'Received' : 'null')
        
        if (data) {
          setUser(data.user || data)
          setSubscription(data.subscription || {
            // Default features based on tier (fallback)
            features: {
              websites: true,
              campaigns: true,
              prospects: true,
              inbox: data.user?.subscription_tier !== 'leadsite-ai',
              voice: data.user?.subscription_tier === 'tackle',
              crm: data.user?.subscription_tier === 'tackle',
            }
          })
          setAuthChecked(true)
        } else {
          // User data is null but we have a token - might be invalid token
          console.log('[Dashboard] User data null, clearing token and redirecting')
          Cookies.remove('token')
          setAuthChecked(true)
          router.replace('/login')
        }
      } catch (error) {
        console.error('[Dashboard] Error loading user:', error)
        // On error, clear token and redirect
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
    <div className="flex h-screen bg-black">
      <Sidebar features={subscription?.features || {}} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
