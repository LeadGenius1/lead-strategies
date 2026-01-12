const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-wheat-beta-15.vercel.app';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  createdAt: string;
  updatedAt: string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
}

export async function createCampaign(data: {
  name: string;
  subject: string;
  content: string;
  recipientIds: string[];
}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }

  return response.json();
}

export async function getCampaigns(): Promise<Campaign[]> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch campaigns');
  }

  return response.json();
}

export async function getCampaign(id: string): Promise<Campaign> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }

  return response.json();
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }

  return response.json();
}

export async function deleteCampaign(id: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }

  return response.json();
}

export async function sendCampaign(id: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns/${id}/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to send campaign');
  }

  return response.json();
}

export async function getCampaignAnalytics(id: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/api/campaigns/${id}/analytics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch campaign analytics');
  }

  return response.json();
}
