// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — DISCOVERY AGENT
// Auto-enriches a BusinessProfile using existing AI providers.
// 5 sequential tasks: website scrape → social discovery → competitor scrape
//                     → market research → AI synthesis
// Each task updates the BusinessProfile in Postgres incrementally.
// If a task fails, it is skipped and the next task runs.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../config/database');
const firecrawl = require('../marketStrategy/providers/firecrawl');
const perplexity = require('../marketStrategy/providers/perplexity');
const chatgpt = require('../marketStrategy/providers/chatgpt');
const { trackCost } = require('../marketStrategy/costTracker');
const { publishEvent } = require('../marketStrategy/sseManager');

const LOG_PREFIX = '[Discovery]';

/**
 * Run the full discovery pipeline for a BusinessProfile.
 *
 * @param {string} profileId - BusinessProfile.id
 * @param {string} userId - User ID (for SSE channel)
 * @param {string[]} tasks - Which tasks to run (subset or all 5)
 * @param {import("redis").RedisClientType} redis - node-redis v4 client
 * @param {string} jobId - BullMQ job ID (used as SSE channel key)
 */
async function runDiscovery(profileId, userId, tasks, redis, jobId) {
  const profile = await prisma.businessProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new Error(`BusinessProfile ${profileId} not found`);
  }

  const results = { completed: [], failed: [], totalCost: 0 };

  // Emit discovery_start
  await emitEvent(redis, jobId, 'discovery_start', {
    profileId,
    tasks,
    businessName: profile.businessName,
  });

  // --- Task 1: Website Scrape (Firecrawl) ---
  if (tasks.includes('website-scrape') && profile.website) {
    await runTask(redis, jobId, 'website-scrape', results, async () => {
      const scraped = await firecrawl.scrape(profile.website, redis);
      await trackCost(redis, 'firecrawl', scraped.costUsd);
      results.totalCost += scraped.costUsd || 0;

      // Update discoveredData.ownSite
      const existingData = (profile.discoveredData && typeof profile.discoveredData === 'object')
        ? profile.discoveredData : {};

      await prisma.businessProfile.update({
        where: { id: profileId },
        data: {
          discoveredData: {
            ...existingData,
            ownSite: {
              url: scraped.url,
              title: scraped.title,
              content: truncate(scraped.content, 10000),
              metadata: scraped.metadata,
              scrapedAt: new Date().toISOString(),
            },
          },
        },
      });

      return { url: scraped.url, title: scraped.title, cached: scraped.cached };
    });
  }

  // --- Task 2: Social Media Discovery (Perplexity + Firecrawl) ---
  if (tasks.includes('social-discovery')) {
    await runTask(redis, jobId, 'social-discovery', results, async () => {
      const query = `Find all social media profiles (Facebook, Instagram, LinkedIn, Twitter/X, YouTube, TikTok) for "${profile.businessName}"${profile.website ? ` website: ${profile.website}` : ''}. Return ONLY the direct profile URLs, one per line, labeled by platform.`;

      const research = await perplexity.research(query, redis, {
        systemPrompt: 'You are a social media research specialist. Return only verified social media profile URLs. Format: "Platform: URL" one per line. If a profile cannot be found, omit that platform.',
        maxTokens: 500,
      });
      await trackCost(redis, 'perplexity', research.costUsd);
      results.totalCost += research.costUsd || 0;

      // Parse social profiles from response
      const socialProfiles = parseSocialProfiles(research.answer);

      // Update discoveredData.social and socialProfiles
      const existingData = await getDiscoveredData(profileId);
      const existingSocial = (profile.socialProfiles && typeof profile.socialProfiles === 'object')
        ? profile.socialProfiles : {};

      await prisma.businessProfile.update({
        where: { id: profileId },
        data: {
          socialProfiles: { ...existingSocial, ...socialProfiles },
          discoveredData: {
            ...existingData,
            social: {
              profiles: socialProfiles,
              rawResponse: truncate(research.answer, 2000),
              discoveredAt: new Date().toISOString(),
            },
          },
        },
      });

      return { profilesFound: Object.keys(socialProfiles).length, profiles: socialProfiles, cached: research.cached };
    });
  }

  // --- Task 3: Competitor Scrape (Firecrawl) ---
  if (tasks.includes('competitor-scrape')) {
    await runTask(redis, jobId, 'competitor-scrape', results, async () => {
      const competitors = Array.isArray(profile.competitors) ? profile.competitors : [];
      if (competitors.length === 0) {
        return { skipped: true, reason: 'No competitors listed' };
      }

      const competitorData = [];
      let taskCost = 0;

      for (const competitor of competitors.slice(0, 5)) { // Cap at 5 competitors
        try {
          const url = competitor.startsWith('http') ? competitor : `https://${competitor}`;
          const scraped = await firecrawl.scrape(url, redis);
          await trackCost(redis, 'firecrawl', scraped.costUsd);
          taskCost += scraped.costUsd || 0;

          competitorData.push({
            url: scraped.url,
            title: scraped.title,
            content: truncate(scraped.content, 5000),
            metadata: scraped.metadata,
            cached: scraped.cached,
          });
        } catch (err) {
          console.error(`${LOG_PREFIX} Failed to scrape competitor ${competitor}:`, err.message);
          competitorData.push({
            url: competitor,
            error: err.message,
          });
        }
      }

      results.totalCost += taskCost;

      await prisma.businessProfile.update({
        where: { id: profileId },
        data: {
          competitorIntel: {
            competitors: competitorData,
            analyzedAt: new Date().toISOString(),
            totalAnalyzed: competitorData.filter(c => !c.error).length,
          },
        },
      });

      return {
        analyzed: competitorData.filter(c => !c.error).length,
        failed: competitorData.filter(c => c.error).length,
        total: competitorData.length,
      };
    });
  }

  // --- Task 4: Market Research (Perplexity) ---
  if (tasks.includes('market-research')) {
    await runTask(redis, jobId, 'market-research', results, async () => {
      const query = `Market research for a ${profile.businessType} company in the "${profile.industry}" industry.
Target market: ${profile.targetMarket}
Ideal customer: ${profile.icp}
Budget range: ${profile.budgetRange}

Provide:
1. Market size and growth trends (with numbers if available)
2. Top 3 customer pain points in this market
3. Key buying triggers and decision factors
4. Seasonal trends or timing considerations
5. Emerging opportunities or underserved segments
6. Recommended marketing channels for this audience`;

      const research = await perplexity.research(query, redis, {
        systemPrompt: 'You are a market research analyst. Provide data-driven insights with specific numbers, trends, and actionable recommendations. Cite sources where possible.',
        maxTokens: 1500,
      });
      await trackCost(redis, 'perplexity', research.costUsd);
      results.totalCost += research.costUsd || 0;

      await prisma.businessProfile.update({
        where: { id: profileId },
        data: {
          marketIntel: {
            research: research.answer,
            citations: research.citations,
            researchedAt: new Date().toISOString(),
          },
        },
      });

      return { cached: research.cached, citationCount: research.citations.length };
    });
  }

  // --- Task 5: AI Synthesis (ChatGPT) ---
  if (tasks.includes('ai-synthesis')) {
    await runTask(redis, jobId, 'ai-synthesis', results, async () => {
      // Gather all data from previous tasks
      const freshProfile = await prisma.businessProfile.findUnique({
        where: { id: profileId },
      });

      const discoveredData = freshProfile.discoveredData || {};
      const competitorIntel = freshProfile.competitorIntel || {};
      const marketIntel = freshProfile.marketIntel || {};
      const socialProfiles = freshProfile.socialProfiles || {};

      const contextSummary = buildSynthesisContext(freshProfile, discoveredData, competitorIntel, marketIntel, socialProfiles);

      const result = await chatgpt.chat({
        systemPrompt: `You are an AI marketing strategist for "${freshProfile.businessName}". Analyze all provided data and generate actionable insights. Respond in valid JSON format only.`,
        userPrompt: `Based on the following business data, generate a JSON object with these keys:

${contextSummary}

Required JSON structure:
{
  "contentThemes": [
    { "theme": "string", "description": "string", "frequency": "daily|3x-week|weekly", "platforms": ["string"] }
  ],
  "audienceInsights": {
    "primarySegments": [{ "name": "string", "description": "string", "reachStrategy": "string" }],
    "peakActivityTimes": ["string"],
    "preferredContentTypes": ["string"],
    "buyingTriggers": ["string"]
  },
  "competitiveGaps": ["string"],
  "recommendedTone": "string",
  "quickWins": [{ "action": "string", "impact": "high|medium|low", "effort": "low|medium|high" }]
}`,
        model: 'gpt-4o-mini',
        maxTokens: 2000,
        temperature: 0.3,
      }, redis);

      await trackCost(redis, 'chatgpt', result.costUsd);
      results.totalCost += result.costUsd || 0;

      // Parse JSON response
      let synthesis;
      try {
        const cleaned = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        synthesis = JSON.parse(cleaned);
      } catch {
        // If JSON parsing fails, store raw content
        synthesis = { raw: result.content, parseError: true };
      }

      const updateData = {};
      if (synthesis.contentThemes) {
        updateData.contentThemes = synthesis.contentThemes;
      }
      if (synthesis.audienceInsights || synthesis.competitiveGaps || synthesis.quickWins) {
        updateData.audienceInsight = {
          segments: synthesis.audienceInsights?.primarySegments || [],
          peakTimes: synthesis.audienceInsights?.peakActivityTimes || [],
          contentTypes: synthesis.audienceInsights?.preferredContentTypes || [],
          buyingTriggers: synthesis.audienceInsights?.buyingTriggers || [],
          competitiveGaps: synthesis.competitiveGaps || [],
          quickWins: synthesis.quickWins || [],
          synthesizedAt: new Date().toISOString(),
        };
      }
      if (synthesis.recommendedTone && !freshProfile.toneOfVoice) {
        updateData.toneOfVoice = synthesis.recommendedTone;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.businessProfile.update({
          where: { id: profileId },
          data: updateData,
        });
      }

      return { cached: result.cached, fieldsUpdated: Object.keys(updateData) };
    });
  }

  // --- Finalize ---
  await prisma.businessProfile.update({
    where: { id: profileId },
    data: {
      discoveryRun: true,
      lastDiscovery: new Date(),
    },
  });

  await emitEvent(redis, jobId, 'discovery_complete', {
    profileId,
    completed: results.completed,
    failed: results.failed,
    totalCost: results.totalCost,
  });

  console.log(`${LOG_PREFIX} Discovery complete for ${profile.businessName}: ${results.completed.length} tasks OK, ${results.failed.length} failed, cost $${results.totalCost.toFixed(4)}`);

  return results;
}

