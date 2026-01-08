import { Play, Pause, BarChart3, Trash2 } from 'lucide-react'

export default function CampaignList({ campaigns, onToggle, onView, onDelete }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No campaigns yet. Create your first campaign!</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Campaigns</h3>
      </div>
      <div className="divide-y divide-white/10">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{campaign.name}</h4>
                <p className="text-sm text-slate-400">
                  {campaign.leads_count || 0} leads • {campaign.sent_count || 0} sent • 
                  {campaign.reply_rate || 0}% reply rate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(campaign.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="View Stats"
                >
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={() => onToggle(campaign.id, campaign.status)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={campaign.status === 'active' ? 'Pause' : 'Start'}
                >
                  {campaign.status === 'active' ? (
                    <Pause className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Play className="w-5 h-5 text-green-400" />
                  )}
                </button>
                <button
                  onClick={() => onDelete(campaign.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}




