'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Upload, X, CheckCircle2 } from 'lucide-react';

export default function UploadVideoPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isMonetized, setIsMonetized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a video file (MP4, WebM, MOV, AVI, MKV).');
        return;
      }

      // Validate file size (10GB max)
      if (selectedFile.size > 10 * 1024 * 1024 * 1024) {
        setError('File size exceeds 10GB limit.');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    // Debug logging
    console.log('[UPLOAD] Starting upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      apiURL: api.defaults.baseURL
    });

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title || file.name);
      if (description) formData.append('description', description);
      formData.append('monetizationEnabled', isMonetized);

      console.log('[UPLOAD] Sending request to:', '/api/v1/videos/upload');

      const res = await api.post('/api/v1/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
          console.log('[UPLOAD] Progress:', percentCompleted + '%');
        }
      });

      console.log('[UPLOAD] Response:', res.data);

      if (res.data?.success) {
        router.push('/dashboard/videos');
      } else {
        setError(res.data?.error || 'Upload failed');
      }
    } catch (err) {
      console.error('[UPLOAD] Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed';
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>

        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Video File
            </label>
            <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
              {file ? (
                <div className="space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-neutral-400 text-sm mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-white mb-2">Click to upload or drag and drop</p>
                  <p className="text-neutral-400 text-sm">MP4, WebM, MOV, AVI, MKV (max 10GB)</p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Monetization */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="monetize"
              checked={isMonetized}
              onChange={(e) => setIsMonetized(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
            />
            <label htmlFor="monetize" className="text-white text-sm cursor-pointer">
              Enable monetization ($1 per view)
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Uploading...</span>
                <span className="text-sm text-neutral-400">{progress}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
