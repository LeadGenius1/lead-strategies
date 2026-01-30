'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy route redirect to ClientContact.IO.
 * Paths /tackle-io and /tackle redirect here for compatibility.
 */
export default function LegacyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/clientcontact-io');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-geist">
      <p className="text-neutral-400">Redirecting to ClientContact.IO…</p>
    </div>
  );
}
