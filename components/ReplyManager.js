'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function ReplyManager() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReplies();
  }, [filter]);

  const loadReplies = async () => {
    try {
      // This would call your backend API
      // const response = await apiClient.get('/api/v1/conversations/replies');
      // setReplies(response.data);
      
      // Mock data for now
      setReplies([
        {
          id: '1',
          from: 'john@example.com',
          subject: 'Re: Your email about our platform',
          content: 'Thanks for reaching out! I\'m interested in learning more.',
          classification: 'INTERESTED',
          sentiment: 'positive',
          receivedAt: new Date().toISOString(),
          campaignId: 'campaign-1',
        },
      ]);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyReply = async (replyId) => {
    try {
      const reply = replies.find((r) => r.id === replyId);
      if (!reply) return;

      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: `Classify this reply: ${reply.content}`,
        context: { replyId, conversationId: reply.conversationId },
      });

      // Update reply classification
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? { ...r, classification: response.classification, summary: response.summary }
            : r
        )
      );
    } catch (error) {
      console.error('Failed to classify reply:', error);
    }
  };

  const handleGenerateResponse = async (replyId) => {
    try {
      const reply = replies.find((r) => r.id === replyId);
      if (!reply) return;

      const response = await apiClient.post('/api/v1/copilot/chat', {
        message: `Generate a smart response to this ${reply.classification} reply: ${reply.content}`,
        context: { replyId, classification: reply.classification },
      });

      // Show generated response (could be in a modal)
      alert(`Generated Response:\n\n${response.response}`);
    } catch (error) {
      console.error('Failed to generate response:', error);
    }
  };

  const filteredReplies = filter === 'all' 
    ? replies 
    : replies.filter((r) => r.classification === filter);

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'INTERESTED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'NOT_INTERESTED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'OBJECTION':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-neutral-800 text-neutral-400 border-subtle';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-space-grotesk text-white">Reply Management</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-black border border-subtle rounded-lg text-white font-geist text-sm focus:outline-none focus:border-purple-500/50"
        >
          <option value="all">All Replies</option>
          <option value="INTERESTED">Interested</option>
          <option value="NOT_INTERESTED">Not Interested</option>
          <option value="OBJECTION">Objections</option>
          <option value="REFERRAL">Referrals</option>
        </select>
      </div>

      {/* Replies List */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 font-geist">Loading replies...</div>
      ) : filteredReplies.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 font-geist">
          No replies found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReplies.map((reply) => (
            <div
              key={reply.id}
              className="bg-[#050505] border border-subtle rounded-lg p-6 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-space-grotesk text-white">{reply.from}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded font-geist border ${getClassificationColor(
                        reply.classification
                      )}`}
                    >
                      {reply.classification || 'UNCLASSIFIED'}
                    </span>
                  </div>
                  <p className="text-sm font-geist text-neutral-400 mb-2">{reply.subject}</p>
                  <p className="text-sm font-geist text-neutral-300">{reply.content}</p>
                </div>
                <div className="text-xs font-geist text-neutral-500">
                  {new Date(reply.receivedAt).toLocaleDateString()}
                </div>
              </div>

              {reply.summary && (
                <div className="mb-4 p-3 bg-neutral-900 rounded border border-subtle">
                  <p className="text-xs font-geist text-neutral-400">{reply.summary}</p>
                </div>
              )}

              <div className="flex gap-2">
                {!reply.classification && (
                  <button
                    onClick={() => handleClassifyReply(reply.id)}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-lg font-geist text-sm transition-colors"
                  >
                    Classify Reply
                  </button>
                )}
                <button
                  onClick={() => handleGenerateResponse(reply.id)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-geist text-sm transition-colors"
                >
                  Generate Response
                </button>
                <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-geist text-sm transition-colors">
                  View Conversation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