// ═══ Helper: Run a single task with error handling + SSE ═══

async function runTask(redis, jobId, taskName, results, fn) {
  console.log(`${LOG_PREFIX} Starting task: ${taskName}`);

  await emitEvent(redis, jobId, 'discovery_task_start', { task: taskName });

  try {
    const taskResult = await fn();
    results.completed.push(taskName);

    await emitEvent(redis, jobId, 'discovery_task_complete', {
      task: taskName,
      result: taskResult,
    });

    console.log(`${LOG_PREFIX} Task ${taskName} completed`);
  } catch (err) {
    console.error(`${LOG_PREFIX} Task ${taskName} failed:`, err.message);
    results.failed.push({ task: taskName, error: err.message });

    await emitEvent(redis, jobId, 'discovery_task_failed', {
      task: taskName,
      error: err.message,
    });
  }
}

// ═══ Helper: Emit SSE event ═══

async function emitEvent(redis, jobId, type, data) {
  try {
    await publishEvent(redis, jobId, {
      type,
      ...data,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`${LOG_PREFIX} SSE emit failed for ${type}:`, err.message);
  }
}

// ═══ Helper: Get current discoveredData (fresh from DB) ═══

async function getDiscoveredData(profileId) {
  const p = await prisma.businessProfile.findUnique({
    where: { id: profileId },
    select: { discoveredData: true },
  });
  return (p?.discoveredData && typeof p.discoveredData === 'object') ? p.discoveredData : {};
}

// ═══ Helper: Parse social profile URLs from Perplexity response ═══

function parseSocialProfiles(text) {
  const profiles = {};
  const patterns = [
    { platform: 'facebook', regex: /facebook\.com\/[^\s)"\]]+/gi },
    { platform: 'instagram', regex: /instagram\.com\/[^\s)"\]]+/gi },
    { platform: 'linkedin', regex: /linkedin\.com\/(?:company|in)\/[^\s)"\]]+/gi },
    { platform: 'twitter', regex: /(?:twitter\.com|x\.com)\/[^\s)"\]]+/gi },
    { platform: 'youtube', regex: /youtube\.com\/(?:@|channel\/|c\/)[^\s)"\]]+/gi },
    { platform: 'tiktok', regex: /tiktok\.com\/@[^\s)"\]]+/gi },
  ];

  for (const { platform, regex } of patterns) {
    const match = text.match(regex);
    if (match && match[0]) {
      let url = match[0];
      if (!url.startsWith('http')) url = 'https://' + url;
      profiles[platform] = url;
    }
  }

  return profiles;
}

// ═══ Helper: Build synthesis context string ═══

function buildSynthesisContext(profile, discoveredData, competitorIntel, marketIntel, socialProfiles) {
  const parts = [];

  parts.push(`Business: ${profile.businessName}`);
  parts.push(`Industry: ${profile.industry} (${profile.businessType})`);
  parts.push(`Target Market: ${profile.targetMarket}`);
  parts.push(`ICP: ${profile.icp}`);
  parts.push(`Offer: ${profile.offer}`);
  if (profile.uniqueValue) parts.push(`Unique Value: ${profile.uniqueValue}`);
  parts.push(`Budget: ${profile.budgetRange}`);
  parts.push(`Active Channels: ${JSON.stringify(profile.activeChannels)}`);

  if (discoveredData.ownSite) {
    parts.push(`\nOwn Website (${discoveredData.ownSite.title}):\n${truncate(discoveredData.ownSite.content, 2000)}`);
  }

  if (Object.keys(socialProfiles).length > 0) {
    parts.push(`\nSocial Profiles: ${JSON.stringify(socialProfiles)}`);
  }

  if (competitorIntel.competitors) {
    const compSummary = competitorIntel.competitors
      .filter(c => !c.error)
      .map(c => `- ${c.title} (${c.url}): ${truncate(c.content, 500)}`)
      .join('\n');
    if (compSummary) parts.push(`\nCompetitor Data:\n${compSummary}`);
  }

  if (marketIntel.research) {
    parts.push(`\nMarket Research:\n${truncate(marketIntel.research, 2000)}`);
  }

  return parts.join('\n');
}

// ═══ Helper: Truncate string to max length ═══

function truncate(str, maxLen) {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '... [truncated]';
}

module.exports = { runDiscovery };
