'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MessageSquare, Loader2 } from 'lucide-react';

export default function RepliesPage() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReplies() {
      try {
        const res = await api.get('/api/v1/campaigns/replies');
        const data = res.data?.data || res.data || {};
        setReplies(Array.isArray(data.replies) ? data.replies : []);
      } catch (err) {
        console.error('Failed to load replies:', err);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    }
    loadReplies();
  }, []);

  return (
    <div className="min-h-screen bg-black p-6">
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        }}
      />

      <div className="max-w-4xl mx-auto relative">
        <h1 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Campaign Replies
        </h1>
        <p className="text-neutral-500 text-sm font-light mb-6">Email responses from your campaigns</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : replies.length === 0 ? (
          <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 font-light">No replies yet.</p>
            <p className="text-neutral-500 text-sm mt-1">Keep reaching out!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium text-sm">{reply.from_name || reply.fromName || 'Unknown'}</h3>
                    <p className="text-neutral-400 text-xs">{reply.from_email || reply.fromEmail || ''}</p>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {reply.received_at || reply.receivedAt
                      ? new Date(reply.received_at || reply.receivedAt).toLocaleDateString()
                      : ''}
                  </span>
                </div>
                <p className="text-neutral-300 text-sm font-light whitespace-pre-wrap">{reply.body || reply.content || ''}</p>
                {reply.campaign_name || reply.campaignName ? (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-indigo-400">Campaign: {reply.campaign_name || reply.campaignName}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
