'use client';

import CopilotChat from '@/components/CopilotChat';

export default function CopilotPage() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)]">
        <CopilotChat />
      </div>
    </div>
  );
}
