'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * UltraLead product route.
 * Paths /tackle-io and /tackle redirect here (next.config).
 */
export default function UltraLeadPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/clientcontact-io');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-geist">
      <p className="text-neutral-400">Redirecting to UltraLead…</p>
    </div>
  );
}
