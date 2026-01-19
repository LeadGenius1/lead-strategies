'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to copilot - the main interface
    router.push('/copilot')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-neutral-400">Redirecting to Copilot...</div>
    </div>
  )
}
