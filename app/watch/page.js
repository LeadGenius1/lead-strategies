'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Eye, Play, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

/** Public video browse page — /watch — AETHER UI styled */
export default function WatchBrowsePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  const fetchVideos = async (p) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/videos/browse?page=${p}&limit=12`);
      const data = res.data?.data || res.data || {};
      setVideos(Array.isArray(data.videos) ? data.videos : []);
      setPagination(data.pagination || { page: p, pages: 1, total: 0 });
    } catch (err) {
      console.error('Browse videos error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
              Watch
            </h1>
            <p className="text-neutral-400 text-sm font-light">
              Discover videos from creators on VideoSite.AI
            </p>
          </div>
          <Link
            href="/signup?tier=videosite"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm transition-all whitespace-nowrap"
          >
            Start Creating
          </Link>
        </div>

        {/* Loading state */}
        {loading && videos.length === 0 && (
          <div className="flex items-center justify-center py-32">
            <div className="text-neutral-500">Loading videos...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && (
          <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-16 text-center">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <Play className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No videos yet</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Be the first to upload a video and start earning $1 per qualified view.
            </p>
            <Link
              href="/signup?tier=videosite"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
            >
              Start Creating
            </Link>
          </div>
        )}

        {/* Video Grid */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Thumbnail */}
                <div className="relative aspect-video bg-neutral-800/50 overflow-hidden">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-10 h-10 text-neutral-700 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  )}
                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-neutral-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-neutral-200 group-hover:text-white truncate transition-colors mb-2">
                    {video.title}
                  </h3>

                  {/* Creator */}
                  {video.creator && (
                    <div className="flex items-center gap-2 mb-2">
                      {video.creator.avatar ? (
                        <img
                          src={video.creator.avatar}
                          alt={video.creator.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <User className="w-3 h-3 text-indigo-400" />
                        </div>
                      )}
                      <span className="text-xs text-neutral-500 truncate">{video.creator.name}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(video.viewCount || video.views || 0).toLocaleString()}
                    </span>
                    <span>{new Date(video.createdAt ?? video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-900/30 border border-white/10 text-sm text-neutral-300 hover:border-indigo-500/30 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-neutral-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-neutral-900/30 border border-white/10 text-sm text-neutral-300 hover:border-indigo-500/30 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
