// ═══════════════════════════════════════════════════════════════
// SCHEDULER TASK — COMPETITOR WATCH
// Scrapes competitor sites for changes compared to cached data.
// Runs daily at 8 AM UTC.
// ═══════════════════════════════════════════════════════════════

const firecrawl = require('../../../marketStrategy/providers/firecrawl');
const { trackCost } = require('../../../marketStrategy/costTracker');
const { SCHED_EVENTS } = require('../constants');
const prisma = require('../../../../config/database');

/**
 * @param {object} ctx
 * @param {object} ctx.profile - BusinessProfile record
 * @param {import("redis").RedisClientType} ctx.redis
 * @param {function} ctx.emit - SSE emit function
 * @returns {Promise<{ status: string, output: object, costUsd: number }>}
 */
async function execute({ profile, redis, emit }) {
  const competitors = Array.isArray(profile.competitors) ? profile.competitors : [];
  if (competitors.length === 0) {
    return { status: 'skipped', output: { reason: 'No competitors defined' }, costUsd: 0 };
  }

  const cachedIntel = profile.competitorIntel || {};
  const changes = [];
  const noChanges = [];
  let totalCost = 0;
  const maxCompetitors = Math.min(competitors.length, 5);

  for (let i = 0; i < maxCompetitors; i++) {
    const url = competitors[i];
    const progress = Math.round(((i + 1) / maxCompetitors) * 90);
    emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'competitor-watch', progress, message: `Scanning ${url}...` });

    try {
      const result = await firecrawl.scrape(url, redis);
      totalCost += result.costUsd || 0;
      await trackCost(redis, 'firecrawl', result.costUsd);

      // Compare with cached version
      const cachedEntry = cachedIntel[url] || cachedIntel[i] || null;
      const cachedContent = typeof cachedEntry === 'string'
        ? cachedEntry
        : cachedEntry?.content || '';

      if (!result.cached && cachedContent) {
        // Simple change detection: compare content length and title
        const lengthDiff = Math.abs((result.content || '').length - cachedContent.length);
        const titleChanged = cachedEntry?.title && result.title !== cachedEntry.title;

        if (lengthDiff > 500 || titleChanged) {
          changes.push({
            competitor: url,
            type: titleChanged ? 'title_change' : 'content_change',
            detail: titleChanged
              ? `Title changed: "${cachedEntry.title}" → "${result.title}"`
              : `Content changed significantly (${lengthDiff} chars difference)`,
            url,
          });
        } else {
          noChanges.push(url);
        }
      } else {
        noChanges.push(url);
      }
    } catch (err) {
      changes.push({
        competitor: url,
        type: 'scan_error',
        detail: `Failed to scan: ${err.message}`,
        url,
      });
    }
  }

  emit({ type: SCHED_EVENTS.TASK_PROGRESS, taskId: 'competitor-watch', progress: 100, message: 'Scan complete' });

  const output = {
    changes,
    noChanges,
    scannedCount: maxCompetitors,
    feedMessage: changes.length > 0
      ? `Scanned ${maxCompetitors} competitors — ${changes.length} change(s) detected`
      : `Scanned ${maxCompetitors} competitors — no significant changes`,
  };

  return { status: 'completed', output, costUsd: totalCost };
}

module.exports = { execute };
