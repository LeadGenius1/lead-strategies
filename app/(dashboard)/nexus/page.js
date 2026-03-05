'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// /nexus root redirects to /nexus/feed (Activity feed is the default landing)
export default function NexusPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/nexus/feed');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
