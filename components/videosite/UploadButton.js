export default function UploadButton({ type, icon: Icon, label, onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file, type);
  };

  return (
    <label className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all duration-500 text-center overflow-hidden">
      <div className="relative z-10">
        <Icon className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
        <div className="text-white font-medium mb-2">{label}</div>
        <div className="text-xs text-neutral-500 font-light">Click to upload</div>
      </div>
      <input type="file" className="hidden" onChange={handleFileChange} accept="video/*,image/*,audio/*" />
    </label>
  );
}
