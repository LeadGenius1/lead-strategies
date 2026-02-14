'use client'

import Link from 'next/link'
import {
  PLATFORM_DISPLAY_NAMES,
  getFeatureCount,
} from '@/lib/platformFeatures'
import { Target, Globe, MessageSquare, PlayCircle, Users, Shield } from 'lucide-react'

const PLATFORM_ICONS = {
  'leadsite-ai': Target,
  'leadsite-io': Globe,
  'clientcontact-io': MessageSquare,
  'videosite-ai': PlayCircle,
  'ultralead-ai': Users,
  admin: Shield,
}

const PLATFORM_TIERS = {
  'leadsite-ai': { label: 'Tier 1', color: 'border-blue-500/30 bg-blue-500/10' },
  'leadsite-io': { label: 'Tier 2', color: 'border-emerald-500/30 bg-emerald-500/10' },
  'clientcontact-io': { label: 'Tier 3', color: 'border-violet-500/30 bg-violet-500/10' },
  'videosite-ai': { label: 'Tier 4', color: 'border-rose-500/30 bg-rose-500/10' },
  'ultralead-ai': { label: 'Tier 5', color: 'border-amber-500/30 bg-amber-500/10' },
  admin: { label: 'Admin', color: 'border-purple-500/30 bg-purple-500/10' },
}

export default function AdminPlatformsPage() {
  const platforms = Object.keys(PLATFORM_DISPLAY_NAMES)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Switcher</h1>
        <p className="text-neutral-400 mt-1">
          Admin-exclusive overview of all platforms and their feature sets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platformKey) => {
          const Icon = PLATFORM_ICONS[platformKey] || Shield
          const name = PLATFORM_DISPLAY_NAMES[platformKey]
          const featureCount = getFeatureCount(platformKey)
          const tierInfo = PLATFORM_TIERS[platformKey] || PLATFORM_TIERS.admin

          return (
            <div
              key={platformKey}
              className={`rounded-xl border p-6 ${tierInfo.color} bg-black/20`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Icon className="w-5 h-5 text-white/90" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{name}</h2>
                    <span className="text-xs text-neutral-500">{tierInfo.label}</span>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded bg-white/10 text-neutral-300">
                  {featureCount} features
                </span>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                {platformKey === 'admin'
                  ? 'Super-dashboard with all 20 features for testing'
                  : `${featureCount} features available`}
              </p>
              {platformKey !== 'admin' && (
                <Link
                  href={`/admin/users?tier=${platformKey.replace('-ai', '.ai').replace('-io', '.io')}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View users →
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
