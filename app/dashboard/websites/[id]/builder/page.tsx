'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { WebsiteData, Section, Page } from '@/lib/website-builder/types';
import { createSectionFromTemplate, SECTION_TEMPLATES } from '@/lib/website-builder/sections';
import { SectionTemplate } from '@/lib/website-builder/types';
import DragDropBuilder from '@/components/website-builder/DragDropBuilder';
import SectionPalette from '@/components/website-builder/SectionPalette';

export default function WebsiteBuilderPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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
            const defaultPage: Page = {
              id: 'home',
              name: 'Home',
              slug: 'home',
              sections: [],
            };
            setCurrentPage(defaultPage);
          }
        }
      }
    } catch (error) {
      console.error('Fetch website error:', error);
    }
  };

  const handleAddSection = (template: SectionTemplate) => {
    if (!currentPage) return;
    
    const newSection = createSectionFromTemplate(template);
    const updatedPage = {
      ...currentPage,
      sections: [...currentPage.sections, newSection],
    };
    setCurrentPage(updatedPage);
    saveWebsite(updatedPage);
  };

  const handleSectionsChange = (sections: Section[]) => {
    if (!currentPage) return;
    
    const updatedPage = {
      ...currentPage,
      sections,
    };
    setCurrentPage(updatedPage);
    saveWebsite(updatedPage);
  };

  const saveWebsite = async (page?: Page) => {
    if (!website || !currentPage) return;
    
    setSaving(true);
    try {
      const pageToSave = page || currentPage;
      const updatedPages = website.pages.map((p) =>
        p.id === pageToSave.id ? pageToSave : p
      );

      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...website,
          pages: updatedPages,
        }),
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

  if (loading || !website || !currentPage) {
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Section Palette */}
        {!previewMode && (
          <SectionPalette onAddSection={handleAddSection} />
        )}

        {/* Builder Area */}
        <div className="flex-1 overflow-y-auto">
          <DragDropBuilder
            sections={currentPage.sections}
            onSectionsChange={handleSectionsChange}
            isEditing={!previewMode}
          />
        </div>
      </div>
    </div>
  );
}
