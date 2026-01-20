'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Settings page now redirects to the comprehensive Profile page
export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new Profile page
    router.replace('/dashboard/profile')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400 text-sm">Redirecting to Profile...</p>
      </div>
    </div>
  )
}
