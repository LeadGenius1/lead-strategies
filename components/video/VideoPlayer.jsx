'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

export default function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  autoplay = false, 
  muted = false, 
  loop = false,
  showControls = true,
  onViewTrack,
  videoId 
}) {
  const [playing, setPlaying] = useState(autoplay);
  const [mutedState, setMutedState] = useState(muted);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setPlaying(false);
      if (onViewTrack && videoId) {
        // Track completion
        onViewTrack({
          videoId,
          watchDuration: Math.round(video.currentTime),
          completionPct: 100
        });
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Track view on play
    if (playing && onViewTrack && videoId) {
      const startTime = Date.now();
      const trackInterval = setInterval(() => {
        if (video.ended || video.paused) {
          clearInterval(trackInterval);
          onViewTrack({
            videoId,
            watchDuration: Math.round(video.currentTime),
            completionPct: video.duration ? Math.round((video.currentTime / video.duration) * 100) : 0
          });
        }
      }, 5000); // Track every 5 seconds

      return () => clearInterval(trackInterval);
    }

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [playing, videoId, onViewTrack]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = mutedState;
  }, [mutedState]);

  const togglePlay = () => {
    setPlaying(!playing);
    if (!playing && onViewTrack && videoId) {
      // Track initial play
      onViewTrack({
        videoId,
        watchDuration: 0,
        completionPct: 0
      });
    }
  };

  const toggleMute = () => {
    setMutedState(!mutedState);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
    setProgress(percent * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControlsOverlay(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControlsOverlay(false);
      }
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControlsOverlay(true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        loop={loop}
        className="w-full h-full"
        playsInline
      />

      {/* Controls Overlay */}
      {showControls && (
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity ${
            showControlsOverlay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div
            className="absolute bottom-16 left-0 right-0 h-1 bg-white/20 cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mutedState ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            <div className="flex-1 text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {fullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
