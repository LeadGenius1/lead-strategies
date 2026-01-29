'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy route: TackleAI was consolidated into ClientContact.IO.
 * Redirect /tackle-io → /clientcontact-io (per legal rebrand).
 */
export default function TackleIORedirectPage() {
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
