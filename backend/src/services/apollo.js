// Apollo.io Service - Lead Search and Enrichment
// Used by LeadSite.AI for prospect discovery

const axios = require('axios');

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_BASE_URL = 'https://api.apollo.io/v1';

class ApolloService {
  constructor() {
    this.client = axios.create({
      baseURL: APOLLO_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      timeout: 30000
    });
  }

  /**
   * Search for people/contacts in Apollo database
   */
  async searchPeople(query, filters = {}) {
    if (!APOLLO_API_KEY) {
      console.warn('Apollo API key not configured');
      return this.getMockSearchResults(query, filters);
    }

    try {
      const response = await this.client.post('/mixed_people/search', {
        q_keywords: query,
        person_titles: filters.titles || [],
        person_locations: filters.locations || [],
        organization_industry_tag_ids: filters.industries || [],
        organization_num_employees_ranges: filters.employeeRanges || [],
        page: filters.page || 1,
        per_page: filters.perPage || 25
      });

      return {
        success: true,
        people: response.data.people || [],
        pagination: {
          page: response.data.pagination?.page || 1,
          perPage: response.data.pagination?.per_page || 25,
          totalEntries: response.data.pagination?.total_entries || 0,
          totalPages: response.data.pagination?.total_pages || 0
        }
      };
    } catch (error) {
      console.error('Apollo search error:', error.response?.data || error.message);
      return this.getMockSearchResults(query, filters);
    }
  }

  /**
   * Enrich a person's data by email
   */
  async enrichPerson(email) {
    if (!APOLLO_API_KEY) {
      console.warn('Apollo API key not configured');
      return this.getMockEnrichment(email);
    }

    try {
      const response = await this.client.post('/people/match', {
        email: email,
        reveal_personal_emails: true,
        reveal_phone_number: true
      });

      return {
        success: true,
        person: response.data.person || null
      };
    } catch (error) {
      console.error('Apollo enrichment error:', error.response?.data || error.message);
      return this.getMockEnrichment(email);
    }
  }

  /**
   * Search for companies/organizations
   */
  async searchCompanies(query, filters = {}) {
    if (!APOLLO_API_KEY) {
      console.warn('Apollo API key not configured');
      return { success: true, organizations: [] };
    }

    try {
      const response = await this.client.post('/mixed_companies/search', {
        q_organization_name: query,
        organization_locations: filters.locations || [],
        organization_industry_tag_ids: filters.industries || [],
        organization_num_employees_ranges: filters.employeeRanges || [],
        page: filters.page || 1,
        per_page: filters.perPage || 25
      });

      return {
        success: true,
        organizations: response.data.organizations || [],
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Apollo company search error:', error.response?.data || error.message);
      return { success: true, organizations: [] };
    }
  }

  /**
   * Get email sequences for outreach
   */
  async getSequences() {
    if (!APOLLO_API_KEY) {
      return { success: true, sequences: [] };
    }

    try {
      const response = await this.client.get('/emailer_campaigns');
      return {
        success: true,
        sequences: response.data.emailer_campaigns || []
      };
    } catch (error) {
      console.error('Apollo sequences error:', error.response?.data || error.message);
      return { success: true, sequences: [] };
    }
  }

  /**
   * Add contact to a sequence
   */
  async addToSequence(sequenceId, contactData) {
    if (!APOLLO_API_KEY) {
      return { success: false, error: 'Apollo API key not configured' };
    }

    try {
      const response = await this.client.post(`/emailer_campaigns/${sequenceId}/add_contact_ids`, {
        contact_ids: [contactData.apolloId],
        emailer_campaign_id: sequenceId
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Apollo add to sequence error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check for Apollo API
   */
  async healthCheck() {
    if (!APOLLO_API_KEY) {
      return { healthy: false, reason: 'API key not configured' };
    }

    try {
      await this.client.get('/users/me');
      return { healthy: true };
    } catch (error) {
      return { healthy: false, reason: error.message };
    }
  }

  // Mock data for development/demo mode
  getMockSearchResults(query, filters) {
    const sampleNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Amanda', 'Chris', 'Laura'];
    const sampleLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const sampleCompanies = ['TechCorp', 'InnovateLabs', 'Digital Solutions', 'Cloud Systems', 'Data Analytics Inc', 'Growth Marketing Co', 'SaaS Platform Inc'];
    const sampleTitles = ['CEO', 'CTO', 'VP of Sales', 'Marketing Director', 'Operations Manager', 'Head of Growth', 'Sales Manager'];
    const sampleIndustries = ['Technology', 'Marketing', 'Finance', 'Healthcare', 'E-commerce', 'SaaS'];

    const count = Math.min(filters.perPage || 25, 25);
    const people = [];

    for (let i = 0; i < count; i++) {
      const firstName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const lastName = sampleLastNames[Math.floor(Math.random() * sampleLastNames.length)];
      const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const industry = sampleIndustries[Math.floor(Math.random() * sampleIndustries.length)];

      people.push({
        id: `mock_${Date.now()}_${i}`,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        title: title,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
        linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
        phone_numbers: [],
        organization: {
          id: `org_${i}`,
          name: company,
          industry: industry,
          website_url: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
          linkedin_url: `https://linkedin.com/company/${company.toLowerCase().replace(/\s+/g, '')}`,
          estimated_num_employees: Math.floor(Math.random() * 500) + 10,
          founded_year: Math.floor(Math.random() * 20) + 2000
        },
        city: 'San Francisco',
        state: 'California',
        country: 'United States'
      });
    }

    return {
      success: true,
      people,
      pagination: {
        page: filters.page || 1,
        perPage: count,
        totalEntries: 100,
        totalPages: 4
      },
      _mock: true
    };
  }

  getMockEnrichment(email) {
    const [localPart, domain] = email.split('@');
    const nameParts = localPart.split('.');
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Unknown';
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';

    return {
      success: true,
      person: {
        id: `enriched_${Date.now()}`,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`.trim(),
        email: email,
        title: 'Professional',
        linkedin_url: `https://linkedin.com/in/${localPart.replace('.', '-')}`,
        organization: {
          name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
          website_url: `https://${domain}`
        }
      },
      _mock: true
    };
  }
}

module.exports = new ApolloService();
