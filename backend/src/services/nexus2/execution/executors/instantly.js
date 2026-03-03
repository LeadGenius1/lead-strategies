// ═══════════════════════════════════════════════════════════════
// EXECUTOR — INSTANTLY (Email Campaigns)
// Fully functional: create campaign → add leads → launch.
// ═══════════════════════════════════════════════════════════════

const instantlyService = require('../../../instantly');

/**
 * Create an email campaign, add leads, and optionally launch it.
 *
 * @param {object} payload
 * @param {string} payload.name - Campaign name
 * @param {string} payload.subject - Email subject line
 * @param {string} payload.body - Email body content
 * @param {Array}  payload.leads - Leads to add [{ email, firstName, lastName, company }]
 * @param {boolean} [payload.autoLaunch=false] - Launch immediately after adding leads
 * @returns {Promise<object>}
 */
async function executeEmailCampaign(payload) {
  const { name, subject, body, leads = [], autoLaunch = false } = payload;

  // 1. Create campaign
  const createResult = await instantlyService.createCampaign({ name, subject, body });
  if (!createResult.success) {
    return { status: 'failed', error: `Failed to create campaign: ${createResult.error}` };
  }

  const campaignId = createResult.campaignId;
  const result = { status: 'completed', campaignId, _mock: createResult._mock || false };

  // 2. Add leads (if any)
  if (leads.length > 0) {
    const addResult = await instantlyService.addLeadsBatch(campaignId, leads);
    result.leadsAdded = addResult.added || 0;
    result.leadsSkipped = addResult.skipped || 0;
    if (!addResult.success) {
      result.leadsError = addResult.error;
    }
  }

  // 3. Launch (if requested)
  if (autoLaunch && !createResult._mock) {
    const launchResult = await instantlyService.launchCampaign(campaignId);
    result.launched = launchResult.success;
    if (!launchResult.success) {
      result.launchError = launchResult.error;
    }
  }

  return result;
}

/**
 * Add leads to an existing campaign.
 *
 * @param {object} payload
 * @param {string} payload.campaignId - Existing campaign ID
 * @param {Array}  payload.leads - Leads to add
 * @returns {Promise<object>}
 */
async function addLeadsToCampaign(payload) {
  const { campaignId, leads = [] } = payload;

  if (!campaignId) {
    return { status: 'failed', error: 'campaignId is required' };
  }

  if (leads.length === 0) {
    return { status: 'completed', leadsAdded: 0, message: 'No leads to add' };
  }

  const addResult = await instantlyService.addLeadsBatch(campaignId, leads);
  if (!addResult.success) {
    return { status: 'failed', error: addResult.error };
  }

  return {
    status: 'completed',
    campaignId,
    leadsAdded: addResult.added || leads.length,
    leadsSkipped: addResult.skipped || 0,
    _mock: addResult._mock || false,
  };
}

module.exports = { executeEmailCampaign, addLeadsToCampaign };
