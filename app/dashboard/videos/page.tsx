'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Play, Plus, Film, BarChart3 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  status: string;
  duration: number;
  aspectRatio: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  views: number;
  createdAt: string;
}

export default function VideosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/dashboard/videos`);
    } else if (user) {
      fetchVideos();
    }
  }, [user, loading, router]);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVideos(result.data.videos || []);
        }
      }
    } catch (error) {
      console.error('Fetch videos error:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  if (loading || loadingVideos) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="border-b border-subtle bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-space-grotesk font-light text-white mb-2">
                Video <span className="text-gradient">Library</span>
              </h1>
              <p className="text-neutral-400 font-geist text-sm">
                Create, edit, and publish AI-generated videos
              </p>
            </div>
            <Link
              href="/dashboard/videos/new"
              className="bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              New Video
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {videos.length === 0 ? (
            <div className="text-center py-24">
              <Film className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h2 className="text-2xl font-space-grotesk text-white mb-2">No videos yet</h2>
              <p className="text-neutral-400 font-geist mb-6">
                Create your first AI-generated video to get started
              </p>
              <Link
                href="/dashboard/videos/new"
                className="bg-white text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create Video
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/dashboard/videos/${video.id}`}
                  className="bg-[#050505] border border-subtle hover:border-purple-500/30 transition-all group"
                >
                  <div className="aspect-video bg-[#030303] relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-neutral-600" />
                      </div>
                    )}
                    {video.videoUrl && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/80 text-white text-xs px-2 py-1 font-geist">
                        {video.aspectRatio}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-space-grotesk text-white mb-1 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-neutral-400 font-geist mb-3 line-clamp-2">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-geist">
                      <span>{video.duration || 0}s</span>
                      <span>{video.views || 0} views</span>
                      <span className={`${
                        video.status === 'ready' || video.status === 'published' ? 'text-green-500' :
                        video.status === 'generating' ? 'text-yellow-500' :
                        'text-neutral-500'
                      }`}>
                        {video.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
