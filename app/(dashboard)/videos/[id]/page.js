'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlayCircleIcon,
  EyeIcon,
  CurrencyDollarIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  ShareIcon,
  PlusIcon,
  XMarkIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/videosite/StatusBadge';
import VideoPlayer from '@/components/video/VideoPlayer';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return null;
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalTab, setModalTab] = useState('existing');
  const [newProduct, setNewProduct] = useState({ title: '', description: '', link: '', imageUrl: '', price: '' });

  useEffect(() => {
    async function loadVideo() {
      try {
        const token = getToken();
        const res = await fetch(`${apiUrl}/api/v1/videosite/videos/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const v = json.data || json.video || json;
          setVideo(v);
        } else {
          router.push('/videos');
        }
      } catch (err) {
        console.error('Failed to load video:', err);
        router.push('/videos');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadVideo();
      loadVideoProducts();
    }
  }, [params.id, router]);

  function getToken() {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
  }

  async function loadVideoProducts() {
    try {
      const res = await fetch(`${apiUrl}/api/v1/products/video/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load video products:', err);
    }
  }

  async function loadAllProducts() {
    try {
      const token = getToken();
      const res = await fetch(`${apiUrl}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setAllProducts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  async function attachProduct(productId) {
    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/v1/products/video/${params.id}/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      loadVideoProducts();
    } catch (err) {
      console.error('Attach product error:', err);
    }
  }

  async function detachProduct(productId) {
    try {
      const token = getToken();
      await fetch(`${apiUrl}/api/v1/products/video/${params.id}/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Detach product error:', err);
    }
  }

  async function createAndAttach() {
    if (!newProduct.title || !newProduct.link) return;
    try {
      const token = getToken();
      const res = await fetch(`${apiUrl}/api/v1/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) {
        const json = await res.json();
        await attachProduct(json.data.id);
        setNewProduct({ title: '', description: '', link: '', imageUrl: '', price: '' });
        setShowProductModal(false);
      }
    } catch (err) {
      console.error('Create product error:', err);
    }
  }

  function openProductModal() {
    setShowProductModal(true);
    setModalTab('existing');
    loadAllProducts();
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const token = getToken();
      const res = await fetch(`${apiUrl}/api/v1/videosite/videos/${params.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        router.push('/videos');
      } else {
        alert('Failed to delete video');
        setDeleting(false);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete video');
      setDeleting(false);
    }
  }

  const watchUrl = typeof window !== 'undefined' ? `${window.location.origin}/watch/${params.id}` : '';

  function copyWatchLink() {
    if (!watchUrl) return;
    navigator.clipboard?.writeText(watchUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-white/10 rounded-full" />
          <div className="w-16 h-16 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  const videoUrl = video.fileUrl || video.file_url || video.videoUrl;
  const thumbnailUrl = video.thumbnailUrl || video.thumbnail_url;
  const views = video.viewCount ?? video.view_count ?? video.views ?? 0;
  const earnings = Number(video.earnings ?? video.totalEarnings ?? 0);
  const duration = video.duration ?? video.durationSeconds;
  const createdAt = video.createdAt || video.created_at;

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
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] aether-glow-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] aether-glow-blob aether-glow-delay" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
              {video.title || 'Untitled'}
            </h1>
            <StatusBadge status={video.status} />
          </div>

          <div className="flex items-center gap-2">
            {videoUrl && (
              <>
                <button
                  type="button"
                  onClick={copyWatchLink}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-sm"
                >
                  <ShareIcon className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(watchUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(watchUrl)}&text=${encodeURIComponent(video.title || 'Check out this video')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                  title="Share on X / Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(watchUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Video'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              <div className="aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900">
                {videoUrl ? (
                  <VideoPlayer
                    videoUrl={videoUrl}
                    thumbnailUrl={thumbnailUrl}
                    title={video.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <PlayCircleIcon className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                      <p className="text-neutral-500 text-sm">Video processing...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Description</h3>
                <p className="text-neutral-300 text-sm leading-relaxed font-light whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}

          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6 overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-6">Performance</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <EyeIcon className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-neutral-400 text-sm">Views</span>
                    </div>
                    <span className="text-white font-medium font-mono">{views?.toLocaleString() || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-neutral-400 text-sm">Earnings</span>
                    </div>
                    <span className="text-cyan-400 font-medium font-mono">${Number(earnings).toFixed(2)}</span>
                  </div>

                  {duration != null && (
                    <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <ClockIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-neutral-400 text-sm">Duration</span>
                      </div>
                      <span className="text-white font-medium font-mono">{formatDuration(duration)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-6">Metadata</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-white text-sm capitalize">{video.category || 'Uncategorized'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Visibility</p>
                  <p className="text-white text-sm capitalize">{video.visibility || 'Public'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Monetization</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${video.monetization ?? video.monetizationEnabled ? 'bg-green-400' : 'bg-neutral-600'}`}
                    />
                    <span className="text-white text-sm">
                      {video.monetization ?? video.monetizationEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {createdAt && (
                  <div>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Uploaded</p>
                    <p className="text-white text-sm font-mono">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Products */}
            <div className="relative rounded-2xl bg-neutral-900/30 border border-white/10 p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide flex items-center gap-2">
                  <ShoppingBagIcon className="w-4 h-4 text-indigo-400" />
                  Featured Products
                </h3>
                <button
                  type="button"
                  onClick={openProductModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-xs font-medium"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  Add Product
                </button>
              </div>

              {products.length === 0 ? (
                <p className="text-neutral-600 text-sm text-center py-4">
                  No products attached.
                </p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2.5 bg-black/50 rounded-lg border border-white/5 group"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <ShoppingBagIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{product.title}</p>
                        {product.price && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-mono">
                            {product.price}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => detachProduct(product.id)}
                        className="p-1 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <Link
              href="/videos/analytics"
              className="relative group w-full inline-flex h-11 overflow-hidden rounded-lg focus:outline-none transition-transform hover:scale-[1.02] active:scale-95 duration-200"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30" />
              <span className="inline-flex h-full w-full items-center justify-center backdrop-blur-sm text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                View Analytics
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">Add Product</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 text-neutral-500 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setModalTab('existing')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${modalTab === 'existing' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                My Products
              </button>
              <button
                type="button"
                onClick={() => setModalTab('create')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${modalTab === 'create' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Create New
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {modalTab === 'existing' ? (
                allProducts.length === 0 ? (
                  <p className="text-neutral-600 text-sm text-center py-6">
                    No products yet. Create one first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {allProducts.map((p) => {
                      const attached = products.some((vp) => vp.id === p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={attached}
                          onClick={() => { attachProduct(p.id); setShowProductModal(false); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${attached ? 'border-indigo-500/30 bg-indigo-500/5 opacity-60 cursor-not-allowed' : 'border-white/5 bg-black/30 hover:border-indigo-500/30 hover:bg-indigo-500/5'}`}
                        >
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                              <ShoppingBagIcon className="w-4 h-4 text-indigo-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{p.title}</p>
                            {p.price && <span className="text-xs text-cyan-400 font-mono">{p.price}</span>}
                          </div>
                          {attached && <span className="text-xs text-indigo-400">Added</span>}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">Title *</label>
                    <input
                      type="text"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50"
                      placeholder="Product name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">Link *</label>
                    <input
                      type="url"
                      value={newProduct.link}
                      onChange={(e) => setNewProduct((p) => ({ ...p, link: e.target.value }))}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">Description</label>
                    <input
                      type="text"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50"
                      placeholder="Short description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">Image URL</label>
                      <input
                        type="url"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct((p) => ({ ...p, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wide mb-1 block">Price</label>
                      <input
                        type="text"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50"
                        placeholder="$29.99"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={createAndAttach}
                    disabled={!newProduct.title || !newProduct.link}
                    className="w-full py-2.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Create & Attach
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
