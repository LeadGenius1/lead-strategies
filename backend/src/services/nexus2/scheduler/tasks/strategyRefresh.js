// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — STRATEGY REFRESH
// Runs the full 7-agent market strategy pipeline using the
// BusinessProfile data (via profileBridge).
// REUSES the existing pipeline — does NOT rebuild it.
// Runs weekly on Monday at 6 AM UTC.
// ═══════════════════════════════════════════════════════════════

const { profileToMissionInputs } = require('../../profileBridge');
const { addJob } = require('../../../marketStrategy/worker');
const { SCHED_EVENTS } = require('../constants');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  const { targetMarket, icp, competitors, offer } = profile;

  if (!targetMarket || !icp || !offer) {
    return { status: 'skipped', output: { reason: 'Missing required fields: targetMarket, icp, or offer' }, costUsd: 0 };
  }

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'strategy-refresh', progress: 10, message: 'Preparing strategy refresh...' });

  // Convert profile to pipeline input format
  const businessInputs = profileToMissionInputs(profile);

  // Queue a market strategy pipeline job (reuses the full 7-agent pipeline)
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'strategy-refresh', progress: 30, message: 'Launching 7-agent pipeline...' });

  const jobId = await addJob(businessInputs, profile.userId, redis);

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'strategy-refresh', progress: 100, message: 'Pipeline job queued' });

  // Note: The actual pipeline execution is async (handled by the market-strategy worker).
  // Cost tracking happens inside the pipeline agents themselves.
  // We just track the job ID so the user can follow progress.

  const output = {
    marketStrategyJobId: jobId,
    feedMessage: `Weekly strategy refresh started — 7 agents analyzing your market (Job: ${jobId})`,
  };

  return { status: 'completed', output, costUsd: 0 }; // Costs tracked by pipeline
}

module.exports = { execute };
