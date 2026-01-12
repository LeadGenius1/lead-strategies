const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-wheat-beta-15.vercel.app';

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'email' | 'sms' | 'social' | 'multichannel';
  platform: 'leadsite-ai' | 'leadsite-io' | 'clientcontact-io' | 'tackle-io' | 'videosite-io';
  leadsCount?: number;
  sentCount?: number;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateCampaignData {
  name: string;
  type: Campaign['type'];
  platform: Campaign['platform'];
  subject?: string;
  content?: string;
  schedule?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${API_URL}/api/campaigns`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch campaigns' }));
    throw new Error(error.message);
  }
  
  const data = await res.json();
  return data.campaigns || data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch campaign' }));
    throw new Error(error.message);
  }
  
  return res.json();
}

export async function createCampaign(data: CreateCampaignData): Promise<Campaign> {
  const res = await fetch(`${API_URL}/api/campaigns`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create campaign' }));
    throw new Error(error.message);
  }
  
  return res.json();
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update campaign' }));
    throw new Error(error.message);
  }
  
  return res.json();
}

export async function deleteCampaign(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to delete campaign' }));
    throw new Error(error.message);
  }
}

export async function pauseCampaign(id: string): Promise<Campaign> {
  return updateCampaign(id, { status: 'paused' });
}

export async function activateCampaign(id: string): Promise<Campaign> {
  return updateCampaign(id, { status: 'active' });
}

export async function getCampaignAnalytics(id: string): Promise<{
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
}> {
  const res = await fetch(`${API_URL}/api/campaigns/${id}/analytics`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch analytics' }));
    throw new Error(error.message);
  }
  
  return res.json();
}
