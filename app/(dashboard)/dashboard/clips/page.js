'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Film, Upload, Search, Filter, Folder, Tag, MoreVertical, Edit, Trash2, Play } from 'lucide-react';
import Link from 'next/link';

export default function ClipsPage() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [moodFilter, setMoodFilter] = useState('');

  useEffect(() => {
    fetchClips();
  }, [categoryFilter, moodFilter]);

  const fetchClips = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (moodFilter) params.append('mood', moodFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/api/v1/clips?${params.toString()}`);
      const data = res.data?.data || res.data || {};
      setClips(data.clips || []);
    } catch (err) {
      console.error('Fetch clips error:', err);
      setClips([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteClip = async (clipId) => {
    if (!confirm('Are you sure you want to delete this clip?')) return;
    
    try {
      await api.delete(`/api/v1/clips/${clipId}`);
      fetchClips();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete clip');
    }
  };

  const categories = ['problem', 'solution', 'outcome', 'transition', 'b-roll'];
  const moods = ['negative', 'neutral', 'positive', 'energetic', 'calm'];

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading clips...</div>
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
              <h1 className="text-3xl font-bold text-white mb-2">Clip Library</h1>
              <p className="text-neutral-400">Manage your video clips for AI-powered video creation</p>
            </div>
            <button
              onClick={() => document.getElementById('clip-upload-input')?.click()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Clip
            </button>
            <input
              id="clip-upload-input"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('clip', file);
                formData.append('name', file.name);

                try {
                  await api.post('/api/v1/clips/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  fetchClips();
                } catch (err) {
                  alert('Failed to upload clip');
                }
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search clips..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchClips()}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clips Grid */}
        {clips.length === 0 ? (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No clips yet</h3>
            <p className="text-neutral-400 mb-6">Upload clips to build your library for AI video creation</p>
            <button
              onClick={() => document.getElementById('clip-upload-input')?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Clip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-neutral-900 rounded-xl border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-neutral-800 relative">
                  {clip.thumbnailUrl ? (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </button>
                  </div>
                  {clip.category && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {clip.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-2 line-clamp-1">{clip.name}</h3>
                  {clip.description && (
                    <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{clip.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {clip.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs">
                      {clip.mood && (
                        <span className="capitalize">{clip.mood}</span>
                      )}
                      {clip.durationSeconds && (
                        <span>• {Math.round(clip.durationSeconds)}s</span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteClip(clip.id)}
                      className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400" />
                    </button>
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
