export default function ContentGrid({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-white mb-4">Uploaded Content</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-neutral-900/30 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <div className="text-xs text-purple-400 mb-2">{item.type}</div>
            <div className="text-sm text-white truncate">{item.filename}</div>
            <div className="text-xs text-neutral-500 mt-1">{(Number(item.file_size) / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        ))}
      </div>
    </div>
  );
}
