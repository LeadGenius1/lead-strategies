'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getCurrentUser } from '@/lib/auth'
import Cookies from 'js-cookie'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const token = Cookies.get('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const data = await getCurrentUser()
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
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-dark-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-dark-textMuted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      <Sidebar features={subscription?.features || {}} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
