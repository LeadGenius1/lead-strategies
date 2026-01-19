'use client'

// Mark page as dynamic to prevent static rendering
export const dynamic = 'force-dynamic'

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>
      <div className="bg-[#050505] border border-subtle p-8 text-center">
        <p className="text-neutral-400">Analytics dashboard coming soon...</p>
      </div>
    </div>
  );
}
