'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import WebsiteBuilderChat from '@/components/WebsiteBuilderChat';

/**
 * AI Website Builder - Chat-only experience.
 * 12 conversational questions replace the 7-step form.
 */
export default function WebsiteBuilderPage() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <Link
          href="/websites"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Websites
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-medium text-white">AI Website Builder</h1>
            <p className="text-neutral-500 text-sm">Answer a few questions and your site is ready</p>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-900/50 border border-white/10 overflow-hidden min-h-[500px]">
          <WebsiteBuilderChat onWebsiteCreated={() => {}} />
        </div>
      </div>
    </div>
  );
}
