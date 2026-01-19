'use client';

import CampaignManager from '@/components/CampaignManager';

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <CampaignManager />
      </div>
    </div>
  );
}
