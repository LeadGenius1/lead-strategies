import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | AI Lead Strategies',
  description: 'Terms of Service for AI Lead Strategies.',
};

export default function TermsPage() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full" />
            <span className="text-sm font-medium tracking-widest uppercase text-white">AI Lead Strategies</span>
          </Link>
          <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">Back to Home</Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-medium tracking-tight text-white mb-6">Terms of Service</h1>
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          This page will contain the full Terms of Service. Content to be added.
        </p>
        <p className="text-neutral-500 text-xs">
          Last updated: {new Date().toISOString().split('T')[0]}.
        </p>
      </main>
      <Footer />
    </div>
  );
}
