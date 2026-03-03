// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — SENDER HEALTH CHECK
// Checks Instantly sender account warmup, reputation, daily limits.
// Runs daily at 7 AM UTC (before other tasks).
// ═══════════════════════════════════════════════════════════════

const instantly = require('../../../instantly');
const { SCHED_EVENTS } = require('../constants');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'sender-health', progress: 10, message: 'Checking sender accounts...' });

  const warmupResult = await instantly.getWarmupStatus();

  const accounts = [];
  const rawAccounts = warmupResult.accounts || [];

  if (rawAccounts.length === 0 && warmupResult.warmup) {
    // Single account fallback (mock mode)
    rawAccounts.push(warmupResult.warmup);
  }

  for (const acct of rawAccounts) {
    accounts.push({
      email: acct.email || 'unknown',
      warmupScore: acct.warmup_reputation || acct.reputation || 0,
      dailyLimit: acct.daily_limit || 0,
      emailsSentToday: acct.emails_sent_today || 0,
      daysRunning: acct.days_running || 0,
      status: acct.status || 'unknown',
      issues: [],
    });
  }

  // Flag issues
  for (const acct of accounts) {
    if (acct.warmupScore < 70) acct.issues.push('Low warmup score');
    if (acct.status === 'paused') acct.issues.push('Warmup paused');
    if (acct.status === 'not_started') acct.issues.push('Warmup not started');
  }

  const hasIssues = accounts.some(a => a.issues.length > 0);
  const totalCapacity = accounts.reduce((sum, a) => sum + a.dailyLimit, 0);
  const healthyCount = accounts.filter(a => a.issues.length === 0).length;

  const overallHealth = hasIssues
    ? (accounts.every(a => a.issues.length > 0) ? 'critical' : 'warning')
    : 'good';

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'sender-health', progress: 100, message: 'Health check complete' });

  const output = {
    accounts,
    overallHealth,
    totalCapacity,
    healthyCount,
    totalAccounts: accounts.length,
    feedMessage: overallHealth === 'good'
      ? `Sender health: ${healthyCount}/${accounts.length} accounts healthy, ${totalCapacity}/day total capacity`
      : `Sender health WARNING: ${accounts.length - healthyCount} account(s) have issues`,
  };

  return { status: 'completed', output, costUsd: 0 };
}

module.exports = { execute };
