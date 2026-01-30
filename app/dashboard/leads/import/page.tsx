'use client';

import { useState } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ImportLeadsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number; errors?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white font-geist">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/dashboard/leads/import');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please select a CSV file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        if (data.data.imported > 0) {
          setTimeout(() => {
            router.push('/dashboard/leads');
          }, 2000);
        }
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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
            <Link href="/dashboard/leads" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/analytics" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Settings
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

      {/* Import Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Import <span className="text-gradient">Leads</span>
            </h1>
            <p className="text-neutral-400 font-geist">Upload a CSV file to import leads</p>
          </div>

          <div className="bg-[#050505] border border-subtle p-8">
            {result ? (
              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/30 p-6">
                  <h3 className="text-xl font-space-grotesk text-white mb-4">Import Complete!</h3>
                  <div className="space-y-2 text-white font-geist">
                    <p>✅ Successfully imported: <span className="text-green-400 font-bold">{result.imported}</span> leads</p>
                    {result.failed > 0 && (
                      <p>❌ Failed: <span className="text-red-400 font-bold">{result.failed}</span> leads</p>
                    )}
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 font-geist text-sm mb-2">Errors:</p>
                      <ul className="list-disc list-inside text-red-300 text-sm font-geist space-y-1">
                        {result.errors.slice(0, 10).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/leads"
                  className="inline-block bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                >
                  View Leads →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-4">
                    Select CSV File
                  </label>
                  <div className="border-2 border-dashed border-subtle p-12 text-center hover:border-purple-500/30 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="cursor-pointer block"
                    >
                      <svg className="w-16 h-16 text-neutral-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <p className="text-white font-geist mb-2">
                        {file ? file.name : 'Click to select CSV file'}
                      </p>
                      <p className="text-neutral-500 font-geist text-sm">CSV format only</p>
                    </label>
                  </div>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 p-6">
                  <h3 className="text-sm uppercase tracking-widest text-purple-300 font-geist mb-4">
                    CSV Format Requirements
                  </h3>
                  <div className="text-sm text-neutral-300 font-geist space-y-2">
                    <p>Required columns: <span className="text-white">First Name, Last Name, Email</span></p>
                    <p>Optional columns: Company, Title, Phone, Website, Industry, Source, Notes, Tags</p>
                    <p className="text-xs text-neutral-500 mt-4">First row should contain column headers</p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-white text-black px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import Leads'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
