'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid verification link. Please check your email and try again.');
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          if (result.error?.includes('expired')) {
            setStatus('expired');
          } else {
            setStatus('error');
            setError(result.error || 'Verification failed. Please try again.');
          }
          return;
        }

        // Success - redirect to dashboard after brief delay
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 2000);
      } catch (err) {
        setStatus('error');
        setError('An error occurred. Please try again.');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-[#050505] border border-subtle p-8 md:p-12 text-center">
            {status === 'verifying' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
                  Verifying Your Email
                </h1>
                <p className="text-neutral-400 font-geist">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
                  Email Verified!
                </h1>
                <p className="text-neutral-400 font-geist mb-6">
                  Your email has been successfully verified. Redirecting to your dashboard...
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                >
                  Go to Dashboard →
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
                  Verification Failed
                </h1>
                <p className="text-neutral-400 font-geist mb-6">
                  {error || 'The verification link is invalid or has expired. Please request a new verification email.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/verify-pending"
                    className="bg-purple-500 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-600 transition-colors font-geist"
                  >
                    Request New Link
                  </Link>
                  <Link
                    href="/login"
                    className="bg-transparent border border-subtle text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}

            {status === 'expired' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
                  Link Expired
                </h1>
                <p className="text-neutral-400 font-geist mb-6">
                  This verification link has expired. Please request a new verification email.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/verify-pending"
                    className="bg-purple-500 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-600 transition-colors font-geist"
                  >
                    Request New Link
                  </Link>
                  <Link
                    href="/login"
                    className="bg-transparent border border-subtle text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-[#050505] border border-subtle p-8 md:p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
              Loading...
            </h1>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
