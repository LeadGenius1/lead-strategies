// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT GREETING GENERATOR
// Context-aware ambient greeting for the assistant sidebar.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../config/database');
const engine = require('../scheduler/engine');
const { ALL_TASK_IDS, SCHED_KEYS, TASKS } = require('../scheduler/constants');

/**
 * Generate a context-aware greeting.
 * @param {string} userId
 * @param {object} redis - node-redis v4 client (optional)
 * @returns {Promise<{ greeting: string, suggestions: string[], stats: object }>}
 */
async function generateGreeting(userId, redis) {
  const hour = new Date().getUTCHours();
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { businessName: true, targetMarket: true, contentFreq: true, profileComplete: true },
  });

  const name = profile?.businessName || 'there';

  // Gather stats
  let completedToday = 0;
  let pendingToday = 0;
  let costToday = 0;
  let lastActivity = null;

  if (redis) {
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      for (const taskId of ALL_TASK_IDS) {
        const runKey = SCHED_KEYS.taskRun(userId, taskId, dateStr);
        const runData = await redis.get(runKey);
        if (runData) completedToday++;
      }

      const costData = await redis.hGetAll(SCHED_KEYS.dailyCosts(dateStr));
      costToday = parseFloat(costData?.total || '0');

      // Check last conversation
      const lastMsg = await prisma.conversationHistory.findFirst({
        where: { userId, agentName: 'lead-hunter' },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });
      lastActivity = lastMsg?.timestamp || null;
    } catch {
      // Non-critical
    }
  }

  // Check schedule
  let scheduleActive = false;
  let taskCount = 0;
  try {
    const schedule = await engine.getSchedule(userId);
    scheduleActive = schedule?.isActive || false;
    taskCount = schedule?.taskCount || 0;
    pendingToday = taskCount - completedToday;
    if (pendingToday < 0) pendingToday = 0;
  } catch {
    // Non-critical
  }

  // Build greeting based on time and context
  let greeting;
  const daysSinceActive = lastActivity
    ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (daysSinceActive !== null && daysSinceActive >= 3) {
    greeting = `Welcome back, ${name}. It's been a few days. Let's catch up on what's happened.`;
  } else if (hour >= 5 && hour < 12) {
    greeting = completedToday > 0
      ? `Morning, ${name}. ${completedToday} task${completedToday > 1 ? 's' : ''} already done today.`
      : `Morning, ${name}. Ready to get things moving.`;
  } else if (hour >= 12 && hour < 18) {
    greeting = completedToday > 0
      ? `${completedToday} task${completedToday > 1 ? 's' : ''} done so far. What's next?`
      : `Afternoon, ${name}. Let's make some progress.`;
  } else {
    greeting = completedToday > 0
      ? `${completedToday} task${completedToday > 1 ? 's' : ''} completed today. Anything else before end of day?`
      : `Evening, ${name}. Quick session?`;
  }

  // Context-aware suggestions
  const suggestions = [];

  if (!profile?.profileComplete) {
    suggestions.push('Complete my business profile');
  }

  if (!scheduleActive && profile?.profileComplete) {
    suggestions.push('Activate my schedule');
  }

  if (completedToday > 0) {
    suggestions.push('Show today\'s results');
  }

  if (pendingToday > 0) {
    suggestions.push('Run pending tasks now');
  }

  // Always offer some useful defaults
  if (suggestions.length < 3) {
    const defaults = [
      'How are my campaigns doing?',
      'Generate a LinkedIn post',
      'Check email sender health',
      'What should I focus on?',
      'Research my competitors',
    ];
    for (const d of defaults) {
      if (suggestions.length >= 4) break;
      if (!suggestions.includes(d)) suggestions.push(d);
    }
  }

  return {
    greeting,
    suggestions: suggestions.slice(0, 4),
    stats: { completedToday, pendingToday, costToday, scheduleActive, taskCount },
  };
}

module.exports = { generateGreeting };
