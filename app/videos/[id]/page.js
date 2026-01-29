'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Eye, DollarSign, Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VideoPage() {
  const params = useParams();
  const videoId = params.id;
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  useEffect(() => {
    // Track view when video loads (public videos are already published)
    if (video && video.visibility === 'public' && !viewTracked) {
      const timer = setTimeout(() => {
        trackView();
        setViewTracked(true);
      }, 3000); // Track after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [video, viewTracked]);

  const fetchVideo = async () => {
    try {
      // Use public endpoint for unauthenticated viewing
      const res = await api.get(`/api/v1/videos/${videoId}/public`);
      const data = res.data?.data || res.data || {};
      setVideo(data);
    } catch (err) {
      console.error('Fetch video error:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (viewData = {}) => {
    try {
      await api.post(`/api/v1/videos/${videoId}/track-view`, {
        watchDuration: viewData.watchDuration || 0,
        completionPct: viewData.completionPct || 0
      });
      // Refresh video to get updated view count
      fetchVideo();
    } catch (err) {
      console.error('Track view error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-neutral-500">Loading video...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-neutral-400 mb-6">This video doesn't exist or has been removed.</p>
          <Link
            href="/dashboard/videos"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <Link
          href="/dashboard/videos"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>

        {/* Video Player */}
        <div className="mb-6">
          <VideoPlayer
            videoUrl={video.videoUrl}
            thumbnailUrl={video.thumbnailUrl}
            videoId={video.id}
            onViewTrack={trackView}
            showControls={true}
          />
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
            {video.description && (
              <p className="text-neutral-400">{video.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-neutral-400">
              <Eye className="w-4 h-4" />
              <span>{video.viewCount || 0} views</span>
            </div>
            {(video.monetizationEnabled || video.isMonetized) && (
              <div className="flex items-center gap-2 text-yellow-400">
                <DollarSign className="w-4 h-4" />
                <span>${parseFloat(video.totalEarnings || video.earnings || 0).toFixed(2)} earned</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
