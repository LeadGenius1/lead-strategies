// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — PROSPECT FINDER
// Discovers prospects matching ICP using Perplexity + ChatGPT.
// Runs daily at 10 AM UTC.
// ═══════════════════════════════════════════════════════════════

const perplexity = require('../../../marketStrategy/providers/perplexity');
const chatgpt = require('../../../marketStrategy/providers/chatgpt');
const { trackCost } = require('../../../marketStrategy/costTracker');
const { SCHED_EVENTS } = require('../constants');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  const { icp, targetMarket, industry, businessName, offer } = profile;

  if (!icp || !targetMarket) {
    return { status: 'skipped', output: { reason: 'ICP or target market not defined' }, costUsd: 0 };
  }

  let totalCost = 0;

  // Step 1: Research prospects via Perplexity
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'prospect-finder', progress: 20, message: 'Searching for prospects...' });

  const query = `Find businesses or decision-makers matching this ideal customer profile in ${targetMarket}:
ICP: ${icp}
Industry: ${industry}
Look for specific companies, their websites, and key contacts.
Focus on businesses that might need: ${offer}
List at least 5-10 prospects with company name, website, and why they're a match.`;

  const researchResult = await perplexity.research(query, redis, {
    maxTokens: 1500,
    systemPrompt: 'You are a B2B lead researcher. Find real, specific companies and contacts. Include website URLs when possible.',
  });

  totalCost += researchResult.costUsd || 0;
  await trackCost(redis, 'perplexity', researchResult.costUsd);

  // Step 2: Qualify and score prospects via ChatGPT
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'prospect-finder', progress: 60, message: 'Qualifying prospects...' });

  const qualifyResult = await chatgpt.chat({
    systemPrompt: `You are a sales intelligence analyst for ${businessName}.
Score and qualify the prospects below. For each prospect, provide:
- name: company name
- website: URL if found
- matchScore: 1-100 based on ICP fit
- reasoning: why they're a good match (1 sentence)
- suggestedApproach: how to reach out (1 sentence)

Return ONLY a JSON array. No markdown, no explanation.`,
    userPrompt: `ICP: ${icp}
Target Market: ${targetMarket}
Our Offer: ${offer}

Research findings:
${researchResult.answer}

Return a JSON array of qualified prospects.`,
    model: 'gpt-4o-mini',
    maxTokens: 1500,
    temperature: 0.3,
  }, redis);

  totalCost += qualifyResult.costUsd || 0;
  await trackCost(redis, 'chatgpt', qualifyResult.costUsd);

  // Parse prospects from ChatGPT response
  let prospects = [];
  try {
    const content = (qualifyResult.content || '').trim();
    // Handle potential markdown wrapping
    const jsonStr = content.replace(/^```json?\s*/i, '').replace(/\s*```$/, '');
    prospects = JSON.parse(jsonStr);
    if (!Array.isArray(prospects)) prospects = [];
  } catch {
    // If parsing fails, create a single summary prospect
    prospects = [{
      name: 'Research Summary',
      website: null,
      matchScore: 50,
      reasoning: 'See raw research for details',
      suggestedApproach: 'Review and manually extract leads',
    }];
  }

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'prospect-finder', progress: 100, message: 'Prospect search complete' });

  const highQuality = prospects.filter(p => (p.matchScore || 0) >= 70).length;

  const output = {
    prospects,
    totalFound: prospects.length,
    highQuality,
    sources: researchResult.citations || [],
    feedMessage: `Found ${prospects.length} prospects — ${highQuality} high-quality matches for your ICP`,
  };

  return { status: 'completed', output, costUsd: totalCost };
}

module.exports = { execute };
