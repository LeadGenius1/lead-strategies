// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — MARKET INTEL REFRESH
// Refreshes market trends, news, and competitive landscape.
// Updates BusinessProfile.marketIntel with fresh data.
// Runs weekly on Thursday at 6 AM UTC.
// ═══════════════════════════════════════════════════════════════

const perplexity = require('../../../marketStrategy/providers/perplexity');
const { trackCost } = require('../../../marketStrategy/costTracker');
const { SCHED_EVENTS } = require('../constants');
const { prisma } = require('../../../../config/database');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  const { industry, targetMarket, icp, businessName } = profile;

  if (!industry || !targetMarket) {
    return { status: 'skipped', output: { reason: 'Industry or target market not defined' }, costUsd: 0 };
  }

  let totalCost = 0;

  // Step 1: Research market trends
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'market-intel-refresh', progress: 20, message: 'Researching market trends...' });

  const trendQuery = `What are the latest trends, news, and shifts in the ${industry} industry for ${targetMarket} in 2026? Focus on:
1. New market trends and consumer behavior changes
2. Industry news from the past 2 weeks
3. Emerging opportunities or threats
4. Technology or regulatory changes affecting the market`;

  const trendResult = await perplexity.research(trendQuery, redis, {
    maxTokens: 1200,
    systemPrompt: `You are a market intelligence analyst specializing in ${industry}. Provide specific, actionable insights with sources.`,
  });

  totalCost += trendResult.costUsd || 0;
  await trackCost(redis, 'perplexity', trendResult.costUsd);

  // Step 2: Research ICP-specific buying signals
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'market-intel-refresh', progress: 60, message: 'Analyzing buying signals...' });

  const signalQuery = `What are current buying signals and pain points for this customer profile: ${icp}?
Industry: ${industry}, Market: ${targetMarket}.
What triggers them to purchase services like those from ${businessName}?`;

  const signalResult = await perplexity.research(signalQuery, redis, {
    maxTokens: 800,
  });

  totalCost += signalResult.costUsd || 0;
  await trackCost(redis, 'perplexity', signalResult.costUsd);

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'market-intel-refresh', progress: 90, message: 'Updating profile...' });

  // Step 3: Update BusinessProfile.marketIntel
  const freshIntel = {
    trends: trendResult.answer,
    buyingSignals: signalResult.answer,
    sources: [...(trendResult.citations || []), ...(signalResult.citations || [])],
    refreshedAt: new Date().toISOString(),
  };

  await prisma.businessProfile.update({
    where: { userId: profile.userId },
    data: { marketIntel: freshIntel },
  });

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'market-intel-refresh', progress: 100, message: 'Market intel refreshed' });

  // Count notable findings
  const trendLines = (trendResult.answer || '').split('\n').filter(l => l.trim().length > 20);

  const output = {
    trends: trendResult.answer,
    buyingSignals: signalResult.answer,
    sources: freshIntel.sources,
    feedMessage: `Market intel refreshed — ${trendLines.length} trend insights for ${industry}`,
  };

  return { status: 'completed', output, costUsd: totalCost };
}

module.exports = { execute };
