export default function QuickActions({ actions }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-left group"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <action.icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white">{action.label}</p>
              <p className="text-xs text-slate-400">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}



