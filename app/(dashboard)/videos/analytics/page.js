'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  PlayIcon,
  CurrencyDollarIcon,
  FilmIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden group hover:border-indigo-500/30 transition-all">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl md:text-3xl font-medium text-white mt-2 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState({
    totalVideos: 0,
    totalViews: 0,
    periodEarnings: 0,
    topVideos: [],
    viewsOverTime: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch(`${apiUrl}/api/v1/videosite/analytics?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const d = json.data || json;
          setData({
            totalVideos: d.totalVideos ?? 0,
            totalViews: d.totalViews ?? 0,
            periodEarnings: d.periodEarnings ?? 0,
            topVideos: Array.isArray(d.topVideos) ? d.topVideos : [],
            viewsOverTime: Array.isArray(d.viewsOverTime) ? d.viewsOverTime : [],
          });
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [period]);

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
              Video Analytics
            </h1>
            <p className="text-neutral-400 text-sm font-light">Performance insights and qualified views.</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-300'
                    : 'bg-neutral-900/50 border border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="Total Videos" value={data.totalVideos} icon={FilmIcon} />
              <StatCard label="Qualified Views" value={data.totalViews} icon={PlayIcon} />
              <StatCard label={`Earnings (${period})`} value={`$${(data.periodEarnings || 0).toFixed(2)}`} icon={CurrencyDollarIcon} />
              <StatCard label="Per View" value="$1.00" icon={ArrowTrendingUpIcon} />
            </div>

            {/* Top Videos */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                Top Performing Videos
              </h2>
              {data.topVideos.length === 0 ? (
                <p className="text-neutral-500 text-sm font-light">No video data yet. Upload content to see insights.</p>
              ) : (
                <div className="space-y-4">
                  {data.topVideos.map((video, i) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 text-sm font-mono w-6">{i + 1}.</span>
                        <p className="text-white font-medium text-sm truncate max-w-[200px]">{video.title || 'Untitled'}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-neutral-400">{video.qualifiedViews ?? 0} views</span>
                        <span className="text-indigo-400 font-medium">${(video.totalEarnings || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
