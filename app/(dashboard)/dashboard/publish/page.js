'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Share2, Youtube, Music, Instagram, Twitter, Linkedin, Facebook, CheckCircle2, XCircle, Clock } from 'lucide-react';

const platforms = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'red' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: 'black' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'pink' },
  { id: 'x', name: 'X (Twitter)', icon: Twitter, color: 'blue' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'blue' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'blue' }
];

export default function PublishPage() {
  const [videos, setVideos] = useState([]);
  const [platformConnections, setPlatformConnections] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, platformsRes] = await Promise.all([
        api.get('/api/v1/videos'),
        api.get('/api/v1/publish/platforms')
      ]);

      setVideos(videosRes.data?.data?.videos || []);
      setPlatformConnections(platformsRes.data?.data?.platforms || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedVideo || selectedPlatforms.length === 0) {
      alert('Please select a video and at least one platform');
      return;
    }

    setPublishing(true);
    try {
      await api.post(`/api/v1/publish/${selectedVideo.id}`, {
        platforms: selectedPlatforms,
        title: selectedVideo.title,
        description: selectedVideo.description,
        tags: [],
        visibility: 'public'
      });

      alert('Video published successfully!');
      setSelectedVideo(null);
      setSelectedPlatforms([]);
      fetchData();
    } catch (err) {
      alert('Failed to publish video: ' + (err.response?.data?.error || err.message));
    } finally {
      setPublishing(false);
    }
  };

  const togglePlatform = (platformId) => {
    const connection = platformConnections.find(p => p.platform === platformId);
    if (!connection?.connected) {
      alert(`Please connect ${platforms.find(p => p.id === platformId)?.name} first`);
      return;
    }

    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Multi-Platform Publishing</h1>
          <p className="text-neutral-400">Publish your videos to multiple platforms at once</p>
        </div>

        {/* Platform Connections */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Platform Connections</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform) => {
              const connection = platformConnections.find(p => p.platform === platform.id);
              const Icon = platform.icon;
              
              return (
                <div
                  key={platform.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    connection?.connected
                      ? 'bg-neutral-900 border-green-500/30'
                      : 'bg-neutral-900 border-white/10 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Icon className={`w-8 h-8 ${connection?.connected ? 'text-green-400' : 'text-neutral-500'}`} />
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">{platform.name}</p>
                      {connection?.connected ? (
                        <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <button 
                          onClick={async () => {
                            try {
                              const res = await api.get(`/api/v1/publish/oauth/${platform.id}`);
                              if (res.data?.data?.onboardingUrl) {
                                window.location.href = res.data.data.onboardingUrl;
                              } else {
                                window.location.href = `/api/v1/publish/oauth/${platform.id}`;
                              }
                            } catch (err) {
                              window.location.href = `/api/v1/publish/oauth/${platform.id}`;
                            }
                          }}
                          className="text-indigo-400 text-xs mt-1 hover:text-indigo-300"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Select Video to Publish</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.filter(v => v.status === 'ready' || v.status === 'published').map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedVideo?.id === video.id
                    ? 'bg-indigo-500/10 border-indigo-500'
                    : 'bg-neutral-900 border-white/10 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    {video.thumbnailUrl ? (
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Share2 className="w-6 h-6 text-neutral-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{video.title}</h3>
                    <p className="text-neutral-400 text-sm">{video.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        {selectedVideo && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Select Platforms</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {platforms.map((platform) => {
                const connection = platformConnections.find(p => p.platform === platform.id);
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    disabled={!connection?.connected}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !connection?.connected
                        ? 'bg-neutral-900/50 border-white/5 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-indigo-500/20 border-indigo-500'
                        : 'bg-neutral-900 border-white/10 hover:border-indigo-500/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-indigo-400' : 'text-neutral-400'}`} />
                    <p className="text-white text-sm">{platform.name}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handlePublish}
              disabled={selectedPlatforms.length === 0 || publishing}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
            >
              {publishing ? 'Publishing...' : `Publish to ${selectedPlatforms.length} Platform(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
