// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — PERFORMANCE REPORT
// Synthesizes weekly metrics: costs, task runs, campaign stats.
// Runs weekly on Monday at 8 AM UTC (after strategy refresh).
// ═══════════════════════════════════════════════════════════════

const chatgpt = require('../../../marketStrategy/providers/chatgpt');
const { trackCost, getCosts, formatDate } = require('../../../marketStrategy/costTracker');
const instantly = require('../../../instantly');
const { SCHED_KEYS, SCHED_EVENTS } = require('../constants');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'performance-report', progress: 10, message: 'Gathering metrics...' });

  // 1. Get cost data for the past 7 days
  const endDate = formatDate(new Date());
  const startDate = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const costData = await getCosts(redis, startDate, endDate);

  // 2. Get campaign stats from Instantly (if available)
  let campaignStats = null;
  try {
    const campaigns = await instantly.getCampaigns({ limit: 10 });
    if (campaigns.success && campaigns.campaigns.length > 0) {
      let totalSent = 0;
      let totalLeads = 0;
      for (const camp of campaigns.campaigns) {
        totalSent += camp.emailsSent || 0;
        totalLeads += camp.leadsCount || 0;
      }
      campaignStats = {
        activeCampaigns: campaigns.campaigns.length,
        totalEmailsSent: totalSent,
        totalLeads: totalLeads,
      };
    }
  } catch {
    // Instantly stats optional
  }

  // 3. Count scheduler task runs this week
  const taskRunKeys = [];
  const current = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  while (current <= end) {
    const dateStr = formatDate(current);
    taskRunKeys.push(`sched:run:${profile.userId}:*:${dateStr}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }
  // Note: We can't use Redis KEYS with wildcards for exact counts easily,
  // so we'll estimate from cost data presence (tasks that ran cost money)

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'performance-report', progress: 50, message: 'Synthesizing report...' });

  // 4. Synthesize report via ChatGPT
  const reportContext = {
    period: `${startDate} to ${endDate}`,
    costs: costData.totals,
    dailyCosts: costData.days,
    campaigns: campaignStats,
    business: {
      name: profile.businessName,
      industry: profile.industry,
      targetMarket: profile.targetMarket,
    },
  };

  const result = await chatgpt.chat({
    systemPrompt: `You are a marketing analytics AI. Generate a concise weekly performance report.
Include: summary, key metrics, wins, areas for improvement, and next week priorities.
Return as structured JSON with fields: summary, metrics, wins, recommendations, nextWeekPriorities.`,
    userPrompt: `Generate a weekly performance report for this data:
${JSON.stringify(reportContext, null, 2)}`,
    model: 'gpt-4o-mini',
    maxTokens: 1200,
    temperature: 0.3,
  }, redis);

  await trackCost(redis, 'chatgpt', result.costUsd);

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'performance-report', progress: 100, message: 'Report complete' });

  // Parse report
  let report;
  try {
    const content = (result.content || '').trim();
    const jsonStr = content.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
    report = JSON.parse(jsonStr);
  } catch {
    report = {
      summary: result.content || 'Report generation complete',
      metrics: costData.totals,
      wins: [],
      recommendations: [],
      nextWeekPriorities: [],
    };
  }

  report.period = `${startDate} to ${endDate}`;
  report.campaigns = campaignStats;

  const output = {
    report,
    feedMessage: `Weekly report ready — AI costs: $${(costData.totals.total || 0).toFixed(2)}${campaignStats ? `, ${campaignStats.totalEmailsSent} emails sent` : ''}`,
  };

  return { status: 'completed', output, costUsd: result.costUsd || 0 };
}

module.exports = { execute };
