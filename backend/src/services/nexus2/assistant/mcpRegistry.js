// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — MCP INTEGRATION REGISTRY
// Static registry of supported MCP providers and their tools.
// ═══════════════════════════════════════════════════════════════

const PROVIDERS = {
  // ─── Social OAuth Providers ──────────────────────────────
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'Post to Facebook Pages automatically',
    icon: 'facebook',
    category: 'social',
    authType: 'oauth',
    channelType: 'facebook',
    requiredConfig: [],
    tools: [],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Post photos and reels to Instagram Business',
    icon: 'instagram',
    category: 'social',
    authType: 'oauth',
    channelType: 'instagram',
    requiredConfig: [],
    tools: [],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Publish posts to LinkedIn profile and company page',
    icon: 'linkedin',
    category: 'social',
    authType: 'oauth',
    channelType: 'linkedin',
    requiredConfig: [],
    tools: [],
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Post tweets and threads automatically',
    icon: 'twitter',
    category: 'social',
    authType: 'oauth',
    channelType: 'twitter',
    requiredConfig: [],
    tools: [],
  },
  // ─── API Key Providers ───────────────────────────────────
  instantly: {
    id: 'instantly',
    name: 'Instantly',
    description: 'Email outreach campaigns — send, track, and manage cold email at scale.',
    icon: 'mail',
    category: 'email',
    requiredConfig: ['apiKey'],
    tools: [
      { name: 'list_campaigns', description: 'List all campaigns' },
      { name: 'get_analytics', description: 'Get campaign analytics' },
      { name: 'list_leads', description: 'List leads in a campaign' },
      { name: 'add_leads', description: 'Add leads to a campaign' },
    ],
  },
  google_sheets: {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Read and write spreadsheet data — import leads, export reports.',
    icon: 'table',
    category: 'data',
    requiredConfig: ['accessToken'],
    tools: [
      { name: 'read_sheet', description: 'Read data from a spreadsheet' },
      { name: 'write_sheet', description: 'Write data to a spreadsheet' },
      { name: 'list_sheets', description: 'List available spreadsheets' },
    ],
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM sync — manage contacts, deals, and pipeline from Lead Hunter.',
    icon: 'users',
    category: 'crm',
    requiredConfig: ['apiKey'],
    tools: [
      { name: 'list_contacts', description: 'List CRM contacts' },
      { name: 'create_contact', description: 'Create a new contact' },
      { name: 'list_deals', description: 'List deals in pipeline' },
      { name: 'create_deal', description: 'Create a new deal' },
    ],
  },
};

function getProvider(id) {
  return PROVIDERS[id] || null;
}

function listProviders() {
  return Object.values(PROVIDERS);
}

function getProviderTools(id) {
  const provider = PROVIDERS[id];
  return provider ? provider.tools : [];
}

module.exports = { getProvider, listProviders, getProviderTools, PROVIDERS };
