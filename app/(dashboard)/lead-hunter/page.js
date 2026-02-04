'use client';

import CopilotChat from '@/components/CopilotChat';

export default function LeadHunterPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Clean background - matches sidebar & layout */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-0 sm:p-4 md:p-6 h-screen">
        <div className="max-w-full sm:max-w-4xl lg:max-w-5xl mx-auto h-screen sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
          <CopilotChat />
        </div>
      </div>
    </div>
  );
}
