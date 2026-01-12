'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TestLoginPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('1');

  const testUsers = {
    '1': {
      id: 'test-tier1',
      email: 'test@leadsite.ai',
      name: 'Test User Tier 1',
      tier: 1,
      token: 'test-token-tier1'
    },
    '2': {
      id: 'test-tier2',
      email: 'test@leadsite.io',
      name: 'Test User Tier 2',
      tier: 2,
      token: 'test-token-tier2'
    },
    '3': {
      id: 'test-tier3',
      email: 'test@clientcontact.io',
      name: 'Test User Tier 3',
      tier: 3,
      token: 'test-token-tier3'
    },
    '4': {
      id: 'test-tier4',
      email: 'test@videosite.ai',
      name: 'Test User Tier 4',
      tier: 4,
      token: 'test-token-tier4'
    }
  };

  const handleTestLogin = (tier: string) => {
    const user = testUsers[tier as keyof typeof testUsers];
    
    // Set test token in localStorage
    localStorage.setItem('token', user.token);
    localStorage.setItem('testUser', JSON.stringify(user));
    
    // Set cookie for middleware
    document.cookie = `auth-token=${user.token}; path=/; max-age=86400`; // 24 hours
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 Test Login - Platform Testing</h1>
        <p className="text-gray-400 mb-8">Bypass authentication for dashboard testing</p>

        <div className="space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer" onClick={() => handleTestLogin('1')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Tier 1 - LeadSite.AI</h3>
                <p className="text-gray-400 text-sm mt-1">$79/mo - Email campaigns, 50 leads</p>
                <p className="text-purple-400 text-xs mt-2">Domain: leadsite.ai</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                Test Login
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-lg p-6 hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => handleTestLogin('2')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Tier 2 - LeadSite.IO</h3>
                <p className="text-gray-400 text-sm mt-1">$149/mo - Website builder, 100 leads</p>
                <p className="text-indigo-400 text-xs mt-2">Domain: leadsite.io</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                Test Login
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer" onClick={() => handleTestLogin('3')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Tier 3 - ClientContact.IO</h3>
                <p className="text-gray-400 text-sm mt-1">$249/mo - Advanced features, 500 leads</p>
                <p className="text-blue-400 text-xs mt-2">Domain: clientcontact.io</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Test Login
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-[#222] rounded-lg p-6 hover:border-green-500 transition-colors cursor-pointer" onClick={() => handleTestLogin('4')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Tier 4 - VideoSite.AI</h3>
                <p className="text-gray-400 text-sm mt-1">$99/mo - Video features, 1000 leads</p>
                <p className="text-green-400 text-xs mt-2">Domain: videosite.ai</p>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
                Test Login
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ <strong>Test Mode:</strong> This bypasses authentication. Use only for platform testing.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/login" className="text-gray-400 hover:text-white text-sm">
            Go to regular login →
          </a>
        </div>
      </div>
    </div>
  );
}
