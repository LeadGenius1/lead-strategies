'use client';

import { useState } from 'react';
import { X, Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ConnectEmailModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConnectEmailModal({ onClose, onSuccess }: ConnectEmailModalProps) {
  const [tab, setTab] = useState<'oauth' | 'smtp'>('oauth');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [smtp, setSmtp] = useState({
    email: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    displayName: '',
  });

  const handleGoogleOAuth = () => {
    window.location.href = '/api/user/email-accounts/oauth/google';
  };

  const handleMicrosoftOAuth = () => {
    window.location.href = '/api/user/email-accounts/oauth/microsoft';
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/user/email-accounts/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: smtp.smtpHost,
          smtpPort: parseInt(smtp.smtpPort, 10),
          smtpUsername: smtp.smtpUsername,
          smtpPassword: smtp.smtpPassword,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: 'Failed to test connection' });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSMTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/email-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...smtp, smtpPort: parseInt(smtp.smtpPort, 10) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to connect');
      }
      onSuccess();
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : 'Failed to connect' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-white font-semibold">Connect Your Email</h3>
              <p className="text-[10px] text-white/40 mt-0.5">Free plan • 50 emails/day limit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setTab('oauth')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'oauth' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/40 hover:text-white/60'
            }`}
            type="button"
          >
            Gmail / Outlook
          </button>
          <button
            onClick={() => setTab('smtp')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'smtp' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/40 hover:text-white/60'
            }`}
            type="button"
          >
            Custom SMTP
          </button>
        </div>

        <div className="p-5">
          {tab === 'oauth' ? (
            <div className="space-y-3">
              <p className="text-white/50 text-sm mb-4">
                Connect your email securely via OAuth. We only request permission to send emails on your behalf.
              </p>
              <button
                onClick={handleGoogleOAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white"
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Gmail
              </button>
              <button
                onClick={handleMicrosoftOAuth}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white"
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <rect fill="#F25022" x="1" y="1" width="10" height="10" />
                  <rect fill="#00A4EF" x="1" y="12" width="10" height="10" />
                  <rect fill="#7FBA00" x="12" y="1" width="10" height="10" />
                  <rect fill="#FFB900" x="12" y="12" width="10" height="10" />
                </svg>
                Connect Outlook
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={smtp.email}
                  onChange={(e) => setSmtp({ ...smtp, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="you@yourdomain.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">SMTP Host</label>
                  <input
                    type="text"
                    value={smtp.smtpHost}
                    onChange={(e) => setSmtp({ ...smtp, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Port</label>
                  <input
                    type="number"
                    value={smtp.smtpPort}
                    onChange={(e) => setSmtp({ ...smtp, smtpPort: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                    placeholder="587"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Username</label>
                <input
                  type="text"
                  value={smtp.smtpUsername}
                  onChange={(e) => setSmtp({ ...smtp, smtpUsername: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="you@yourdomain.com"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Password / App Password</label>
                <input
                  type="password"
                  value={smtp.smtpPassword}
                  onChange={(e) => setSmtp({ ...smtp, smtpPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
                  placeholder="••••••••"
                />
              </div>

              {testResult && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                    testResult.success
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {testResult.message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={loading || !smtp.smtpHost || !smtp.smtpUsername || !smtp.smtpPassword}
                  className="flex-1 py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
                  type="button"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Test Connection'}
                </button>
                <button
                  onClick={handleConnectSMTP}
                  disabled={loading || !testResult?.success}
                  className="flex-1 py-2 px-4 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  type="button"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Connect'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
