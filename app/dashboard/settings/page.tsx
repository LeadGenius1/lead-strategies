'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    industry: '',
    companySize: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard/settings');
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: user.companyName || '',
        industry: '',
        companySize: '',
      });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to update profile');
        setSaving(false);
        return;
      }

      setSuccess(true);
      await refreshUser();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            <Link href="/dashboard/leads" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Leads
            </Link>
            <Link href="/dashboard/campaigns" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Campaigns
            </Link>
            <Link href="/dashboard/analytics" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="bg-white/5 px-4 py-2 text-xs tracking-widest uppercase text-white font-geist">
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

      {/* Settings Content */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Account <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-neutral-400 font-geist">Manage your profile and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 p-4 text-green-400 text-sm font-geist">
                Profile updated successfully!
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist">
                {error}
              </div>
            )}

            {/* Profile Information */}
            <div className="bg-[#050505] border border-subtle p-8">
              <h2 className="text-2xl font-space-grotesk text-white mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-[#050505] border border-subtle p-8">
              <h2 className="text-2xl font-space-grotesk text-white mb-6">Security</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Password
                  </div>
                  <div className="text-white font-geist mb-4">••••••••</div>
                  <Link href="/dashboard/settings/change-password" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest">
                    Change Password →
                  </Link>
                </div>

                <div className="pt-6 border-t border-subtle">
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    Two-Factor Authentication
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                    <span className="text-neutral-400 font-geist">Not enabled</span>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest">
                    Enable 2FA →
                  </button>
                </div>

                <div className="pt-6 border-t border-subtle">
                  <div className="text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                    API Keys
                  </div>
                  <Link href="/dashboard/settings/api-keys" className="text-purple-400 hover:text-purple-300 font-geist text-sm uppercase tracking-widest">
                    Manage API Keys →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors font-geist">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors font-geist">Terms</Link>
              <Link href="/support" className="hover:text-white transition-colors font-geist">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
