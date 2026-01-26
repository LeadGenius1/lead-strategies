'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Eye, Video, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchEarnings();
    fetchTopVideos();
  }, []);

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/api/v1/videos/earnings');
      const data = res.data?.data || res.data || {};
      setEarnings(data);
    } catch (err) {
      console.error('Fetch earnings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopVideos = async () => {
    try {
      const res = await api.get('/api/v1/videos?limit=10');
      const data = res.data?.data || res.data || {};
      const monetizedVideos = (data.videos || [])
        .filter(v => v.monetizationEnabled)
        .sort((a, b) => parseFloat(b.totalEarnings || 0) - parseFloat(a.totalEarnings || 0))
        .slice(0, 10);
      setVideos(monetizedVideos);
    } catch (err) {
      console.error('Fetch top videos error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/videos"
            className="text-neutral-400 hover:text-white mb-4 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Earnings Dashboard</h1>
          <p className="text-neutral-400">Track your video monetization performance</p>
        </div>

        {/* Stats Cards */}
        {earnings && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Total Earnings</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.totalEarnings?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Total Views</span>
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {earnings.totalViews?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Monetized Videos</span>
                <Video className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {earnings.monetizedVideos || 0}
              </div>
            </div>

            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Avg per Video</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.averageEarningsPerVideo?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        )}

        {/* Top Earning Videos */}
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Earning Videos</h2>
          {videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{video.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.viewCount || 0} views
                        </span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                        ${parseFloat(video.totalEarnings || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-400">
                      ${(parseFloat(video.earnings || 0) / (video.viewCount || 1)).toFixed(2)} per view
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No monetized videos yet</h3>
              <p className="text-neutral-400 mb-6">Enable monetization on your videos to start earning</p>
              <Link
                href="/dashboard/videos"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
              >
                Go to Videos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
