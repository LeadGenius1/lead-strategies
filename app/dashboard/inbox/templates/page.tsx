'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface CannedResponse {
  id: string;
  name: string;
  shortcode: string;
  content: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<CannedResponse[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CannedResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortcode: '',
    content: '',
    category: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/inbox/templates');
    } else if (user) {
      fetchTemplates();
    }
  }, [user, loading, router]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/v1/canned-responses', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplates(result.data || []);
        }
      }
    } catch (error) {
      console.error('Fetch templates error:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      shortcode: '',
      content: '',
      category: '',
      isActive: true,
    });
    setError(null);
    setSuccess(null);
    setShowCreateModal(true);
  };

  const handleEdit = (template: CannedResponse) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      shortcode: template.shortcode,
      content: template.content,
      category: template.category || '',
      isActive: template.isActive,
    });
    setError(null);
    setSuccess(null);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingTemplate
        ? `/api/v1/canned-responses/${editingTemplate.id}`
        : '/api/v1/canned-responses';
      
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
        fetchTemplates();
        setTimeout(() => {
          setShowCreateModal(false);
          setSuccess(null);
        }, 1500);
      } else {
        setError(result.error || 'Failed to save template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/v1/canned-responses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Template deleted successfully!');
        fetchTemplates();
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(result.error || 'Failed to delete template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || loadingTemplates) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-6xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Dashboard
            </Link>
            <Link href="/dashboard/inbox" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Inbox
            </Link>
            <Link href="/dashboard/inbox/templates" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Templates
            </Link>
            <Link href="/dashboard/inbox/automation" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Automation
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            {user.firstName}
          </div>

          <button
            onClick={logout}
            className="bg-transparent border border-subtle text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Templates Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-bold" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                Response <span className="text-gradient">Templates</span>
              </h1>
              <p className="text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                Create reusable message templates for faster responses
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist flex items-center gap-2"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-400 text-sm font-geist mb-6">
              {success}
            </div>
          )}
          {error && !showCreateModal && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-subtle pl-12 pr-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
            />
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="bg-[#050505] border border-subtle p-12 text-center">
              <p className="text-neutral-500 font-geist mb-4">
                {searchQuery ? 'No templates found matching your search.' : 'No templates created yet.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreate}
                  className="bg-white text-black px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Your First Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white font-space-grotesk mb-1">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-geist">
                          /{template.shortcode}
                        </span>
                        {!template.isActive && (
                          <span className="text-xs px-2 py-1 bg-neutral-500/20 text-neutral-400 border border-neutral-500/30 font-geist">
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-400 font-geist mb-4 line-clamp-3">
                    {template.content}
                  </p>

                  {template.category && (
                    <p className="text-xs text-neutral-600 font-geist mb-4 uppercase tracking-wider">
                      {template.category}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-subtle text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist flex items-center justify-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-subtle max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-subtle">
              <h2 className="text-2xl font-bold text-white font-space-grotesk">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm font-geist mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Message"
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Shortcode * (use / to insert quickly)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-geist">/</span>
                    <input
                      type="text"
                      value={formData.shortcode}
                      onChange={(e) => setFormData({ ...formData, shortcode: e.target.value.replace(/\//g, '') })}
                      placeholder="welcome"
                      className="flex-1 bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Support, Sales, General"
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 font-geist mb-2">
                    Template Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Hi {{name}}, welcome to our platform! How can I help you today?"
                    className="w-full bg-[#030303] border border-subtle px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors font-geist min-h-[150px] resize-none"
                    required
                  />
                  <p className="text-xs text-neutral-600 font-geist mt-2">
                    Use {'{{'}{'{'}variable{'}'}{'}'}  for dynamic content (e.g., {'{{'}{'{'}name{'}'}{'}'},  {'{{'}{'{'}email{'}'}{'}'}  )
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm text-neutral-400 font-geist">
                    Active (can be used in conversations)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-transparent border border-subtle text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                >
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
