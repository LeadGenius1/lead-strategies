'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayIcon,
  PlusIcon,
  FilmIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

export default function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function loadVideos() {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch(`${apiUrl}/api/v1/videosite/videos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          setVideos(Array.isArray(d.videos) ? d.videos : []);
        }
      } catch (err) {
        console.error('Videos load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Aether Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-delay" />
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
              Videos
            </h1>
            <p className="text-neutral-400 text-sm font-light">Your uploaded content.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/videos/upload"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm transition-all"
            >
              <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
              Upload Video
            </Link>
            <Link
              href="/videos/analytics"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 text-white font-medium text-sm transition-all"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Analytics
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : videos.length === 0 ? (
          <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-12 overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <FilmIcon className="w-16 h-16 text-indigo-400/50 mx-auto mb-4" />
            <p className="text-neutral-400 text-sm font-light mb-6">No videos yet. Upload your first video to get started.</p>
            <Link
              href="/videos/upload"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden group hover:border-indigo-500/30 transition-all block"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      video.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {video.status || 'processing'}
                  </span>
                </div>
                <h3 className="text-white font-medium text-sm truncate mb-2">{video.title || 'Untitled'}</h3>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{video.qualifiedViews ?? video.views ?? 0} views</span>
                  <span className="text-indigo-400">{`$${Number(video.totalEarnings ?? video.earnings ?? 0).toFixed(2)}`}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
