'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyPendingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!user?.email) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to send verification email. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

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

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            ← Back
          </Link>
          
          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            AI LEAD
          </div>

          <div className="px-5 py-2 text-xs tracking-widest uppercase text-neutral-500 font-geist">
            Verify Email
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-[#050505] border border-subtle p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-space-grotesk text-white mb-4">
                Check Your Email
              </h1>
              <p className="text-neutral-400 font-geist mb-2">
                We've sent a verification link to
              </p>
              <p className="text-purple-400 font-geist font-bold text-lg mb-6">
                {user?.email || 'your email address'}
              </p>
              <p className="text-neutral-500 font-geist text-sm">
                Click the link in the email to verify your account and activate your free trial.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-400 text-sm font-geist mb-6">
                Verification email sent! Please check your inbox.
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-purple-500 text-white px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-purple-600 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>

              <div className="text-center pt-4 border-t border-subtle">
                <p className="text-neutral-500 font-geist text-sm mb-4">
                  Already verified your email?
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-transparent border border-subtle text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                >
                  Go to Dashboard
                </Link>
              </div>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-neutral-500 hover:text-white text-sm font-geist transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-subtle">
              <p className="text-neutral-600 font-geist text-xs text-center">
                Didn't receive the email? Check your spam folder or try resending the verification link.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
