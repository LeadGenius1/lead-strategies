'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudArrowUpIcon, DocumentIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function VideoUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    category: 'education',
    visibility: 'public',
    monetization: true,
  });

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert('File size must be less than 2GB');
      return;
    }

    setSelectedFile(file);

    if (!videoData.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setVideoData((prev) => ({ ...prev, title: fileName }));
    }
  }

  async function handleUpload() {
    if (!selectedFile || !videoData.title) {
      alert('Please select a file and enter a title');
      return;
    }

    setUploading(true);

    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

      const presignRes = await fetch(`${apiUrl}/api/v1/videosite/upload/presign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');

      const presignJson = await presignRes.json();
      const { uploadUrl, videoId, key } = presignJson.data || presignJson;

      const uploadXhr = new XMLHttpRequest();

      uploadXhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      await new Promise((resolve, reject) => {
        uploadXhr.addEventListener('load', () => {
          if (uploadXhr.status >= 200 && uploadXhr.status < 300) resolve();
          else reject(new Error('Upload failed'));
        });
        uploadXhr.addEventListener('error', reject);

        uploadXhr.open('PUT', uploadUrl);
        uploadXhr.setRequestHeader('Content-Type', selectedFile.type);
        uploadXhr.send(selectedFile);
      });

      const completeRes = await fetch(`${apiUrl}/api/v1/videosite/upload/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          key,
          title: videoData.title,
          description: videoData.description,
          category: videoData.category,
          visibility: videoData.visibility,
          monetization: videoData.monetization,
        }),
      });

      if (!completeRes.ok) throw new Error('Failed to complete upload');

      router.push('/videos');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* AETHER BACKGROUND */}
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
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
            Upload Video
          </h1>
          <p className="text-neutral-400 text-sm font-light">Initialize content ingestion.</p>
        </div>

        <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

          <div className="space-y-6">
            {/* Upload Area */}
            {!selectedFile ? (
              <div className="relative group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="video-upload"
                  className="block border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 rounded-xl p-12 text-center transition-all cursor-pointer"
                >
                  <CloudArrowUpIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium mb-2">Drop video file here or click to browse</p>
                  <p className="text-neutral-500 text-sm font-light">MP4, WebM, MOV, or AVI (max 2GB)</p>
                </label>
              </div>
            ) : uploading ? (
              <div className="border-2 border-indigo-500/30 rounded-xl p-12">
                <p className="text-white font-medium mb-4 text-center">Uploading {selectedFile.name}...</p>
                <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-indigo-400 font-mono text-sm">{uploadProgress.toFixed(0)}%</p>
                <p className="text-neutral-500 text-xs text-center mt-4 font-light">Neural link active. Do not close this window.</p>
              </div>
            ) : (
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <DocumentIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-neutral-500 text-xs font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-neutral-500 hover:text-red-400 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Form */}
            {selectedFile && !uploading && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    placeholder="Enter video title"
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Description</label>
                  <textarea
                    value={videoData.description}
                    onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                    placeholder="Describe your video (optional)"
                    rows={4}
                    className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-neutral-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Category</label>
                    <select
                      value={videoData.category}
                      onChange={(e) => setVideoData({ ...videoData, category: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-sm"
                    >
                      <option value="education">Education</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="tutorial">Tutorial</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Visibility</label>
                    <select
                      value={videoData.visibility}
                      onChange={(e) => setVideoData({ ...videoData, visibility: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500/50 text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={videoData.monetization}
                      onChange={(e) => setVideoData({ ...videoData, monetization: e.target.checked })}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      id="monetization"
                    />
                    <label htmlFor="monetization" className="flex-1">
                      <span className="text-white font-medium text-sm block mb-1">Enable monetization</span>
                      <p className="text-neutral-400 text-xs font-light">Earn revenue from qualified views on this video</p>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!videoData.title}
                  className="relative group w-full inline-flex h-12 overflow-hidden rounded-lg focus:outline-none transition-transform hover:scale-[1.02] active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="inline-flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-sm text-sm font-medium text-white group-hover:bg-black/30 transition-colors">
                    Initialize Upload
                    <ChevronRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
