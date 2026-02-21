// ClientContact.IO 7 AI Agents System
// Sales automation agents for CRM operations

const { PrismaClient } = require('@prisma/client');
const { prisma } = require('../config/database');

// Initialize Anthropic client if available
let anthropic = null;
if (process.env.ANTHROPIC_API_KEY) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  } catch (error) {
    console.warn('Failed to initialize Anthropic client:', error.message);
  }
}

/**
 * Campaign AI - Optimizes email campaigns and sequences
 */
class CampaignAI {
  async optimizeCampaign(campaignId, userId) {
    if (!anthropic) return null;

    try {
      const campaign = await prisma.campaign.findFirst({
        where: { id: campaignId, userId }
      });

      if (!campaign) return null;

      const prompt = `Analyze this email campaign and suggest optimizations:
Campaign: ${campaign.name}
Subject: ${campaign.subject}
Content: ${campaign.content?.substring(0, 500)}

Suggest improvements for open rates, click rates, and conversions.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        suggestions: response.content[0].text,
        optimized: true
      };
    } catch (error) {
      console.error('Campaign AI error:', error);
      return null;
    }
  }
}

/**
 * Social Syncs AI - Syncs social media interactions with CRM
 */
class SocialSyncsAI {
  async syncSocialActivity(userId, platform, activity) {
    // In production, this would:
    // 1. Monitor social media APIs (LinkedIn, Twitter, etc.)
    // 2. Extract contact information
    // 3. Create/update contacts in CRM
    // 4. Log activities

    try {
      // Create activity from social interaction
      await prisma.activity.create({
        data: {
          userId,
          type: 'social',
          subject: `Social interaction on ${platform}`,
          description: activity.content,
          source: platform,
          customFields: {
            platform,
            activityId: activity.id,
            url: activity.url
          }
        }
      });

      return { synced: true };
    } catch (error) {
      console.error('Social Syncs AI error:', error);
      return { synced: false };
    }
  }
}

/**
 * Voice AI - Analyzes call recordings and transcripts
 */
class VoiceAI {
  async analyzeCall(callId, userId) {
    if (!anthropic) return null;

    try {
      const call = await prisma.call.findFirst({
        where: { id: callId, userId }
      });

      if (!call || !call.transcription) return null;

      const prompt = `Analyze this sales call transcript and provide insights:
Transcript: ${call.transcription}

Provide:
1. Key talking points
2. Sentiment analysis
3. Next steps suggested
4. Deal probability assessment`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      // Update call with AI insights
      await prisma.call.update({
        where: { id: callId },
        data: {
          aiAnalysis: response.content[0].text,
          analyzedAt: new Date()
        }
      });

      return {
        analysis: response.content[0].text,
        analyzed: true
      };
    } catch (error) {
      console.error('Voice AI error:', error);
      return null;
    }
  }
}

/**
 * LeadGen AI - Identifies and scores new leads
 */
class LeadGenAI {
  async scoreLead(leadId, userId) {
    if (!anthropic) return null;

    try {
      const lead = await prisma.lead.findFirst({
        where: { id: leadId, userId }
      });

      if (!lead) return null;

      const prompt = `Analyze this lead and provide a qualification score (0-100):
Name: ${lead.name}
Company: ${lead.company}
Title: ${lead.title}
Email: ${lead.email}
Notes: ${lead.notes || 'None'}

Provide score and reasoning.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        score: this.extractScore(response.content[0].text),
        reasoning: response.content[0].text
      };
    } catch (error) {
      console.error('LeadGen AI error:', error);
      return null;
    }
  }

  extractScore(text) {
    const match = text.match(/\b(\d{1,3})\b/);
    return match ? parseInt(match[1]) : 50;
  }
}

/**
 * Analytics AI - Provides insights from CRM data
 */
class AnalyticsAI {
  async generateInsights(userId, timeframe = '30d') {
    if (!anthropic) return null;

    try {
      const deals = await prisma.deal.findMany({
        where: { userId },
        include: { company: true, contacts: true }
      });

      const prompt = `Analyze this sales data and provide insights:
Total Deals: ${deals.length}
Won: ${deals.filter(d => d.stage === 'closed_won').length}
Lost: ${deals.filter(d => d.stage === 'closed_lost').length}

Provide:
1. Win rate trends
2. Common loss reasons
3. Recommendations for improvement`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      return {
        insights: response.content[0].text,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Analytics AI error:', error);
      return null;
    }
  }
}

/**
 * Integration AI - Manages third-party integrations
 */
class IntegrationAI {
  async syncIntegration(userId, integrationType, data) {
    // In production, this would sync with:
    // - Salesforce
    // - HubSpot
    // - Pipedrive
    // - Zoho
    // - etc.

    try {
      // Log integration sync
      await prisma.activity.create({
        data: {
          userId,
          type: 'integration',
          subject: `Synced with ${integrationType}`,
          description: `Synced ${data.count || 0} records`,
          customFields: {
            integration: integrationType,
            syncData: data
          }
        }
      });

      return { synced: true };
    } catch (error) {
      console.error('Integration AI error:', error);
      return { synced: false };
    }
  }
}

/**
 * CleanOS AI - Data cleaning and deduplication
 */
class CleanOSAI {
  async cleanData(userId, dataType) {
    try {
      let cleaned = 0;

      if (dataType === 'contacts' || !dataType) {
        // Find duplicate contacts
        const contacts = await prisma.contact.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' }
        });

        const emailMap = new Map();
        const duplicates = [];

        for (const contact of contacts) {
          if (contact.email) {
            const email = contact.email.toLowerCase();
            if (emailMap.has(email)) {
              duplicates.push(contact.id);
            } else {
              emailMap.set(email, contact.id);
            }
          }
        }

        // Delete duplicates (keep oldest)
        if (duplicates.length > 0) {
          await prisma.contact.deleteMany({
            where: { id: { in: duplicates } }
          });
          cleaned += duplicates.length;
        }
      }

      return {
        cleaned,
        dataType,
        cleanedAt: new Date()
      };
    } catch (error) {
      console.error('CleanOS AI error:', error);
      return { cleaned: 0 };
    }
  }
}

// Export agent instances
module.exports = {
  CampaignAI: new CampaignAI(),
  SocialSyncsAI: new SocialSyncsAI(),
  VoiceAI: new VoiceAI(),
  LeadGenAI: new LeadGenAI(),
  AnalyticsAI: new AnalyticsAI(),
  IntegrationAI: new IntegrationAI(),
  CleanOSAI: new CleanOSAI()
};
