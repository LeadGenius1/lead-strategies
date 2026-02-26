'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Privacy() {
  const router = useRouter();
  useEffect(() => { router.replace('/policy'); }, []);
  return null;
}
