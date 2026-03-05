// NEXUS Function #12: Lead Hunter — Apollo.io Integration
// Searches Apollo.io for leads matching ICP and saves to database
const apolloService = require('../../services/apollo');
const { prisma } = require('../../config/database');
const { validateEmail } = require('./compliance-guardian');

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;

/**
 * Search Apollo.io for leads matching ICP criteria
 */
async function searchApolloLeads({ jobTitles, industries, employeeRange, locations, limit }) {
  try {
    if (!APOLLO_API_KEY) {
      return { success: false, error: 'APOLLO_API_KEY not configured. Add it to Railway Variables.' };
    }

    const safeLimit = Math.min(limit || 25, 100);

    const result = await apolloService.searchPeople('', {
      titles: jobTitles || [],
      locations: locations || [],
      industries: industries || [],
      employeeRanges: employeeRange ? [`${employeeRange[0]},${employeeRange[1]}`] : [],
      perPage: safeLimit
    });

    if (!result.success) {
      return { success: false, error: 'Apollo search failed', details: result };
    }

    const leads = (result.people || []).map(p => ({
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      company: p.organization?.name || '',
      title: p.title || '',
      linkedinUrl: p.linkedin_url || '',
      apolloId: p.id,
      phone: p.phone_numbers?.[0]?.sanitized_number || '',
      location: [p.city, p.state, p.country].filter(Boolean).join(', ')
    }));

    return {
      success: true,
      leads,
      total: leads.length,
      pagination: result.pagination,
      _mock: result._mock || false
    };
  } catch (error) {
    return { success: false, error: `Apollo search error: ${error.message}` };
  }
}

/**
 * Enrich a lead by email via Apollo.io
 */
async function enrichLeadFromApollo(email) {
  try {
    if (!APOLLO_API_KEY) {
      return { success: false, error: 'APOLLO_API_KEY not configured' };
    }

    if (!email) {
      return { success: false, error: 'email is required' };
    }

    const result = await apolloService.enrichPerson(email);

    if (!result.success || !result.person) {
      return { success: false, error: 'Enrichment returned no data' };
    }

    const p = result.person;
    return {
      success: true,
      lead: {
        email: p.email || email,
        firstName: p.first_name,
        lastName: p.last_name,
        company: p.organization?.name || '',
        title: p.title || '',
        linkedinUrl: p.linkedin_url || '',
        apolloId: p.id,
        phone: p.phone_numbers?.[0]?.sanitized_number || ''
      },
      _mock: result._mock || false
    };
  } catch (error) {
    return { success: false, error: `Enrichment error: ${error.message}` };
  }
}

/**
 * Save (upsert) a lead to the database
 */
async function saveLead(lead, userId) {
  try {
    if (!lead.email || !userId) {
      return { success: false, error: 'lead.email and userId are required' };
    }

    const saved = await prisma.lead.upsert({
      where: {
        userId_email: { userId, email: lead.email }
      },
      update: {
        name: [lead.firstName, lead.lastName].filter(Boolean).join(' ') || undefined,
        company: lead.company || undefined,
        title: lead.title || undefined,
        linkedinUrl: lead.linkedinUrl || undefined,
        phone: lead.phone || undefined,
        source: 'apollo',
        customFields: {
          apolloId: lead.apolloId || null,
          enrichedAt: new Date().toISOString()
        }
      },
      create: {
        userId,
        email: lead.email,
        name: [lead.firstName, lead.lastName].filter(Boolean).join(' ') || null,
        company: lead.company || null,
        title: lead.title || null,
        linkedinUrl: lead.linkedinUrl || null,
        phone: lead.phone || null,
        source: 'apollo',
        status: 'new',
        customFields: {
          apolloId: lead.apolloId || null,
          enrichedAt: new Date().toISOString()
        }
      }
    });

    return { success: true, leadId: saved.id, email: saved.email };
  } catch (error) {
    return { success: false, error: `Save lead error: ${error.message}` };
  }
}

/**
 * Full pipeline: search → compliance check → save
 */
async function runLeadHunterJob({ jobTitles, industries, employeeRange, locations, limit, userId }) {
  try {
    if (!userId) {
      return { success: false, error: 'userId is required for lead hunter job' };
    }

    // Step 1: Search Apollo
    const searchResult = await searchApolloLeads({ jobTitles, industries, employeeRange, locations, limit });
    if (!searchResult.success) {
      return searchResult;
    }

    // Step 2: Compliance check + save valid leads
    let saved = 0;
    let skipped = 0;
    const errors = [];

    for (const lead of searchResult.leads) {
      // Validate email
      const validation = await validateEmail(lead.email);
      if (!validation.valid) {
        skipped++;
        continue;
      }

      // Save to database
      const saveResult = await saveLead(lead, userId);
      if (saveResult.success) {
        saved++;
      } else {
        errors.push({ email: lead.email, error: saveResult.error });
      }
    }

    return {
      success: true,
      searched: searchResult.total,
      saved,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      _mock: searchResult._mock || false
    };
  } catch (error) {
    return { success: false, error: `Lead hunter job error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches hunt_leads actions
 */
async function huntLeads(params) {
  const { action, jobTitles, industries, employeeRange, locations, limit, email, userId } = params || {};

  switch (action) {
    case 'search':
      return await searchApolloLeads({ jobTitles, industries, employeeRange, locations, limit });
    case 'enrich':
      return await enrichLeadFromApollo(email);
    case 'run_job':
      return await runLeadHunterJob({ jobTitles, industries, employeeRange, locations, limit, userId });
    default:
      // Default to search
      return await searchApolloLeads({ jobTitles, industries, employeeRange, locations, limit });
  }
}

module.exports = {
  searchApolloLeads,
  enrichLeadFromApollo,
  saveLead,
  runLeadHunterJob,
  huntLeads
};
