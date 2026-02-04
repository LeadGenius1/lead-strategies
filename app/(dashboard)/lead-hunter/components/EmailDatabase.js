'use client';

import { useState, useEffect } from 'react';
import { Mail, Search, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function EmailDatabase({ onSelectEmails }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchEmails() {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/emails/database');
      const data = res.data?.data || res.data || {};
      setEmails(Array.isArray(data.emails) ? data.emails : []);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(
    (email) =>
      email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.htmlContent || email.textContent || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (email.name || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function toggleEmail(emailId) {
    setSelectedEmails((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    );
  }

  function handleUseSelected() {
    const selected = emails.filter((email) => selectedEmails.includes(email.id));
    onSelectEmails(selected);
  }

  return (
    <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-400" />
          Email Database
        </h3>
        <button
          type="button"
          onClick={fetchEmails}
          disabled={loading}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search saved emails..."
          className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder-neutral-600 text-sm font-light focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm font-light">
            {searchTerm ? 'No emails match your search' : 'No saved emails yet'}
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleEmail(email.id)}
              onKeyDown={(e) => e.key === 'Enter' && toggleEmail(email.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedEmails.includes(email.id)
                  ? 'bg-indigo-500/10 border-indigo-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium text-sm">{email.subject || email.name || 'Untitled'}</h4>
                <span className="text-xs text-neutral-500">{email.name || 'Template'}</span>
              </div>
              <p className="text-neutral-400 text-sm font-light line-clamp-2">
                {(email.textContent || email.htmlContent || '').replace(/<[^>]*>/g, '').slice(0, 120)}...
              </p>
            </div>
          ))
        )}
      </div>

      {selectedEmails.length > 0 && (
        <button
          type="button"
          onClick={handleUseSelected}
          className="w-full px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-medium rounded-lg transition-all"
        >
          Use {selectedEmails.length} Selected Email{selectedEmails.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
