'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Terms() {
  const router = useRouter();
  useEffect(() => { router.replace('/policy'); }, []);
  return null;
}
