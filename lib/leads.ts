// Lead management types and utilities

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  title?: string;
  phone?: string;
  website?: string;
  industry?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface LeadImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

export interface LeadFilters {
  status?: string;
  source?: string;
  industry?: string;
  search?: string;
  tags?: string[];
}

export interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  recent: number;
}

// CSV parsing utility
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.toLowerCase()] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Validate lead data
export function validateLead(data: Partial<Lead>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format lead for export
export function formatLeadForExport(lead: Lead): Record<string, string> {
  return {
    'First Name': lead.firstName,
    'Last Name': lead.lastName,
    'Email': lead.email,
    'Company': lead.company || '',
    'Title': lead.title || '',
    'Phone': lead.phone || '',
    'Website': lead.website || '',
    'Industry': lead.industry || '',
    'Status': lead.status,
    'Source': lead.source || '',
    'Notes': lead.notes || '',
    'Tags': lead.tags?.join(', ') || '',
    'Created': new Date(lead.createdAt).toLocaleDateString(),
  };
}

// Export leads to CSV
export function exportLeadsToCSV(leads: Lead[]): string {
  if (leads.length === 0) return '';

  const headers = Object.keys(formatLeadForExport(leads[0]));
  const csvLines = [headers.join(',')];

  leads.forEach(lead => {
    const row = formatLeadForExport(lead);
    const values = headers.map(header => `"${row[header] || ''}"`);
    csvLines.push(values.join(','));
  });

  return csvLines.join('\n');
}
