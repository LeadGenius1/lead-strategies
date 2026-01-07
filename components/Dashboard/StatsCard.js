export default function StatsCard({ title, value, change, icon: Icon, trend = 'up' }) {
  const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400'
  const trendIcon = trend === 'up' ? '↑' : '↓'

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {change && (
            <p className={`text-sm ${trendColor}`}>
              {trendIcon} {change} from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
        )}
      </div>
    </div>
  )
}



