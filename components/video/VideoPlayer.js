'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle } from 'lucide-react';
import ProductBar from './ProductBar';

export default function VideoPlayer({ videoUrl, thumbnailUrl, title, autoPlay = false, products = [] }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [productBarVisible, setProductBarVisible] = useState(false);
  const [productBarDismissed, setProductBarDismissed] = useState(false);

  // Show product bar after 5 seconds of playback
  useEffect(() => {
    if (productBarDismissed || products.length === 0) return;
    if (currentTime >= 5) {
      setProductBarVisible(true);
    }
  }, [currentTime, productBarDismissed, products.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffered = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };
    const handleLoadStart = () => { setLoading(true); setLoadError(false); };
    const handleCanPlay = () => { setLoading(false); setLoadError(false); };
    const handleError = () => { setLoading(false); setLoadError(true); };
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (autoPlay) {
      video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('progress', updateBuffered);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration;
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      videoRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-neutral-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neutral-600 mx-auto mb-4 animate-spin" />
          <p className="text-neutral-400">Video processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full"
        playsInline
      />

      {/* Load Error Overlay - URL may be private R2, check CLOUDFLARE_R2_PUBLIC_URL */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center p-6 max-w-md">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Video failed to load</p>
            <p className="text-neutral-400 text-sm">The video URL may be incorrect. Ensure R2 public URL is configured.</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Product Promotion Bar */}
      {products.length > 0 && (
        <ProductBar
          products={products}
          visible={productBarVisible && !productBarDismissed}
          onDismiss={() => { setProductBarDismissed(true); setProductBarVisible(false); }}
        />
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${buffered}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {playing ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-white text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {fullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
