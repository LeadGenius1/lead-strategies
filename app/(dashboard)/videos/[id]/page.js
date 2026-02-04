'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlayCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/videosite/StatusBadge';
import VideoPlayer from '@/components/video/VideoPlayer';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return null;
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        const res = await fetch(`${apiUrl}/api/v1/videosite/videos/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const v = json.data || json.video || json;
          setVideo(v);
        } else {
          router.push('/videos');
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        router.push('/videos');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) loadVideo();
  }, [params.id, router]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const res = await fetch(`${apiUrl}/api/v1/videosite/videos/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push('/videos');
      } else {
        alert('Failed to delete video');
        setDeleting(false);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete video');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full" />
          <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  const videoUrl = video.videoUrl || video.video_url;
  const thumbnailUrl = video.thumbnailUrl || video.thumbnail_url;
  const views = video.views ?? video.qualifiedViews ?? 0;
  const earnings = Number(video.earnings ?? video.totalEarnings ?? 0);
  const duration = video.duration ?? video.durationSeconds;
  const createdAt = video.createdAt || video.created_at;

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* AETHER BACKGROUND */}
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

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
              {video.title || 'Untitled'}
            </h1>
            <StatusBadge status={video.status} />
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete Video'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900">
                {videoUrl ? (
                  <VideoPlayer
                    videoUrl={videoUrl}
                    thumbnailUrl={thumbnailUrl}
                    title={video.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <PlayCircleIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-500 text-sm">Video processing...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Description</h3>
                <p className="text-neutral-300 text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-6">Performance</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <EyeIcon className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-neutral-400 text-sm">Views</span>
                    </div>
                    <span className="text-white font-medium font-mono">{views?.toLocaleString() || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-neutral-400 text-sm">Earnings</span>
                    </div>
                    <span className="text-cyan-400 font-medium font-mono">${earnings.toFixed(2)}</span>
                  </div>

                  {duration != null && (
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-neutral-400 text-sm">Duration</span>
                      </div>
                      <span className="text-white font-medium font-mono">{formatDuration(duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-6">Metadata</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-white text-sm capitalize">{video.category || 'Uncategorized'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Visibility</p>
                  <p className="text-white text-sm capitalize">{video.visibility || 'Public'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Monetization</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${video.monetization ?? video.monetizationEnabled ? 'bg-green-400' : 'bg-neutral-600'}`}
                    />
                    <span className="text-white text-sm">
                      {video.monetization ?? video.monetizationEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {createdAt && (
                  <div>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Uploaded</p>
                    <p className="text-white text-sm font-mono">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <Link
              href="/videos/analytics"
              className="relative group w-full inline-flex h-11 overflow-hidden rounded-lg focus:outline-none transition-transform hover:scale-[1.02] active:scale-95 duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30" />
              <span className="inline-flex h-full w-full items-center justify-center backdrop-blur-sm text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Analytics
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
