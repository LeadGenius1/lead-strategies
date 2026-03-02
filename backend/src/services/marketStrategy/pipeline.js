// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — STAGED EXECUTOR
// Iterates STAGES 0→3, runs agents in parallel per stage,
// accumulates context between stages, stores outputs in Redis.
// ═══════════════════════════════════════════════════════════════

const {
  STAGES,
  AGENT_MAP,
  REDIS_KEYS,
  JOB_STATUS,
  AGENT_STATUS,
} = require("./constants");
const { truncateOutput, nowISO } = require("./utils");
const { publishEvent } = require("./sseManager");
const { trackCost } = require("./costTracker");
const AGENT_REGISTRY = require("./agentRegistry");

/**
 * Execute the full market strategy pipeline for a job.
 *
 * @param {string} jobId
 * @param {object} businessInputs - Original POST payload
 * @param {object} opts
 * @param {import("redis").RedisClientType} opts.redis - node-redis v4 client
 */
async function executePipeline(jobId, businessInputs, { redis }) {
  let context = { businessInputs, sources: [] };
  let totalCostUsd = 0;
  let anyFailed = false;

  /**
   * Emit helper — publishes SSE event + stores in Redis event log.
   * Automatically attaches jobId and timestamp.
   */
  async function emit(type, data = {}) {
    const event = { type, jobId, ts: nowISO(), ...data };
    await publishEvent(redis, jobId, event);
  }

  // Mark job as running
  await redis.hSet(REDIS_KEYS.job(jobId), {
    status: JOB_STATUS.RUNNING,
    updatedAt: nowISO(),
  });

  await emit("job_start");

  // --- Iterate stages sequentially ---
  for (const [stageIndexStr, stageDef] of Object.entries(STAGES)) {
    const stageIndex = parseInt(stageIndexStr, 10);

    await emit("stage_start", {
      stage: stageDef.name,
      stageIndex,
      label: stageDef.label,
      agents: stageDef.agents,
    });

    // Update job metadata
    await redis.hSet(REDIS_KEYS.job(jobId), {
      currentStage: String(stageIndex),
      currentAgents: JSON.stringify(stageDef.agents),
      updatedAt: nowISO(),
    });

    // --- Run all agents in this stage concurrently ---
    const agentResults = await Promise.allSettled(
      stageDef.agents.map(async (agentId) => {
        const registry = AGENT_REGISTRY[agentId];
        const agentDef = AGENT_MAP[agentId];
        if (!registry) throw new Error(`Agent ${agentId} not found in registry`);

        const agentKey = REDIS_KEYS.agentState(jobId, agentId);

        // Mark agent as running in Redis
        await redis.hSet(agentKey, {
          status: AGENT_STATUS.RUNNING,
          startedAt: nowISO(),
        });

        await emit("agent_start", {
          stage: stageDef.name,
          agentId,
          agentName: agentDef ? agentDef.name : agentId,
        });

        try {
          // Execute agent — pass emit wrapped to include stage+agentId
          const output = await registry.execute({
            businessInputs,
            context,
            redis,
            emit: async (type, data = {}) => {
              await emit(type, { ...data, stage: stageDef.name, agentId });
            },
          });

          // Truncate output to 50KB
          const truncated = truncateOutput(output);

          // Calculate total provider cost for this agent
          // (individual provider costs already tracked in provider wrappers)
          const agentCost = output._totalCost || null;

          // Store agent output
          await redis.hSet(agentKey, {
            status: AGENT_STATUS.COMPLETED,
            completedAt: nowISO(),
            output: JSON.stringify(truncated),
          });

          await emit("agent_complete", {
            stage: stageDef.name,
            agentId,
            status: "completed",
            cached: false,
            costUsd: agentCost,
          });

          return { agentId, output };

        } catch (err) {
          // Store failure
          await redis.hSet(agentKey, {
            status: AGENT_STATUS.FAILED,
            error: err.message,
          });

          await emit("agent_failed", {
            stage: stageDef.name,
            agentId,
            error: err.message,
            retryable: err.retryable || false,
          });

          anyFailed = true;
          throw err;
        }
      })
    );

    // --- Accumulate successful outputs into context for next stage ---
    for (const result of agentResults) {
      if (result.status === "fulfilled") {
        const { agentId, output } = result.value;
        context[agentId] = output;

        // Merge sources for provenance tracking
        if (output && output.sources) {
          context.sources = [...context.sources, ...output.sources];
        }
      }
    }

    // Store accumulated context
    await redis.set(REDIS_KEYS.context(jobId), JSON.stringify(context));

    // Update job metadata after stage
    await redis.hSet(REDIS_KEYS.job(jobId), {
      updatedAt: nowISO(),
    });
  }

  // --- Job complete ---
  const finalStatus = anyFailed ? JOB_STATUS.PARTIAL : JOB_STATUS.COMPLETED;

  await redis.hSet(REDIS_KEYS.job(jobId), {
    status: finalStatus,
    updatedAt: nowISO(),
  });

  await emit("job_complete", {
    status: finalStatus,
    totalCostUsd,
  });
}

module.exports = { executePipeline };
