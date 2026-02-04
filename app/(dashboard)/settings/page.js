'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Settings placeholder - profile page was removed with dashboard restructure
export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400 text-sm">Redirecting...</p>
      </div>
    </div>
  )
}
