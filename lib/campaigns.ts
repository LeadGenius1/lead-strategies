export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}
// lib/campaigns.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'active' | 'paused' | 'completed';
  type: 'email' | 'sms' | 'multi-channel';
  subject?: string;
  content?: string;
  template?: string;
  leads: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  dailyStats: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'multi-channel';
}

// Default campaign templates
export const DEFAULT_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    description: 'Initial contact with new prospects',
    subject: 'Quick question about {{company}}',
    content: `Hi {{firstName}},

I noticed {{company}} is doing great things in {{industry}}. I wanted to reach out because we help companies like yours generate more qualified leads.

Would you be open to a quick 15-minute call this week?

Best,
{{senderName}}`,
    type: 'email'
  },
  {
    id: 'follow-up',
    name: 'Follow Up',
    description: 'Second touch after no response',
    subject: 'Re: Quick question about {{company}}',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email. I understand you're busy, but I think we could really help {{company}} with lead generation.

Do you have 10 minutes this week for a quick chat?

Best,
{{senderName}}`,
    type: 'email'
  },
  {
    id: 'value-add',
    name: 'Value Add',
    description: 'Provide value before asking',
    subject: 'Thought you might find this useful',
    content: `Hi {{firstName}},

I came across this resource on {{topic}} and thought of {{company}}. 

[Link to resource]

Let me know if you find it helpful!

Best,
{{senderName}}`,
    type: 'email'
  },
  {
    id: 'meeting-request',
    name: 'Meeting Request',
    description: 'Direct meeting request',
    subject: 'Meeting request - {{company}} + AI Lead Strategies',
    content: `Hi {{firstName}},

I'd love to show you how AI Lead Strategies can help {{company}} increase qualified leads by 40%.

Are you available for a 15-minute demo this week?

Best,
{{senderName}}`,
    type: 'email'
  }
];

// Validation function for campaigns
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCampaign(campaign: Partial<Campaign>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Campaign name is required' });
  } else if (campaign.name.length > 100) {
    errors.push({ field: 'name', message: 'Campaign name must be less than 100 characters' });
  }

  if (!campaign.type) {
    errors.push({ field: 'type', message: 'Campaign type is required' });
  }

  if (campaign.type === 'email') {
    if (!campaign.subject || campaign.subject.trim().length === 0) {
      errors.push({ field: 'subject', message: 'Email subject is required' });
    }
  }

  if (!campaign.content || campaign.content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Campaign content is required' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export async function getCampaigns(): Promise<Campaign[]> {
  return fetchWithAuth('/api/campaigns');
}

export async function getCampaign(id: string): Promise<Campaign> {
  return fetchWithAuth(`/api/campaigns/${id}`);
}

export async function createCampaign(data: Partial<Campaign>): Promise<Campaign> {
  return fetchWithAuth('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  return fetchWithAuth(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCampaign(id: string): Promise<void> {
  return fetchWithAuth(`/api/campaigns/${id}`, {
    method: 'DELETE',
  });
}

export async function pauseCampaign(id: string): Promise<Campaign> {
  return fetchWithAuth(`/api/campaigns/${id}/pause`, {
    method: 'POST',
  });
}

export async function activateCampaign(id: string): Promise<Campaign> {
  return fetchWithAuth(`/api/campaigns/${id}/activate`, {
    method: 'POST',
  });
}

export async function getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
  return fetchWithAuth(`/api/campaigns/${id}/analytics`);
}

export async function duplicateCampaign(id: string): Promise<Campaign> {
  return fetchWithAuth(`/api/campaigns/${id}/duplicate`, {
    method: 'POST',
  });
}

export async function sendTestEmail(id: string, email: string): Promise<void> {
  return fetchWithAuth(`/api/campaigns/${id}/test`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}


