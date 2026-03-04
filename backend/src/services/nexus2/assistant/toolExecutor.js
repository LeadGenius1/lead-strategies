// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT TOOL EXECUTOR
// Dispatches tool calls to existing backend services.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../config/database');
const engine = require('../scheduler/engine');
const { TASKS, ALL_TASK_IDS, SCHED_KEYS } = require('../scheduler/constants');
const { profileToMissionInputs } = require('../profileBridge');
const { trackCost } = require('../../marketStrategy/costTracker');

// Lazy-loaded agents (same pattern as nexus-chat.js)
let instantlyService = null;
let perplexityAgent = null;
let firecrawlAgent = null;
let chatgptAgent = null;

function getInstantly() {
  if (!instantlyService) {
    instantlyService = require('../../instantly');
  }
  return instantlyService;
}

function getPerplexity() {
  if (!perplexityAgent) {
    const { PerplexityAgent } = require('../../perplexity-agent');
    perplexityAgent = new PerplexityAgent();
  }
  return perplexityAgent;
}

function getFirecrawl() {
  if (!firecrawlAgent) {
    const { FirecrawlAgent } = require('../../firecrawl-agent');
    firecrawlAgent = new FirecrawlAgent();
  }
  return firecrawlAgent;
}

function getChatGPT() {
  if (!chatgptAgent) {
    const { ChatGPTAgent } = require('../../chatgpt-agent');
    chatgptAgent = new ChatGPTAgent();
  }
  return chatgptAgent;
}

const MAX_RESULT_LENGTH = 10000;

function truncate(str) {
  if (typeof str !== 'string') str = JSON.stringify(str);
  return str.length > MAX_RESULT_LENGTH
    ? str.substring(0, MAX_RESULT_LENGTH) + '... [truncated]'
    : str;
}

/**
 * Execute a tool call from the assistant.
 * @param {string} toolName
 * @param {object} toolInput
 * @param {{ userId: string, redis: object }} ctx
 * @returns {Promise<object>}
 */
