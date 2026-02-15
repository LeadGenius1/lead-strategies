'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PreviewPage() {
  const params = useParams();
  const id = params?.id;
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid preview ID');
      setLoading(false);
      return;
    }
    fetch(`/api/websites/${id}/preview`)
      .then((res) => {
        if (!res.ok) throw new Error('Preview not found');
        return res.text();
      })
      .then(setHtml)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-neutral-400">Loading preview...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }
  return (
    <div
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
