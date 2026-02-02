// Instantly.ai Service - Email Sending and Campaign Management
// Used by LeadSite.AI for automated email outreach
// UPDATED: V2 API with Bearer token authentication

const axios = require('axios');

const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;
const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v2';

class InstantlyService {
  constructor() {
    this.client = axios.create({
      baseURL: INSTANTLY_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`
      },
      timeout: 30000
    });
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (!INSTANTLY_API_KEY) {
      return { success: false, error: 'Instantly API key not configured' };
    }

    try {
      const response = await this.client.get('/campaigns', { params: { limit: 1 } });
      return { success: true, apiVersion: 'v2' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  /**
   * Get all campaigns (V2 API)
   */
  async getCampaigns(options = {}) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, campaigns: [], _mock: true };
    }

    try {
      const { limit = 100, skip = 0, status } = options;
      const params = { limit, skip };
      if (status) params.status = status;

      const response = await this.client.get('/campaigns', { params });
      const campaigns = response.data?.items || response.data || [];

      return {
        success: true,
        campaigns: campaigns.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          createdAt: c.timestamp_created,
          emailsSent: c.emails_sent || 0,
          leadsCount: c.leads_count || 0
        })),
        total: response.data?.total || campaigns.length,
        apiVersion: 'v2'
      };
    } catch (error) {
      console.error('Instantly get campaigns error:', error.response?.data || error.message);
      return { success: false, error: error.message, campaigns: [] };
    }
  }

  /**
   * Get campaign details (V2 API)
   */
  async getCampaign(campaignId) {
    if (!INSTANTLY_API_KEY) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await this.client.get(`/campaigns/${campaignId}`);
      return { success: true, campaign: response.data };
    } catch (error) {
      console.error('Instantly get campaign error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get campaign analytics (V2 API)
   */
  async getCampaignAnalytics(campaignId) {
    if (!INSTANTLY_API_KEY) {
      return this.getMockAnalytics(campaignId);
    }

    try {
      const response = await this.client.get(`/campaigns/${campaignId}/analytics`);
      return {
        success: true,
        analytics: response.data || {},
        apiVersion: 'v2'
      };
    } catch (error) {
      console.error('Instantly analytics error:', error.response?.data || error.message);
      return this.getMockAnalytics(campaignId);
    }
  }

  /**
   * Add a lead to a campaign (V2 API)
   */
  async addLeadToCampaign(campaignId, lead) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, _mock: true };
    }

    try {
      const response = await this.client.post('/leads', {
        campaign_id: campaignId,
        leads: [{
          email: lead.email,
          first_name: lead.firstName,
          last_name: lead.lastName,
          company_name: lead.company,
          personalization: lead.personalization || '',
          phone: lead.phone || '',
          website: lead.website || '',
          custom_variables: {
            title: lead.title || '',
            industry: lead.industry || '',
            linkedin: lead.linkedinUrl || ''
          }
        }],
        skip_if_in_workspace: true,
        skip_if_in_campaign: true
      });

      return {
        success: true,
        data: response.data,
        apiVersion: 'v2'
      };
    } catch (error) {
      console.error('Instantly add lead error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add multiple leads to a campaign (V2 API)
   */
  async addLeadsBatch(campaignId, leads, options = {}) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, added: leads.length, _mock: true };
    }

    try {
      const { skipDuplicates = true } = options;

      const formattedLeads = leads.map(lead => ({
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company_name: lead.company,
        personalization: lead.personalization || '',
        phone: lead.phone || '',
        website: lead.website || '',
        custom_variables: {
          title: lead.title || '',
          industry: lead.industry || ''
        }
      }));

      const response = await this.client.post('/leads', {
        campaign_id: campaignId,
        leads: formattedLeads,
        skip_if_in_workspace: skipDuplicates,
        skip_if_in_campaign: skipDuplicates
      });

      return {
        success: true,
        added: response.data?.uploaded || leads.length,
        skipped: response.data?.skipped || 0,
        data: response.data,
        apiVersion: 'v2'
      };
    } catch (error) {
      console.error('Instantly bulk add error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Launch campaign (V2 API)
   */
  async launchCampaign(campaignId) {
    if (!INSTANTLY_API_KEY) {
      return { success: true, _mock: true };
    }

    try {
      const response = await this.client.post(`/campaigns/${campaignId}/launch`);
      return { success: true, data: response.data, apiVersion: 'v2' };
    } catch (error) {
      console.error('Instantly launch error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pause campaign (V2 API)
   */
  async pauseCampaign(campaignId) {
    if (!INSTANTLY_API_KEY) {
      return { success: true, _mock: true };
    }

    try {
      const response = await this.client.post(`/campaigns/${campaignId}/pause`);
      return { success: true, data: response.data, apiVersion: 'v2' };
    } catch (error) {
      console.error('Instantly pause error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get warmup status for email accounts (V2 API)
   */
  async getWarmupStatus(email = null) {
    if (!INSTANTLY_API_KEY) {
      return this.getMockWarmupStatus(email);
    }

    try {
      const params = email ? { email } : {};
      const response = await this.client.get('/accounts/warmup', { params });

      return {
        success: true,
        accounts: response.data?.items || response.data || [],
        apiVersion: 'v2'
      };
    } catch (error) {
      console.error('Instantly warmup status error:', error.response?.data || error.message);
      return this.getMockWarmupStatus(email);
    }
  }

  /**
   * Enable warmup for an email account (V2 API)
   */
  async enableWarmup(email) {
    if (!INSTANTLY_API_KEY) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await this.client.post('/accounts/warmup/enable', { email });
      return { success: true, result: response.data, apiVersion: 'v2' };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  /**
   * Health check for Instantly API
   */
  async healthCheck() {
    const result = await this.testConnection();
    return {
      healthy: result.success,
      reason: result.error,
      apiVersion: result.apiVersion || 'v2'
    };
  }

  // Mock data for development/demo mode
  getMockAnalytics(campaignId) {
    return {
      success: true,
      analytics: {
        campaign_id: campaignId,
        total_sent: Math.floor(Math.random() * 500) + 100,
        total_delivered: Math.floor(Math.random() * 450) + 90,
        total_opened: Math.floor(Math.random() * 200) + 50,
        total_clicked: Math.floor(Math.random() * 50) + 10,
        total_replied: Math.floor(Math.random() * 30) + 5,
        total_bounced: Math.floor(Math.random() * 10),
        total_unsubscribed: Math.floor(Math.random() * 5),
        open_rate: (Math.random() * 30 + 20).toFixed(2),
        click_rate: (Math.random() * 10 + 2).toFixed(2),
        reply_rate: (Math.random() * 8 + 1).toFixed(2),
        bounce_rate: (Math.random() * 3).toFixed(2)
      },
      _mock: true
    };
  }

  getMockWarmupStatus(email) {
    const statuses = ['warming', 'warmed', 'paused', 'not_started'];
    return {
      success: true,
      warmup: {
        email: email,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        warmup_reputation: Math.floor(Math.random() * 40) + 60,
        daily_limit: Math.floor(Math.random() * 30) + 20,
        emails_sent_today: Math.floor(Math.random() * 20),
        days_running: Math.floor(Math.random() * 30) + 1
      },
      _mock: true
    };
  }
}

module.exports = new InstantlyService();