async function executeTool(toolName, toolInput, ctx) {
  const { userId, redis } = ctx;

  try {
    switch (toolName) {
      // ─── Schedule Management ─────────────────────────
      case 'adjust_schedule': {
        const { taskId, action, frequency } = toolInput;
        if (!TASKS[taskId]) return { error: `Unknown task: ${taskId}` };

        if (action === 'pause') {
          return await engine.pauseTask(userId, taskId);
        }
        if (action === 'resume') {
          return await engine.resumeTask(userId, taskId);
        }
        if (action === 'update-frequency' && frequency) {
          await prisma.businessProfile.update({
            where: { userId },
            data: { contentFreq: frequency },
          });
          const result = await engine.updateSchedule(userId);
          return { updated: true, frequency, ...result };
        }
        return { error: 'Invalid action' };
      }

      case 'trigger_task': {
        const { taskId } = toolInput;
        if (!TASKS[taskId]) return { error: `Unknown task: ${taskId}` };
        return await engine.triggerTask(userId, taskId);
      }

      case 'pause_task': {
        const { taskId } = toolInput;
        if (!TASKS[taskId]) return { error: `Unknown task: ${taskId}` };
        return await engine.pauseTask(userId, taskId);
      }

      case 'resume_task': {
        const { taskId } = toolInput;
        if (!TASKS[taskId]) return { error: `Unknown task: ${taskId}` };
        return await engine.resumeTask(userId, taskId);
      }

      case 'list_schedule': {
        return await engine.getSchedule(userId);
      }

      // ─── Content Generation ──────────────────────────
      case 'generate_content': {
        const { contentType, topic, platform, tone } = toolInput;

        const profile = await prisma.businessProfile.findUnique({ where: { userId } });
        const context = profile ? profileToMissionInputs(profile) : {};
        const effectiveTone = tone || context.enrichedContext?.toneOfVoice || 'professional';

        const prompt = buildContentPrompt(contentType, topic, platform, effectiveTone, context);
        const gpt = getChatGPT();
        const result = await gpt.generateEmail(
          { name: 'prospect', company: topic },
          { objective: prompt, keyPoints: [contentType, platform || 'general'] }
        );

        if (redis) await trackCost(redis, 'chatgpt', 0.002);
        return { contentType, topic, content: result };
      }

      // ─── Campaign Management ─────────────────────────
      case 'manage_campaign': {
        const { action, campaignId, name, subject, body } = toolInput;
        const instantly = getInstantly();

        switch (action) {
          case 'list':
            return await instantly.getCampaigns();
          case 'create':
            if (!name || !subject || !body) return { error: 'name, subject, body required' };
            return await instantly.createCampaign({ name, subject, body });
          case 'launch':
            if (!campaignId) return { error: 'campaignId required' };
            return await instantly.launchCampaign(campaignId);
          case 'pause':
            if (!campaignId) return { error: 'campaignId required' };
            return await instantly.pauseCampaign(campaignId);
          case 'analytics':
            if (!campaignId) return { error: 'campaignId required' };
            return await instantly.getCampaignAnalytics(campaignId);
          default:
            return { error: `Unknown campaign action: ${action}` };
        }
      }

      // ─── Research ────────────────────────────────────
      case 'research_topic': {
        const { query } = toolInput;
        const perplexity = getPerplexity();
        const result = await perplexity.research(query);
        if (redis) await trackCost(redis, 'perplexity', 0.005);
        return result;
      }

      case 'scan_competitor': {
        const { name, url } = toolInput;
        const firecrawl = getFirecrawl();
        const result = await firecrawl.scrapeCompetitorPricing(name, url);
        if (redis) await trackCost(redis, 'firecrawl', 0.01);
        return result;
      }

      // ─── Performance Queries ─────────────────────────
      case 'query_performance': {
        const { metric, days = 7 } = toolInput;

        if (metric === 'campaigns') {
          const instantly = getInstantly();
          return await instantly.getCampaigns();
        }

        if (metric === 'tasks') {
          const schedule = await engine.getSchedule(userId);
          // Get recent run data from Redis
          const history = [];
          if (redis) {
            const now = new Date();
            for (let d = 0; d < days; d++) {
              const date = new Date(now);
              date.setUTCDate(date.getUTCDate() - d);
              const dateStr = date.toISOString().slice(0, 10);
              for (const taskId of ALL_TASK_IDS) {
                const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
                const runData = await redis.get(runKey);
                if (runData) {
                  history.push({ taskId, date: dateStr, ...JSON.parse(runData) });
                }
              }
            }
          }
          return { schedule, recentRuns: history };
        }

        if (metric === 'costs') {
          const { getCosts } = require('../../marketStrategy/costTracker');
          const now = new Date();
          const start = new Date(now);
          start.setUTCDate(start.getUTCDate() - days);
          return await getCosts(redis, start.toISOString().slice(0, 10), now.toISOString().slice(0, 10));
        }

        if (metric === 'overview') {
          const schedule = await engine.getSchedule(userId);
          const instantly = getInstantly();
          const campaigns = await instantly.getCampaigns({ limit: 5 });
          return { schedule, recentCampaigns: campaigns };
        }

        return { error: `Unknown metric: ${metric}` };
      }

      // ─── Strategy Updates ────────────────────────────
      case 'update_strategy': {
        const { field, value } = toolInput;
        const allowedFields = [
          'targetMarket', 'icp', 'competitors', 'offer',
          'toneOfVoice', 'contentThemes', 'uniqueValue',
        ];
        if (!allowedFields.includes(field)) {
          return { error: `Cannot update field: ${field}` };
        }

        // Parse JSON for array fields
        let parsedValue = value;
        if (['competitors', 'contentThemes'].includes(field)) {
          try {
            parsedValue = JSON.parse(value);
          } catch {
            parsedValue = value.split(',').map((s) => s.trim());
          }
        }

        await prisma.businessProfile.update({
          where: { userId },
          data: { [field]: parsedValue },
        });

        // Trigger schedule update if relevant fields changed
        if (['targetMarket', 'icp', 'competitors', 'offer'].includes(field)) {
          await engine.updateSchedule(userId);
        }

        return { updated: true, field, value: parsedValue };
      }

      // ─── Video Creation ─────────────────────────────
      case 'create_video': {
        const { tier = 'auto', topic, templateId, channels } = toolInput;

        const profile = await prisma.businessProfile.findUnique({ where: { userId } });
        const bizName = profile?.businessName || 'Your Business';
        const tone = profile?.toneOfVoice || 'professional';
        const industry = profile?.industry || 'general';

        // Generate script via ChatGPT
        const gpt = getChatGPT();
        const scriptResult = await gpt.generateEmail(
          { name: 'prospect', company: topic },
          {
            objective: `Write a 30-second video script about "${topic}" for ${bizName}. Structure: 3-4 scenes with [scene descriptions] and voiceover narration. End with a CTA.`,
            keyPoints: ['video-script', industry],
          }
        );
        if (redis) await trackCost(redis, 'chatgpt', 0.002);

        const script = typeof scriptResult === 'string' ? scriptResult : scriptResult?.body || scriptResult?.content || JSON.stringify(scriptResult);

        // Queue video job
        const { addVideoJob } = require('../video/worker');
        const job = await addVideoJob({
          userId,
          tier,
          script,
          projectName: `${bizName} — ${topic}`,
          tone,
          industry,
          format: 'vertical',
          templateId: templateId || null,
          photos: [],
          channels: channels || [],
        });

        return { status: 'queued', jobId: job.jobId, tier, topic, message: `Video "${topic}" queued for creation (${tier} tier).` };
      }

      // ─── Platform Health ─────────────────────────────
      case 'check_platforms': {
        const { platform } = toolInput;
        const results = {};

        if (platform === 'email' || platform === 'all') {
          const instantly = getInstantly();
          results.email = await instantly.getWarmupStatus();
        }

        if (platform === 'social' || platform === 'all') {
          // Check connected social accounts from profile
          const profile = await prisma.businessProfile.findUnique({
            where: { userId },
            select: { socialProfiles: true, activeChannels: true, platforms: true },
          });
          results.social = {
            connectedProfiles: profile?.socialProfiles || {},
            activeChannels: profile?.activeChannels || [],
            platforms: profile?.platforms || [],
          };
        }

        return results;
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    console.error(`[Assistant Tool] ${toolName} error:`, err.message);
    return { error: `Tool failed: ${err.message}` };
  }
}

function buildContentPrompt(contentType, topic, platform, tone, context) {
  const biz = context.enrichedContext || {};
  const base = `Write ${contentType} about "${topic}" for ${biz.businessName || 'the business'}.`;
  const toneStr = `Tone: ${tone}.`;
  const audienceStr = context.icp ? `Target audience: ${context.icp}.` : '';
  const platformStr = platform ? `Platform: ${platform}.` : '';
  return [base, toneStr, audienceStr, platformStr].filter(Boolean).join(' ');
}

module.exports = { executeTool, truncate };
