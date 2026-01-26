'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Video, Upload, Play, DollarSign, Eye, TrendingUp, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalViews: 0,
    totalEarnings: 0,
    published: 0
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await api.get('/api/v1/videos');
      const data = res.data?.data || res.data || {};
      setVideos(data.videos || []);
      
      // Calculate stats
      const totalViews = (data.videos || []).reduce((sum, v) => sum + Number(v.viewCount || 0), 0);
      const totalEarnings = (data.videos || []).reduce((sum, v) => sum + parseFloat(v.totalEarnings || 0), 0);
      const published = (data.videos || []).filter(v => v.visibility === 'public').length;
      
      setStats({
        total: data.videos?.length || 0,
        totalViews,
        totalEarnings,
        published
      });
    } catch (err) {
      console.error('Fetch videos error:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await api.delete(`/api/v1/videos/${videoId}`);
      fetchVideos();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
              <p className="text-neutral-400">Manage and monetize your video content</p>
            </div>
            <Link
              href="/dashboard/videos/upload"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Total Videos</span>
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Total Views</span>
                <Eye className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Total Earnings</span>
                <DollarSign className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Published</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No videos yet</h3>
            <p className="text-neutral-400 mb-6">Upload your first video to start earning</p>
            <Link
              href="/dashboard/videos/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-neutral-800 relative">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                  {video.renderStatus === 'completed' && video.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <Link
                        href={`/videos/${video.id}`}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                      >
                        <Play className="w-6 h-6 text-white fill-white" />
                      </Link>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      video.visibility === 'public' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      video.renderStatus === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      video.renderStatus === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {video.visibility === 'public' ? 'Published' : 
                       video.renderStatus === 'completed' ? 'Ready' :
                       video.renderStatus === 'processing' ? 'Processing' :
                       video.renderStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{video.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.viewCount || 0}
                      </span>
                      {video.monetizationEnabled && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <DollarSign className="w-4 h-4" />
                          ${parseFloat(video.totalEarnings || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
