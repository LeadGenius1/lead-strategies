'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Icons } from '@/components/Icons';

const INDUSTRIES = [
  'All Industries',
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Manufacturing',
  'Retail',
  'Consulting'
];

const TONES = [
  'All Tones',
  'Professional',
  'Friendly',
  'Urgent',
  'Casual',
  'Formal'
];

const MOCK_TEMPLATES = [
  {
    id: '1',
    title: 'SaaS Product Launch',
    industry: 'Technology',
    tone: 'Professional',
    subject: 'Introducing {{companyName}} - Transform Your {{painPoint}}',
    body: `Hi {{firstName}},

I noticed {{companyName}} is in the {{industry}} space, and I thought you'd be interested in how we're helping companies like yours solve {{painPoint}}.

{{productName}} is a new solution that:
✓ {{benefit1}}
✓ {{benefit2}}
✓ {{benefit3}}

Would you be open to a quick 15-minute call this week to see if this could help {{companyName}}?

Best regards,
{{senderName}}`,
    opens: 847,
    replies: 124,
    conversionRate: 14.6
  },
  {
    id: '2',
    title: 'Meeting Follow-up',
    industry: 'All Industries',
    tone: 'Friendly',
    subject: 'Great chatting with you, {{firstName}}!',
    body: `Hi {{firstName}},

Thanks for taking the time to chat earlier! I really enjoyed learning about {{companyName}}'s goals for {{goalArea}}.

As promised, here's the information we discussed:
• {{resource1}}
• {{resource2}}
• {{resource3}}

Let me know if you have any questions. Would you like to schedule that follow-up call for next week?

Cheers,
{{senderName}}`,
    opens: 923,
    replies: 187,
    conversionRate: 20.3
  },
  {
    id: '3',
    title: 'Cold Outreach - B2B Services',
    industry: 'Consulting',
    tone: 'Professional',
    subject: 'Quick question about {{companyName}}\'s {{department}}',
    body: `{{firstName}},

I've been following {{companyName}}'s growth in the {{industry}} space - congrats on the recent {{achievement}}!

I specialize in helping companies like yours improve {{metric}} through {{solution}}. We've helped similar companies achieve:

→ {{result1}}
→ {{result2}}
→ {{result3}}

Would you be open to a brief chat about how this could work for {{companyName}}?

Best,
{{senderName}}`,
    opens: 612,
    replies: 89,
    conversionRate: 14.5
  },
  {
    id: '4',
    title: 'Re-engagement Campaign',
    industry: 'All Industries',
    tone: 'Casual',
    subject: 'Still interested, {{firstName}}?',
    body: `Hey {{firstName}},

I reached out a few weeks ago about {{productName}}, but I know timing isn't always right.

Just wanted to check in - are you still looking to {{goal}}?

If now's not a good time, no worries! Just let me know when might be better to reconnect.

Thanks!
{{senderName}}`,
    opens: 456,
    replies: 78,
    conversionRate: 17.1
  },
  {
    id: '5',
    title: 'Healthcare Solution Intro',
    industry: 'Healthcare',
    tone: 'Professional',
    subject: 'Helping {{companyName}} improve patient outcomes',
    body: `Dr. {{lastName}},

Healthcare providers like {{companyName}} are facing increasing pressure to {{challenge}}.

Our platform helps medical practices:
✓ Reduce administrative burden by {{percentage}}%
✓ Improve patient satisfaction scores
✓ Increase revenue per patient visit

We're currently working with {{competitorName}} and {{competitorName2}} with great results.

Would you have 20 minutes next week to explore how this could benefit your practice?

Respectfully,
{{senderName}}`,
    opens: 534,
    replies: 67,
    conversionRate: 12.5
  }
];

export default function LibraryPage() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [toneFilter, setToneFilter] = useState('All Tones');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    filterTemplates();
  }, [industryFilter, toneFilter, searchQuery]);

  function filterTemplates() {
    let filtered = templates;

    if (industryFilter !== 'All Industries') {
      filtered = filtered.filter(t => 
        t.industry === industryFilter || t.industry === 'All Industries'
      );
    }

    if (toneFilter !== 'All Tones') {
      filtered = filtered.filter(t => t.tone === toneFilter || t.tone === 'All Tones');
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }

  function copyToClipboard(template) {
    const text = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(text);
    toast.success('Template copied to clipboard!');
  }

  function useTemplate(template) {
    // TODO: Navigate to copilot with template pre-loaded
    toast.success('Opening in Copilot...');
    // router.push(`/copilot?template=${template.id}`);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Template Library</h1>
          <p className="text-neutral-400">
            Browse our collection of high-converting email templates
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>

          {/* Tone Filter */}
          <select
            value={toneFilter}
            onChange={(e) => setToneFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          >
            {TONES.map(tone => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-neutral-400 text-sm">
          Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Template Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <span className="px-2 py-1 bg-neutral-800 rounded">
                    {template.industry}
                  </span>
                  <span className="px-2 py-1 bg-neutral-800 rounded">
                    {template.tone}
                  </span>
                </div>
              </div>

              {/* Subject Line */}
              <div className="mb-4">
                <div className="text-xs text-neutral-500 mb-1">Subject:</div>
                <div className="text-sm text-neutral-300 line-clamp-2">
                  {template.subject}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-neutral-500">Opens</div>
                  <div className="font-semibold">{template.opens}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Replies</div>
                  <div className="font-semibold">{template.replies}</div>
                </div>
                <div>
                  <div className="text-neutral-500">Conv. Rate</div>
                  <div className="font-semibold text-green-400">
                    {template.conversionRate}%
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(template);
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    useTemplate(template);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <Icons.Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-neutral-400">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedTemplate(null)}
          >
            <div
              className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedTemplate.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span className="px-2 py-1 bg-neutral-800 rounded">
                      {selectedTemplate.industry}
                    </span>
                    <span className="px-2 py-1 bg-neutral-800 rounded">
                      {selectedTemplate.tone}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>

              {/* Subject */}
              <div className="mb-6">
                <label className="block text-sm text-neutral-400 mb-2">Subject Line:</label>
                <div className="px-4 py-3 bg-neutral-800 rounded-lg text-white">
                  {selectedTemplate.subject}
                </div>
              </div>

              {/* Body */}
              <div className="mb-6">
                <label className="block text-sm text-neutral-400 mb-2">Email Body:</label>
                <div className="px-4 py-3 bg-neutral-800 rounded-lg text-white whitespace-pre-wrap">
                  {selectedTemplate.body}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                <div className="px-4 py-3 bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.opens}</div>
                  <div className="text-sm text-neutral-400">Opens</div>
                </div>
                <div className="px-4 py-3 bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.replies}</div>
                  <div className="text-sm text-neutral-400">Replies</div>
                </div>
                <div className="px-4 py-3 bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {selectedTemplate.conversionRate}%
                  </div>
                  <div className="text-sm text-neutral-400">Conversion Rate</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => copyToClipboard(selectedTemplate)}
                  className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => useTemplate(selectedTemplate)}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Use in Copilot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
