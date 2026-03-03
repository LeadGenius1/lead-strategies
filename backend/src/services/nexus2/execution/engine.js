// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — EXECUTION ENGINE
// Dispatches approved outputs to the correct platform executor.
// Emits SSE events for real-time UI feedback.
// ═══════════════════════════════════════════════════════════════

const { EXECUTION_TYPES, EXEC_STATUS, EXEC_KEYS, EXEC_EVENTS } = require('./constants');
const { publishEvent } = require('../../marketStrategy/sseManager');

// Executor registry — lazy-loaded
const EXECUTORS = {
  instantly: () => require('./executors/instantly'),
  social:    () => require('./executors/social'),
  sms:       () => require('./executors/sms'),
  leadsite:  () => require('./executors/leadsite'),
  videosite: () => require('./executors/videosite'),
};

/**
 * Execute a single platform action.
 *
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string} opts.outputId - Redis key of the approved output
 * @param {string} opts.executionType - Key from EXECUTION_TYPES
 * @param {object} opts.payload - Data to pass to the executor
 * @param {import("redis").RedisClientType} opts.redis
 * @param {function} [opts.emit] - Optional SSE emitter (provided by worker)
 * @returns {Promise<object>}
 */
async function execute({ userId, outputId, executionType, payload, redis, emit }) {
  const execId = `${executionType}:${Date.now()}`;
  const typeDef = EXECUTION_TYPES[executionType];

  if (!typeDef) {
    return { status: 'failed', error: `Unknown execution type: ${executionType}`, execId };
  }

  const executorLoader = EXECUTORS[typeDef.executor];
  if (!executorLoader) {
    return { status: 'failed', error: `No executor for: ${typeDef.executor}`, execId };
  }

  // Default emit to SSE publisher
  const emitEvent = emit || ((event) => {
    if (redis) {
      publishEvent(redis, EXEC_KEYS.feedChannel(userId), event).catch(() => {});
    }
  });

  // Emit start
  emitEvent({
    type: EXEC_EVENTS.EXEC_START,
    execId,
    executionType,
    label: typeDef.label,
    icon: typeDef.icon,
    outputId,
    userId,
    ts: new Date().toISOString(),
  });

  try {
    const executor = executorLoader();
    let result;

    // Route to the correct executor method
    switch (executionType) {
      case 'email-campaign':
        result = await executor.executeEmailCampaign({ ...payload, userId });
        break;
      case 'add-leads-campaign':
        result = await executor.addLeadsToCampaign(payload);
        break;
      case 'post-facebook':
      case 'post-twitter':
      case 'post-instagram':
      case 'post-linkedin':
      case 'post-generic':
        result = await executor.postToChannel({
          channelType: executionType.replace('post-', ''),
          userId,
          content: payload.content,
        });
        break;
      case 'sms-campaign':
        result = payload.recipients
          ? await executor.broadcastSMS(payload)
          : await executor.sendSMS(payload);
        break;
      case 'create-leadsite':
        result = await executor.createPage({ ...payload, userId });
        break;
      case 'create-video':
        result = await executor.queueVideo({ ...payload, userId });
        break;
      default:
        result = { status: 'failed', error: `Unhandled execution type: ${executionType}` };
    }

    // Store result in Redis
    if (redis) {
      const execData = {
        execId,
        executionType,
        label: typeDef.label,
        outputId,
        userId,
        ...result,
        completedAt: new Date().toISOString(),
      };

      await redis.set(
        EXEC_KEYS.execution(userId, execId),
        JSON.stringify(execData),
        { EX: 30 * 24 * 60 * 60 }
      );

      // Push to user's execution history list
      await redis.lPush(EXEC_KEYS.history(userId), JSON.stringify(execData));
      await redis.lTrim(EXEC_KEYS.history(userId), 0, 199);
      await redis.expire(EXEC_KEYS.history(userId), 30 * 24 * 60 * 60);
    }

    // Emit complete or failed
    const eventType = result.status === 'failed' ? EXEC_EVENTS.EXEC_FAILED : EXEC_EVENTS.EXEC_COMPLETE;
    emitEvent({
      type: eventType,
      execId,
      executionType,
      label: typeDef.label,
      icon: typeDef.icon,
      outputId,
      userId,
      result,
      ts: new Date().toISOString(),
    });

    return { ...result, execId };
  } catch (err) {
    console.error(`[Execution] ${executionType} failed:`, err.message);

    emitEvent({
      type: EXEC_EVENTS.EXEC_FAILED,
      execId,
      executionType,
      label: typeDef.label,
      outputId,
      userId,
      error: err.message,
      ts: new Date().toISOString(),
    });

    return { status: 'failed', error: err.message, execId };
  }
}

/**
 * Execute a batch of actions sequentially with 1s delay between each.
 *
 * @param {Array<object>} jobs - Array of execute() option objects
 * @returns {Promise<Array<object>>}
 */
async function executeBatch(jobs) {
  const results = [];

  for (let i = 0; i < jobs.length; i++) {
    const result = await execute(jobs[i]);
    results.push(result);

    // 1s delay between executions (rate limiting)
    if (i < jobs.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return results;
}

module.exports = { execute, executeBatch };
