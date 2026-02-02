// Instantly.ai Service - Email Sending and Campaign Management
// Used by LeadSite.AI for automated email outreach

const axios = require('axios');

const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;
const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v1';

class InstantlyService {
  constructor() {
    this.client = axios.create({
      baseURL: INSTANTLY_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add API key to all requests
    this.client.interceptors.request.use((config) => {
      config.params = config.params || {};
      config.params.api_key = INSTANTLY_API_KEY;
      return config;
    });
  }

  /**
   * Get all campaigns
   */
  async getCampaigns() {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, campaigns: [], _mock: true };
    }

    try {
      const response = await this.client.get('/campaign/list');
      return {
        success: true,
        campaigns: response.data || []
      };
    } catch (error) {
      console.error('Instantly get campaigns error:', error.response?.data || error.message);
      return { success: false, error: error.message, campaigns: [] };
    }
  }

  /**
   * Get campaign details and analytics
   */
  async getCampaignAnalytics(campaignId) {
    if (!INSTANTLY_API_KEY) {
      return this.getMockAnalytics(campaignId);
    }

    try {
      const response = await this.client.get('/analytics/campaign/summary', {
        params: { campaign_id: campaignId }
      });
      return {
        success: true,
        analytics: response.data || {}
      };
    } catch (error) {
      console.error('Instantly analytics error:', error.response?.data || error.message);
      return this.getMockAnalytics(campaignId);
    }
  }

  /**
   * Add a lead to a campaign
   */
  async addLeadToCampaign(campaignId, lead) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, _mock: true };
    }

    try {
      const response = await this.client.post('/lead/add', {
        campaign_id: campaignId,
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company_name: lead.company,
        personalization: lead.personalization || '',
        custom_variables: {
          title: lead.title || '',
          industry: lead.industry || '',
          website: lead.website || '',
          linkedin: lead.linkedinUrl || ''
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Instantly add lead error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add multiple leads to a campaign
   */
  async addLeadsBatch(campaignId, leads) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return { success: true, added: leads.length, _mock: true };
    }

    try {
      const formattedLeads = leads.map(lead => ({
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company_name: lead.company,
        personalization: lead.personalization || '',
        custom_variables: {
          title: lead.title || '',
          industry: lead.industry || ''
        }
      }));

      const response = await this.client.post('/lead/add/bulk', {
        campaign_id: campaignId,
        leads: formattedLeads
      });

      return {
        success: true,
        added: response.data?.added_leads || leads.length,
        data: response.data
      };
    } catch (error) {
      console.error('Instantly bulk add error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData) {
    if (!INSTANTLY_API_KEY) {
      console.warn('Instantly API key not configured');
      return {
        success: true,
        campaign: { id: `mock_${Date.now()}`, name: campaignData.name },
        _mock: true
      };
    }

    try {
      const response = await this.client.post('/campaign/create', {
        name: campaignData.name,
        from_email: campaignData.fromEmail,
        from_name: campaignData.fromName,
        subject: campaignData.subject,
        body: campaignData.body,
        daily_limit: campaignData.dailyLimit || 50,
        stop_on_reply: campaignData.stopOnReply !== false,
        stop_on_auto_reply: campaignData.stopOnAutoReply !== false
      });

      return {
        success: true,
        campaign: response.data
      };
    } catch (error) {
      console.error('Instantly create campaign error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update campaign status (start/pause)
   */
  async updateCampaignStatus(campaignId, status) {
    if (!INSTANTLY_API_KEY) {
      return { success: true, _mock: true };
    }

    try {
      const endpoint = status === 'active' ? '/campaign/activate' : '/campaign/pause';
      const response = await this.client.post(endpoint, {
        campaign_id: campaignId
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Instantly update status error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get warmup status for email accounts
   */
  async getWarmupStatus(email) {
    if (!INSTANTLY_API_KEY) {
      return this.getMockWarmupStatus(email);
    }

    try {
      const response = await this.client.get('/account/warmup/status', {
        params: { email }
      });

      return {
        success: true,
        warmup: response.data
      };
    } catch (error) {
      console.error('Instantly warmup status error:', error.response?.data || error.message);
      return this.getMockWarmupStatus(email);
    }
  }

  /**
   * Health check for Instantly API
   */
  async healthCheck() {
    if (!INSTANTLY_API_KEY) {
      return { healthy: false, reason: 'API key not configured' };
    }

    try {
      await this.client.get('/campaign/list');
      return { healthy: true };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
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
