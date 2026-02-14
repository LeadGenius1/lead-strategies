'use client';

import CopilotChat from '@/components/CopilotChat';
import { Sparkles } from 'lucide-react';

export default function CopywriterPage() {
  const bgStyle = {
    backgroundSize: '40px 40px',
    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={bgStyle} />

      <div className="relative z-10 p-4 md:p-6">
        <div className="max-w-4xl lg:max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-medium text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Copywriter
            </h1>
            <p className="text-sm text-neutral-500">Generate marketing copy, email templates, and ad copy</p>
          </div>

          <div className="h-[calc(100vh-12rem)]">
            <CopilotChat />
          </div>
        </div>
      </div>
    </div>
  );
}
