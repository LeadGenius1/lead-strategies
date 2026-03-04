'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketStrategyRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/nexus/strategy');
  }, [router]);

  return null;
}
