import { CheckCircle } from 'lucide-react';

export default function ClipSelector({ content = [], selected = [], onSelect }) {
  if (content.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-black/30 border border-white/10">
        <p className="text-sm text-neutral-500">Upload content first</p>
      </div>
    );
  }

  const isSelected = (itemId) => selected.some(c => c.id === itemId);

  const toggleSelection = (item) => {
    if (isSelected(item.id)) {
      onSelect(selected.filter(c => c.id !== item.id));
    } else {
      onSelect([...selected, item]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {content.map((item) => {
        const sel = isSelected(item.id);
        return (
          <button
            key={item.id}
            onClick={() => toggleSelection(item)}
            className={`p-3 rounded-lg border transition-all ${sel ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-black/30 border-white/10'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-indigo-400">{item.type}</span>
              {sel && <CheckCircle className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className="text-xs text-white truncate">{item.filename}</div>
          </button>
        );
      })}
    </div>
  );
}
