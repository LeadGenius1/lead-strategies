import { Mail, Building } from 'lucide-react'

export default function LeadTable({ leads, onLeadClick }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No leads yet. Import or create your first lead!</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Recent Leads</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick && onLeadClick(lead.id)}
                className="hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-white">{lead.name || 'N/A'}</td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {lead.company || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    lead.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'replied' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {lead.status || 'new'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

