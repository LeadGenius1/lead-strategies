export default function StatsCard({ icon: Icon, title, value, color = 'indigo' }) {
  return (
    <div className="group relative p-8 rounded-2xl bg-neutral-900/30 border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden">
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="text-3xl font-medium text-white mb-1">{value}</div>
        <div className="text-sm text-neutral-400 font-light">{title}</div>
      </div>
    </div>
  );
}
