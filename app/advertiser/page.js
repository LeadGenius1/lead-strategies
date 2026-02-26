'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdvertiserRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/advertiser/login'); }, [router]);
  return null;
}
