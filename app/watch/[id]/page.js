'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import VideoPlayer from '@/components/video/VideoPlayer';
import { Eye, DollarSign, Calendar, ArrowLeft, Clock, Play, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import ShareModal from '@/components/videosite/ShareModal';

/** Public video watch page - /watch/[id] — AETHER UI styled */
export default function WatchVideoPage() {
  const params = useParams();
  const videoId = params.id;
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTracked, setViewTracked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sidebarAd, setSidebarAd] = useState(null);
  const [products, setProducts] = useState([]);
  const [passStatus, setPassStatus] = useState(null);
  const [passLoading, setPassLoading] = useState(true);
  const [passToast, setPassToast] = useState(false);
  const [passUsed, setPassUsed] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const watchStartRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
      fetchRelated();
      fetchAd();
      fetchProducts();
      checkPassStatus();
    }
  }, [videoId]);

  // Check for ?pass_activated=true on return from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pass_activated') === 'true') {
      setPassToast(true);
      setTimeout(() => setPassToast(false), 5000);
      window.history.replaceState({}, '', `/watch/${videoId}`);
      checkPassStatus();
    }
  }, [videoId]);

  // Preview loop: play first 5 seconds muted, then show paywall overlay
  useEffect(() => {
    if (!video || passLoading || passStatus?.hasActivePass) return;
    const el = previewRef.current;
    if (!el) return;

    const handleTimeUpdate = () => {
      if (el.currentTime >= 5) {
        el.currentTime = 0;
        if (!showPaywall) setShowPaywall(true);
      }
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.muted = true;
    el.play().catch(() => {});

    return () => el.removeEventListener('timeupdate', handleTimeUpdate);
  }, [video, passLoading, passStatus]);

  // Track view after 3 seconds (only when pass is active)
  useEffect(() => {
    if (video && !viewTracked && passStatus?.hasActivePass) {
      watchStartRef.current = Date.now();
      const timer = setTimeout(async () => {
        trackView({});
        setViewTracked(true);
        if (!passUsed) {
          try {
            await api.post('/api/v1/videosite/pass/use-view', { videoId });
            setPassUsed(true);
            setPassStatus(prev => ({
              ...prev,
              viewsRemaining: Math.max(0, (prev?.viewsRemaining || 1) - 1),
            }));
          } catch (err) {
            console.error('Use view error:', err);
          }
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [video, viewTracked, passStatus]);

  // Send watch duration on page exit
  useEffect(() => {
    if (!video) return;
    const handleUnload = () => {
      if (!watchStartRef.current) return;
      const watchDuration = Math.round((Date.now() - watchStartRef.current) / 1000);
      const completionPct = video.duration
        ? Math.min(100, Math.round((watchDuration / video.duration) * 100))
        : 0;
      const body = JSON.stringify({ watchDuration, completionPct });
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
      navigator.sendBeacon(`${apiBase}/api/v1/videos/${videoId}/track-view`, new Blob([body], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [video, videoId]);

  const fetchVideo = async () => {
    try {
      const res = await api.get(`/api/v1/videos/${videoId}/public`);
      const data = res.data?.data || res.data || {};
      setVideo(data);
    } catch (err) {
      console.error('Fetch video error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async () => {
    try {
      const res = await api.get(`/api/v1/videos/${videoId}/related`);
      const data = res.data?.data || res.data || [];
      setRelated(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch related error:', err);
    }
  };

  const fetchAd = async () => {
    try {
      const res = await api.get(`/api/v1/ads/serve?videoId=${videoId}`);
      const ad = res.data?.ad || null;
      setSidebarAd(ad);
    } catch (err) {
      // Ads are optional — fail silently
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/api/v1/products/video/${videoId}`);
      const data = res.data?.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      // Products are optional — fail silently
    }
  };

  const handleAdClick = async (ad) => {
    try {
      await api.post(`/api/v1/ads/${ad.id}/track-click`);
    } catch (err) {
      // best-effort
    }
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
  };

  const trackView = async (viewData = {}) => {
    try {
      await api.post(`/api/v1/videos/${videoId}/track-view`, {
        watchDuration: viewData.watchDuration || 0,
        completionPct: viewData.completionPct || 0,
      });
    } catch (err) {
      console.error('Track view error:', err);
    }
  };

  const checkPassStatus = async () => {
    try {
      const res = await api.get('/api/v1/videosite/pass/status');
      setPassStatus(res.data?.data || { hasActivePass: false, viewsRemaining: 0 });
    } catch {
      setPassStatus({ hasActivePass: false, viewsRemaining: 0 });
    } finally {
      setPassLoading(false);
    }
  };

  const handleBuyPass = async () => {
    try {
      const res = await fetch('/api/stripe/create-video-pass-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center antialiased">
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
        <div className="relative z-10 text-neutral-500">Loading video...</div>
      </div>
    );
  }

  // Not found state
  if (!video) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center antialiased">
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
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Found</h2>
          <p className="text-neutral-400 mb-6">This video doesn&apos;t exist or has been removed.</p>
          <Link
            href="https://videosite.ai/watch"
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button */}
        <Link
          href="https://videosite.ai/watch"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>

        {/* Main grid: video + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: player + metadata + related */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Card */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="aspect-video">
                {passStatus?.hasActivePass ? (
                  <VideoPlayer
                    videoUrl={video.videoUrl}
                    thumbnailUrl={video.thumbnailUrl}
                    title={video.title}
                    products={products}
                  />
                ) : passLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900/80">
                    <span className="text-neutral-500 text-sm">Loading...</span>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={previewRef}
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    {showPaywall && (
                      <>
                        <div className="absolute inset-0 bg-black/60" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                            <Play className="w-7 h-7 text-indigo-400" />
                          </div>
                          <h2 className="text-xl font-semibold text-white mb-2">Watch this video</h2>
                          <p className="text-neutral-400 text-sm mb-5 max-w-sm">
                            1 view = $1.20 &bull; Creator earns $1.00 per view
                          </p>
                          <button
                            onClick={handleBuyPass}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                          >
                            Buy 10-view pass for $12
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Card */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-4">
                {video.title}
              </h1>

              {/* Creator row */}
              {video.creator && (
                <div className="flex items-center gap-3 mb-4">
                  {video.creator.avatar ? (
                    <img
                      src={video.creator.avatar}
                      alt={video.creator.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                  <span className="text-neutral-200 font-medium">{video.creator.name}</span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-white/5 rounded-lg text-sm text-neutral-300">
                  <Eye className="w-4 h-4 text-neutral-400" />
                  <span>{(video.viewCount || video.views || 0).toLocaleString()} views</span>
                </div>
                {(video.monetizationEnabled ?? video.isMonetized) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-white/5 rounded-lg text-sm text-yellow-400">
                    <DollarSign className="w-4 h-4" />
                    <span>${parseFloat(video.totalEarnings ?? video.earnings ?? 0).toFixed(2)} earned</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-white/5 rounded-lg text-sm text-neutral-300">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>{new Date(video.createdAt ?? video.created_at).toLocaleDateString()}</span>
                </div>
                {video.duration && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 border border-white/5 rounded-lg text-sm text-neutral-300">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={() => setShowShare(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {/* Description */}
              {video.description && (
                <p className="text-neutral-400 text-sm leading-relaxed mt-4">{video.description}</p>
              )}
            </div>

            {/* Related Videos Card */}
            {related.length > 0 && (
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <h2 className="text-lg font-medium text-white mb-4">More from this creator</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((rv) => (
                    <Link
                      key={rv.id}
                      href={`/watch/${rv.id}`}
                      className="group flex gap-3 p-3 rounded-xl bg-neutral-800/30 border border-white/5 hover:border-indigo-500/30 transition-all"
                    >
                      {/* Thumbnail or placeholder */}
                      <div className="w-28 h-16 flex-shrink-0 rounded-lg bg-neutral-800/50 overflow-hidden flex items-center justify-center">
                        {rv.thumbnailUrl ? (
                          <img
                            src={rv.thumbnailUrl}
                            alt={rv.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Play className="w-6 h-6 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-200 group-hover:text-white truncate transition-colors">
                          {rv.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(rv.viewCount || rv.views || 0).toLocaleString()}
                          </span>
                          <span>{new Date(rv.createdAt ?? rv.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
              <div className="relative p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Earn $1 per view</h3>
                <p className="text-indigo-100/80 text-sm mb-5">
                  Upload your videos and start earning. Free to join — get paid for every qualified view.
                </p>
                <Link
                  href="/signup?tier=videosite"
                  className="block w-full text-center px-5 py-3 bg-white text-indigo-700 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition-colors"
                >
                  Start Creating
                </Link>
              </div>
            </div>

            {/* Sponsored Ad */}
            {sidebarAd ? (
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider">Sponsored</span>
                </div>
                {sidebarAd.thumbnailUrl && (
                  <div className="aspect-video bg-neutral-800/50 overflow-hidden">
                    <img src={sidebarAd.thumbnailUrl} alt={sidebarAd.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-neutral-200 mb-1">{sidebarAd.title}</h4>
                  {sidebarAd.description && (
                    <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{sidebarAd.description}</p>
                  )}
                  <button
                    onClick={() => handleAdClick(sidebarAd)}
                    className="w-full px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all"
                  >
                    {sidebarAd.callToAction || 'Learn More'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                <div className="flex items-center justify-center h-48 text-neutral-600 text-xs uppercase tracking-wider">
                  Advertisement
                </div>
              </div>
            )}

            {/* Advertise CTA */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-5">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <p className="text-sm text-neutral-400 mb-3">Want to advertise here?</p>
              <Link
                href="/ads"
                className="block w-full text-center px-4 py-2 bg-neutral-800/50 border border-white/10 text-neutral-300 rounded-lg text-sm hover:border-indigo-500/30 hover:text-white transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          videoId={videoId}
          videoTitle={video.title}
          videoDescription={video.description}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Pass Activated Toast */}
      {passToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-emerald-500/90 backdrop-blur-sm text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/25">
          Pass activated! You have 10 views
        </div>
      )}
    </div>
  );
}
