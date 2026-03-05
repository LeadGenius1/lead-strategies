'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const API_BASE = '/api/v1/video';
const VIDEOSITE_BASE = '/api/v1/videosite';

const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'warm', label: 'Warm' },
  { id: 'bold', label: 'Bold' },
  { id: 'friendly', label: 'Friendly' },
];

const FORMATS = [
  { id: 'vertical', label: 'Vertical (9:16)' },
  { id: 'horizontal', label: 'Horizontal (16:9)' },
  { id: 'square', label: 'Square (1:1)' },
];

// ═══ Status helpers ═══

function statusColor(status) {
  if (status === 'ready' || status === 'complete' || status === 'completed') return 'bg-emerald-500/20 text-emerald-400';
  if (status === 'failed') return 'bg-red-500/20 text-red-400';
  return 'bg-amber-500/20 text-amber-400';
}

function progressLabel(progress) {
  if (typeof progress === 'object' && progress.stage) return progress.stage.replace(/_/g, ' ');
  if (typeof progress === 'number') return `${progress}%`;
  return 'Processing...';
}

// ═══ Video Creation Form ═══

function CreateVideoForm({ onClose, onJobStarted }) {
  const [tier, setTier] = useState('auto');
  const [script, setScript] = useState('');
  const [projectName, setProjectName] = useState('');
  const [tone, setTone] = useState('professional');
  const [format, setFormat] = useState('vertical');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const photoInputRef = useRef(null);

  // Load templates for Tier 2
  useEffect(() => {
    if (tier === 'personalized') {
      api.get(`${API_BASE}/templates`).then(({ data }) => {
        setTemplates(data.templates || []);
        if (!templateId && data.templates?.length) setTemplateId(data.templates[0].id);
      }).catch(() => {});
    }
  }, [tier]);

  const selectedTemplate = templates.find(t => t.id === templateId);

  // Upload photo for Tier 2
  const handlePhotoSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data } = await api.post(`${API_BASE}/create/upload`, {
        filename: file.name,
        data: base64,
        contentType: file.type,
      });

      setPhotos(prev => [...prev, { url: data.url, name: file.name }]);
    } catch (err) {
      setError('Photo upload failed');
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }, [uploading]);

  const handleSubmit = async () => {
    setError(null);
    if (!script.trim()) return setError('Script is required');
    if (!projectName.trim()) return setError('Project name is required');
    if (tier === 'personalized' && !templateId) return setError('Select a template');

    setSubmitting(true);
    try {
      const body = {
        tier,
        script: script.trim(),
        projectName: projectName.trim(),
        tone,
        format,
        templateId: tier === 'personalized' ? templateId : undefined,
        photos: photos.map(p => p.url),
      };

      const { data } = await api.post(`${API_BASE}/create`, body);
      onJobStarted(data.jobId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start video creation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-2xl bg-neutral-900/50 border border-white/10 p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white">Create Video</h2>
        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors text-sm">Cancel</button>
      </div>

      {/* Tier Toggle */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-neutral-400 mb-2">Video Type</label>
        <div className="flex gap-2">
          {[
            { id: 'auto', label: 'Auto', desc: 'AI picks footage + music' },
            { id: 'personalized', label: 'Personalized', desc: 'Your photos + template' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTier(t.id)}
              className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                tier === t.id
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className={`text-sm font-medium ${tier === t.id ? 'text-indigo-300' : 'text-white'}`}>{t.label}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Name */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Project Name</label>
        <input
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="My promo video"
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500/40"
        />
      </div>

      {/* Script */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Script / Topic</label>
        <textarea
          value={script}
          onChange={e => setScript(e.target.value)}
          placeholder="Write your video script or describe the topic. AI will generate scenes from this..."
          rows={4}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 resize-none focus:outline-none focus:border-indigo-500/40"
        />
      </div>

      {/* Tone + Format Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Tone</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40"
          >
            {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Format</label>
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40"
          >
            {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tier 2: Template Selector */}
      {tier === 'personalized' && templates.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Template</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  templateId === t.id
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className={`text-xs font-medium ${templateId === t.id ? 'text-indigo-300' : 'text-white'}`}>{t.name}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">{t.description}</div>
                {t.photoSlots > 0 && (
                  <div className="text-[10px] text-indigo-400/60 mt-1">{t.photoSlots} photo{t.photoSlots > 1 ? 's' : ''} needed</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Photo Upload */}
      {tier === 'personalized' && selectedTemplate?.photoSlots > 0 && (
        <div className="mb-5">
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Photos ({photos.length}/{selectedTemplate.photoSlots})
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {photos.map((p, i) => (
              <div key={i} className="relative group">
                <img src={p.url} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
            {photos.length < selectedTemplate.photoSlots && (
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-neutral-500 hover:border-indigo-500/40 hover:text-indigo-400 transition-colors disabled:opacity-30"
              >
                {uploading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </button>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !script.trim() || !projectName.trim()}
        className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium text-sm transition-all"
      >
        {submitting ? 'Starting...' : 'Create Video'}
      </button>
    </div>
  );
}

// ═══ Job Progress Tracker ═══

function JobProgress({ jobId, onComplete, onClose }) {
  const [status, setStatus] = useState('waiting');
  const [progress, setProgress] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    async function poll() {
      try {
        const { data } = await api.get(`${API_BASE}/create/${jobId}`);
        setStatus(data.status);
        setProgress(data.progress);
        setProjectName(data.data?.projectName || '');

        if (data.status === 'completed') {
          clearInterval(pollRef.current);
          onComplete();
          return;
        }
        if (data.status === 'failed') {
          clearInterval(pollRef.current);
          setError(data.failedReason || 'Video creation failed');
          return;
        }
      } catch {
        // Keep polling on transient errors
      }
    }

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => clearInterval(pollRef.current);
  }, [jobId, onComplete]);

  const progressPct = typeof progress === 'number' ? progress : 0;

  return (
    <div className="relative rounded-2xl bg-neutral-900/50 border border-white/10 p-6 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">
          {error ? 'Creation Failed' : status === 'completed' ? 'Video Ready' : 'Creating Video...'}
        </h2>
        {(error || status === 'completed') && (
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors text-sm">Close</button>
        )}
      </div>

      {projectName && <p className="text-sm text-neutral-400 mb-4">{projectName}</p>}

      {!error && status !== 'completed' && (
        <>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 5)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">{progressLabel(progress)}</p>
        </>
      )}

      {error && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">{error}</div>
      )}

      {status === 'completed' && (
        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          Video created and added to your library.
        </div>
      )}
    </div>
  );
}

// ═══ Main Videos Page ═══

export default function NexusVideosPage() {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);

  const loadVideos = useCallback(async () => {
    try {
      const { data } = await api.get(`${VIDEOSITE_BASE}/videos`);
      const d = data.data || data;
      setVideos(Array.isArray(d.videos) ? d.videos : []);
    } catch (err) {
      console.error('Videos load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  const handleJobStarted = (jobId) => {
    setShowCreate(false);
    setActiveJobId(jobId);
  };

  const handleJobComplete = useCallback(() => {
    loadVideos();
  }, [loadVideos]);

  const handleJobClose = () => {
    setActiveJobId(null);
  };

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

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500 mb-2">
              Videos
            </h1>
            <p className="text-neutral-400 text-sm font-light">Create and manage your video content.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowCreate(true); setActiveJobId(null); }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Create Video
            </button>
            <Link
              href="/videos/upload"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 text-white font-medium text-sm transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload Video
            </Link>
            <Link
              href="/videos/analytics"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-neutral-900/50 border border-white/10 hover:border-indigo-500/30 text-white font-medium text-sm transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Analytics
            </Link>
          </div>
        </div>

        {/* Create Form / Job Progress */}
        {showCreate && !activeJobId && (
          <div className="mb-8">
            <CreateVideoForm
              onClose={() => setShowCreate(false)}
              onJobStarted={handleJobStarted}
            />
          </div>
        )}

        {activeJobId && (
          <div className="mb-8">
            <JobProgress
              jobId={activeJobId}
              onComplete={handleJobComplete}
              onClose={handleJobClose}
            />
          </div>
        )}

        {/* Video Library */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : videos.length === 0 && !showCreate ? (
          <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-12 overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            <svg className="w-16 h-16 text-indigo-400/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.125 8.25C3.504 8.25 3 8.754 3 9.375v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M5.625 12H4.125m0 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M5.625 15.75H4.125" />
            </svg>
            <p className="text-neutral-400 text-sm font-light mb-6">No videos yet. Create your first AI video or upload one.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Create Video
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-4">Video Library</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="relative rounded-xl bg-neutral-900/30 border border-white/10 p-5 overflow-hidden group hover:border-indigo-500/30 transition-all block"
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${statusColor(video.status)}`}>
                      {video.status || 'processing'}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-sm truncate mb-1.5">{video.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>{video.qualifiedViews ?? video.views ?? video.viewCount ?? 0} views</span>
                    <span className="text-indigo-400">${Number(video.totalEarnings ?? video.earnings ?? 0).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
