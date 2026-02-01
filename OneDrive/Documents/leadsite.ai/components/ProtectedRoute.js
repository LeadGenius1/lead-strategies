'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'

export default function ProtectedRoute({ children, requiredTier }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // Check if authenticated
      if (!auth.isAuthenticated()) {
        router.push('/login')
        return
      }

      const user = auth.getCurrentUser()
      
      // Check tier access if required
      if (requiredTier) {
        const userTier = user?.subscription_tier
        
        // Define tier hierarchy (higher tiers include lower tier features)
        const tierHierarchy = {
          'leadsite-ai': 1,
          'leadsite-io': 2,
          'clientcontact': 3,
          'videosite': 3, // Same level as clientcontact
          'ultralead': 4 // Highest - includes everything
        }
        
        const userTierLevel = tierHierarchy[userTier] || 0
        const requiredTierLevel = tierHierarchy[requiredTier] || 0
        
        // If user's tier is lower than required, redirect to their dashboard
        if (userTierLevel < requiredTierLevel) {
          router.push(`/dashboard/${userTier}`)
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredTier])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthorized ? children : null
}
