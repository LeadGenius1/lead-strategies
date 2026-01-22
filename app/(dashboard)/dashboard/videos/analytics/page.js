'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Eye, DollarSign, Clock, Globe, Smartphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VideoAnalyticsPage() {
  const params = useParams();
  const videoId = params.id;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      fetchAnalytics();
    }
  }, [videoId]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/api/v1/videos/${videoId}/analytics`);
      const data = res.data?.data || res.data || {};
      setAnalytics(data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-neutral-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Not Available</h2>
          <p className="text-neutral-400 mb-6">Unable to load video analytics.</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Video Analytics</h1>
          <p className="text-neutral-400">Detailed performance metrics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Total Views</span>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.analytics?.views?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              ${analytics.analytics?.earnings?.toFixed(2) || '0.00'}
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Avg Watch Time</span>
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.analytics?.averageWatchTime || 0}s
            </div>
          </div>

          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-400 text-sm">Engagement Rate</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.analytics?.engagementRate?.toFixed(1) || 0}%
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Geographic Distribution
            </h2>
            {analytics.analytics?.geographicDistribution?.length > 0 ? (
              <div className="space-y-2">
                {analytics.analytics.geographicDistribution.map((geo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                    <span className="text-white text-sm">{geo.country}</span>
                    <span className="text-neutral-400 text-sm">{geo.views} views</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No geographic data available yet
              </div>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Device Breakdown
            </h2>
            {analytics.analytics?.deviceBreakdown?.length > 0 ? (
              <div className="space-y-2">
                {analytics.analytics.deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
                    <span className="text-white text-sm">{device.device}</span>
                    <span className="text-neutral-400 text-sm">{device.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No device data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
