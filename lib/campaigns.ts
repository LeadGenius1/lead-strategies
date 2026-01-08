// Email campaign types and utilities

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  leadIds?: string[];
  tags?: string[];
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface CampaignAnalytics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

// Default email templates
export const DEFAULT_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'intro',
    name: 'Introduction Email',
    subject: 'Quick introduction from {{company}}',
    body: `Hi {{firstName}},

I hope this email finds you well. I'm reaching out from {{company}} to introduce ourselves.

We specialize in {{industry}} solutions and thought you might be interested in learning more.

Would you be open to a brief conversation this week?

Best regards,
{{senderName}}`,
    variables: ['firstName', 'company', 'industry', 'senderName'],
  },
  {
    id: 'follow-up',
    name: 'Follow-up Email',
    subject: 'Following up on our conversation',
    body: `Hi {{firstName}},

I wanted to follow up on our previous conversation about {{topic}}.

I've attached some information that might be helpful. Let me know if you have any questions.

Best regards,
{{senderName}}`,
    variables: ['firstName', 'topic', 'senderName'],
  },
  {
    id: 'value-proposition',
    name: 'Value Proposition',
    subject: 'How {{company}} can help {{leadCompany}}',
    body: `Hi {{firstName}},

I noticed that {{leadCompany}} is in the {{industry}} space. We've helped similar companies achieve {{benefit}}.

Here's how we can help:
- {{benefit1}}
- {{benefit2}}
- {{benefit3}}

Would you like to schedule a quick call to discuss?

Best regards,
{{senderName}}`,
    variables: ['firstName', 'leadCompany', 'industry', 'benefit', 'benefit1', 'benefit2', 'benefit3', 'senderName'],
  },
];

// Replace template variables
export function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
}

// Validate campaign
export function validateCampaign(campaign: Partial<EmailCampaign>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push('Campaign name is required');
  }

  if (!campaign.subject || campaign.subject.trim().length === 0) {
    errors.push('Email subject is required');
  }

  if (!campaign.template || campaign.template.trim().length === 0) {
    errors.push('Email template is required');
  }

  if (!campaign.leadIds || campaign.leadIds.length === 0) {
    errors.push('At least one recipient is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
