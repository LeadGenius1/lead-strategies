'use client'

import { useState } from 'react';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Videos</h1>
      <div className="bg-[#050505] border border-subtle p-8 text-center">
        <p className="text-neutral-400">Video management coming soon...</p>
      </div>
    </div>
  );
}
