// NEXUS Function #6 (verified + wired): Campaign Analytics
// Wraps Instantly.ai campaign analytics with proper error handling
const instantlyService = require('../../services/instantly');

/**
 * Get analytics for a specific campaign
 */
async function getCampaignAnalytics(campaignId) {
  try {
    if (!campaignId) {
      return { success: false, error: 'campaignId is required' };
    }

    const result = await instantlyService.getCampaignAnalytics(campaignId);
    return result;
  } catch (error) {
    return { success: false, error: `Campaign analytics error: ${error.message}` };
  }
}

/**
 * Get analytics summary across all campaigns (or a subset)
 */
async function getCampaignAnalyticsSummary(campaignIds) {
  try {
    // If no specific IDs, fetch all campaigns first
    let ids = campaignIds;
    if (!ids || ids.length === 0) {
      const campaignsResult = await instantlyService.getCampaigns({ limit: 100 });
      if (!campaignsResult.success) {
        return {
          success: true,
          totalSent: 0,
          totalOpened: 0,
          openRate: 0,
          totalReplied: 0,
          replyRate: 0,
          bounceRate: 0,
          campaignCount: 0
        };
      }
      ids = campaignsResult.campaigns.map(c => c.id);
    }

    if (ids.length === 0) {
      return {
        success: true,
        totalSent: 0,
        totalOpened: 0,
        openRate: 0,
        totalReplied: 0,
        replyRate: 0,
        bounceRate: 0,
        campaignCount: 0
      };
    }

    // Fetch analytics for each campaign in parallel
    const analyticsPromises = ids.map(id => getCampaignAnalytics(id));
    const results = await Promise.all(analyticsPromises);

    let totalSent = 0;
    let totalOpened = 0;
    let totalReplied = 0;
    let totalBounced = 0;

    for (const result of results) {
      if (result.success && result.analytics) {
        const a = result.analytics;
        totalSent += a.total_sent || 0;
        totalOpened += a.total_opened || 0;
        totalReplied += a.total_replied || 0;
        totalBounced += a.total_bounced || 0;
      }
    }

    return {
      success: true,
      totalSent,
      totalOpened,
      openRate: totalSent > 0 ? parseFloat(((totalOpened / totalSent) * 100).toFixed(2)) : 0,
      totalReplied,
      replyRate: totalSent > 0 ? parseFloat(((totalReplied / totalSent) * 100).toFixed(2)) : 0,
      bounceRate: totalSent > 0 ? parseFloat(((totalBounced / totalSent) * 100).toFixed(2)) : 0,
      campaignCount: ids.length
    };
  } catch (error) {
    return { success: false, error: `Analytics summary error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches campaign analytics actions
 */
async function campaignAnalyticsHandler(params) {
  const { action, campaignId, campaignIds } = params || {};

  switch (action) {
    case 'get_campaign':
      return await getCampaignAnalytics(campaignId);
    case 'get_summary':
    default:
      return await getCampaignAnalyticsSummary(campaignIds);
  }
}

module.exports = {
  getCampaignAnalytics,
  getCampaignAnalyticsSummary,
  campaignAnalyticsHandler
};
