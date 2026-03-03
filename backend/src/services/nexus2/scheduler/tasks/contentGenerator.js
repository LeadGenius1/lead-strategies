// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — CONTENT GENERATOR
// Generates social media posts, email drafts based on content
// themes, tone of voice, and active channels.
// Runs daily at 9 AM UTC (adjusted per contentFreq).
// ═══════════════════════════════════════════════════════════════

const chatgpt = require('../../../marketStrategy/providers/chatgpt');
const { trackCost } = require('../../../marketStrategy/costTracker');
const { SCHED_EVENTS } = require('../constants');

// Platform-specific constraints
const PLATFORM_CONFIG = {
  facebook:  { maxLength: 500,  type: 'post',   label: 'Facebook Post' },
  instagram: { maxLength: 2200, type: 'post',   label: 'Instagram Caption' },
  linkedin:  { maxLength: 700,  type: 'post',   label: 'LinkedIn Post' },
  twitter:   { maxLength: 280,  type: 'post',   label: 'Tweet' },
  email:     { maxLength: 2000, type: 'email',  label: 'Email Newsletter' },
  sms:       { maxLength: 160,  type: 'sms',    label: 'SMS Campaign' },
};

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  const themes = Array.isArray(profile.contentThemes) ? profile.contentThemes : [];
  const channels = Array.isArray(profile.activeChannels) ? profile.activeChannels : [];
  const tone = profile.toneOfVoice || 'professional';
  const approvalMode = profile.approvalMode || 'review';

  if (channels.length === 0) {
    return { status: 'skipped', output: { reason: 'No active channels configured' }, costUsd: 0 };
  }

  // Pick a theme (rotate through available themes)
  const themeIndex = new Date().getDay() % Math.max(themes.length, 1);
  const currentTheme = themes.length > 0
    ? (typeof themes[themeIndex] === 'string' ? themes[themeIndex] : themes[themeIndex]?.topic || 'general business tips')
    : 'general business tips and industry insights';

  const drafts = [];
  let totalCost = 0;
  const targetChannels = channels.filter(ch => PLATFORM_CONFIG[ch]);

  for (let i = 0; i < targetChannels.length; i++) {
    const channel = targetChannels[i];
    const config = PLATFORM_CONFIG[channel];
    const progress = Math.round(((i + 1) / targetChannels.length) * 90);

    emit({
      type: SCHED_EVENTS.TASK_PROGRESS,
      taskId: 'content-generator',
      progress,
      message: `Generating ${config.label}...`,
    });

    try {
      const systemPrompt = `You are an expert social media and content marketer.
Generate content for ${config.label} (max ${config.maxLength} characters).
Tone: ${tone}.
Business: ${profile.businessName} (${profile.industry}).
Target audience: ${profile.targetMarket}.
ICP: ${profile.icp}.
Offer: ${profile.offer}.`;

      const userPrompt = config.type === 'email'
        ? `Write a short email newsletter about: "${currentTheme}". Include subject line, preview text, and body. Keep body under ${config.maxLength} characters.`
        : config.type === 'sms'
          ? `Write a brief SMS message about: "${currentTheme}". Max ${config.maxLength} characters. Include a clear CTA.`
          : `Write a ${config.label} about: "${currentTheme}". Max ${config.maxLength} characters. Include relevant hashtags if appropriate.`;

      const result = await chatgpt.chat({
        systemPrompt,
        userPrompt,
        model: 'gpt-4o-mini',
        maxTokens: 800,
        temperature: 0.7,
      }, redis);

      totalCost += result.costUsd || 0;
      await trackCost(redis, 'chatgpt', result.costUsd);

      const draftStatus = approvalMode === 'auto' ? 'approved' : 'draft';

      drafts.push({
        channel,
        type: config.type,
        label: config.label,
        content: (result.content || '').trim(),
        theme: currentTheme,
        suggestedTime: getSuggestedPostTime(channel),
        status: draftStatus,
      });
    } catch (err) {
      drafts.push({
        channel,
        type: config.type,
        label: config.label,
        content: null,
        error: err.message,
        status: 'failed',
      });
    }
  }

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'content-generator', progress: 100, message: 'Content generation complete' });

  const successCount = drafts.filter(d => d.status !== 'failed').length;
  const output = {
    drafts,
    theme: currentTheme,
    totalDrafts: drafts.length,
    successCount,
    feedMessage: `Generated ${successCount} content draft(s) — theme: "${currentTheme}"`,
  };

  return { status: 'completed', output, costUsd: totalCost };
}

/**
 * Suggest optimal posting time per channel.
 */
function getSuggestedPostTime(channel) {
  const times = {
    facebook: '12:00 PM',
    instagram: '11:00 AM',
    linkedin: '8:00 AM',
    twitter: '9:00 AM',
    email: '10:00 AM',
    sms: '2:00 PM',
  };
  return times[channel] || '10:00 AM';
}

module.exports = { execute };
