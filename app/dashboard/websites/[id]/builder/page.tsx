'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { WebsiteData, Page } from '@/lib/website-builder/types';
import DragDropBuilder from '@/components/website-builder/DragDropBuilder';

export default function WebsiteBuilderPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/dashboard/websites/${websiteId}/builder`);
    } else if (user) {
      fetchWebsite();
    }
  }, [user, loading, websiteId, router]);

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const websiteData = result.data.website || result.data;
          setWebsite(websiteData);
          
          // Set first page as current, or create default page
          if (websiteData.pages && websiteData.pages.length > 0) {
            setCurrentPage(websiteData.pages[0]);
          } else {
            // Show prompt interface if no pages exist
            setCurrentPage(null);
          }
        }
      }
    } catch (error) {
      console.error('Fetch website error:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe what you want your landing page to be about');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          websiteName: website?.name || 'My Website',
        }),
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Update website with generated pages
        const updatedWebsite = {
          ...website!,
          pages: result.data.pages,
          settings: { ...website!.settings, ...result.data.settings },
        };

        // Save to backend
        await saveWebsite(updatedWebsite);
        
        // Update local state
        setWebsite(updatedWebsite);
        if (updatedWebsite.pages && updatedWebsite.pages.length > 0) {
          setCurrentPage(updatedWebsite.pages[0]);
        }
      } else {
        setError(result.error || 'Failed to generate website');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const handleSectionsChange = (sections: any[]) => {
    if (!currentPage) return;
    
    const updatedPage = {
      ...currentPage,
      sections,
    };
    setCurrentPage(updatedPage);
    saveWebsiteWithPage(updatedPage);
  };

  const saveWebsiteWithPage = async (page: Page) => {
    if (!website) return;
    
    const updatedPages = website.pages.map((p) =>
      p.id === page.id ? page : p
    );

    await saveWebsite({
      ...website,
      pages: updatedPages,
    });
  };

  const saveWebsite = async (websiteData?: WebsiteData) => {
    if (!website && !websiteData) return;
    
    setSaving(true);
    try {
      const dataToSave = websiteData || website!;

      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWebsite(result.data.website || result.data);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !website) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show prompt interface if no pages exist
  if (!currentPage) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <Link
              href="/dashboard/websites"
              className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest mb-4 inline-block"
            >
              ← Back to Websites
            </Link>
            <h1 className="text-4xl md:text-6xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Build Your <span className="text-gradient">Landing Page</span>
            </h1>
            <p className="text-neutral-400 font-geist">
              Describe what you want, and AI will create a complete landing page for you
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist mb-6">
              {error}
            </div>
          )}

          <div className="bg-[#050505] border border-subtle p-8">
            <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-4">
              Describe Your Landing Page
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: A landing page for a SaaS product that helps small businesses manage their inventory. Include features like real-time tracking, automated reordering, and analytics dashboard. Target audience is small business owners."
              className="w-full bg-[#030303] border border-subtle p-4 text-white outline-none focus:border-purple-500 transition-colors font-geist min-h-[200px] resize-none"
              disabled={generating}
            />
            <p className="text-xs text-neutral-500 font-geist mt-2">
              Be specific about your business, target audience, and key features you want to highlight.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full mt-6 bg-white text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating your landing page...
                </>
              ) : (
                '✨ Generate Landing Page'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show builder interface if pages exist
  return (
    <div className="h-screen flex flex-col bg-[#030303]">
      {/* Top Bar */}
      <div className="bg-[#050505] border-b border-subtle px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/websites"
            className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-white font-space-grotesk">
            {website.name}
          </h1>
          {saving && (
            <span className="text-xs text-neutral-500 font-geist">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPrompt('');
              setCurrentPage(null);
            }}
            className="bg-white/5 hover:bg-white/10 border border-subtle text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
          >
            Regenerate
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="bg-white/5 hover:bg-white/10 border border-subtle text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
          >
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => saveWebsite()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors font-geist"
          >
            Save
          </button>
        </div>
      </div>

      {/* Builder Area */}
      <div className="flex-1 overflow-y-auto">
        <DragDropBuilder
          sections={currentPage.sections}
          onSectionsChange={handleSectionsChange}
          isEditing={!previewMode}
        />
      </div>
    </div>
  );
}
