export default function StatusBadge({ status }) {
  const config = {
    draft: { bg: 'bg-neutral-500/20', text: 'text-neutral-400' },
    rendering: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    published: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
    // VideoSite / Creator Video
    uploading: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    processing: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    ready: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    generating: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    private: { bg: 'bg-neutral-500/20', text: 'text-neutral-400' },
  };

  const c = config[status] || config.draft;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft'}
    </span>
  );
}
