'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const CampaignsPage = dynamic(() => import('../../campaigns/page'), {
  loading: () => <PanelLoader label="campaigns" />,
});

const RepliesPage = dynamic(() => import('../../replies/page'), {
  loading: () => <PanelLoader label="replies" />,
});

const TABS = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'replies', label: 'Replies' },
];

export default function NexusOutreachPage() {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/5 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-light transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-white border-indigo-500'
                : 'text-neutral-500 border-transparent hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'campaigns' && <CampaignsPage />}
        {activeTab === 'replies' && <RepliesPage />}
      </div>
    </div>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Loading {label}...</p>
      </div>
    </div>
  );
}
