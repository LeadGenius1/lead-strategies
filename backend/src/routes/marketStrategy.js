// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — EXPRESS ROUTES
// 8 endpoints: create, status, stream, retry, history, cancel, costs, debug
// All routes require authentication. Debug requires admin.
// ═══════════════════════════════════════════════════════════════

const express = require("express");
const router = express.Router();
const { authenticate, requireAdmin } = require("../middleware/auth");
const { getRedisClient } = require("../config/redis");
const { addJob } = require("../services/marketStrategy/worker");
const { createSSEStream } = require("../services/marketStrategy/sseManager");
const { getCosts } = require("../services/marketStrategy/costTracker");
const {
  REDIS_KEYS,
  ALL_AGENT_IDS,
  STAGES,
  JOB_STATUS,
  AGENT_STATUS,
} = require("../services/marketStrategy/constants");
const { nowISO } = require("../services/marketStrategy/utils");

// All routes require authentication
router.use(authenticate);

// ═══ POST / — Create a new market strategy job ═══
router.post("/", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return res.status(503).json({ success: false, error: "Redis not available" });
    }

    const { targetMarket, icp, competitors, offer, budgetRange, platforms, notes } = req.body;

    // Validation — all fields except notes are required
    const missing = [];
    if (!targetMarket) missing.push("targetMarket");
    if (!icp) missing.push("icp");
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) missing.push("competitors");
    if (!offer) missing.push("offer");
    if (!budgetRange) missing.push("budgetRange");
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) missing.push("platforms");

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missing,
      });
    }

    const businessInputs = { targetMarket, icp, competitors, offer, budgetRange, platforms, notes: notes || "" };
    const jobId = await addJob(businessInputs, req.user.id, redis);

    res.status(201).json({ success: true, jobId });
  } catch (err) {
    console.error("[Market Strategy] Create job error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /history — List user's past runs ═══
// Must be before /:jobId to avoid route conflict
router.get("/history", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const jobIds = await redis.zRangeWithScores(
      REDIS_KEYS.userJobs(req.user.id),
      0, -1,
      { REV: true }
    );

    const jobs = [];
    for (const { value: jobId, score } of jobIds) {
      const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));
      jobs.push({
        jobId,
        status: jobData.status || "unknown",
        createdAt: jobData.createdAt || new Date(score).toISOString(),
        updatedAt: jobData.updatedAt,
        totalCostUsd: parseFloat(jobData.totalCostUsd || "0"),
      });
    }

    res.json({ success: true, jobs });
  } catch (err) {
    console.error("[Market Strategy] History error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /costs — Aggregated costs per day/month ═══
router.get("/costs", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    // Default: last 30 days
    const endDate = req.query.endDate || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const costs = await getCosts(redis, startDate, endDate);
    res.json({ success: true, ...costs });
  } catch (err) {
    console.error("[Market Strategy] Costs error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /:jobId — Job status + all agent outputs ═══
router.get("/:jobId", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const { jobId } = req.params;
    const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));

    if (!jobData || !jobData.status) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Verify ownership
    if (jobData.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Fetch agent states
    const agents = {};
    for (const agentId of ALL_AGENT_IDS) {
      const agentData = await redis.hGetAll(REDIS_KEYS.agentState(jobId, agentId));
      agents[agentId] = {
        status: agentData.status || AGENT_STATUS.PENDING,
        startedAt: agentData.startedAt || null,
        completedAt: agentData.completedAt || null,
        output: agentData.output ? JSON.parse(agentData.output) : null,
        error: agentData.error || null,
      };
    }

    res.json({
      success: true,
      jobId,
      status: jobData.status,
      createdAt: jobData.createdAt,
      updatedAt: jobData.updatedAt,
      currentStage: parseInt(jobData.currentStage || "0", 10),
      totalCostUsd: parseFloat(jobData.totalCostUsd || "0"),
      businessInputs: jobData.businessInputs ? JSON.parse(jobData.businessInputs) : null,
      agents,
    });
  } catch (err) {
    console.error("[Market Strategy] Get job error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /:jobId/stream — SSE (replay + live + heartbeat) ═══
router.get("/:jobId/stream", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const { jobId } = req.params;
    const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));

    if (!jobData || !jobData.status) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Verify ownership
    if (jobData.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Hand off to SSE manager
    createSSEStream(res, jobId, redis);
  } catch (err) {
    console.error("[Market Strategy] Stream error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ POST /:jobId/retry — Re-run failed agents ═══
router.post("/:jobId/retry", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const { jobId } = req.params;
    const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));

    if (!jobData || !jobData.status) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (jobData.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Only allow retry on partial/failed jobs
    if (jobData.status !== JOB_STATUS.PARTIAL && jobData.status !== JOB_STATUS.FAILED) {
      return res.status(400).json({ success: false, error: `Cannot retry job with status: ${jobData.status}` });
    }

    // Reset failed agents to pending
    for (const agentId of ALL_AGENT_IDS) {
      const agentData = await redis.hGetAll(REDIS_KEYS.agentState(jobId, agentId));
      if (agentData.status === AGENT_STATUS.FAILED) {
        await redis.hSet(REDIS_KEYS.agentState(jobId, agentId), {
          status: AGENT_STATUS.PENDING,
          error: "",
        });
      }
    }

    // Re-queue the job
    await redis.hSet(REDIS_KEYS.job(jobId), {
      status: JOB_STATUS.QUEUED,
      error: "",
      updatedAt: nowISO(),
    });

    const { getQueue } = require("../services/marketStrategy/worker");
    const q = getQueue();
    if (!q) return res.status(503).json({ success: false, error: "Queue not available" });

    await q.add("run-strategy", { jobId }, { jobId: `${jobId}-retry-${Date.now()}` });

    res.json({ success: true, jobId, message: "Job re-queued for retry" });
  } catch (err) {
    console.error("[Market Strategy] Retry error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ DELETE /:jobId — Cancel a running job ═══
router.delete("/:jobId", async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const { jobId } = req.params;
    const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));

    if (!jobData || !jobData.status) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    if (jobData.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Update status to cancelled
    await redis.hSet(REDIS_KEYS.job(jobId), {
      status: JOB_STATUS.CANCELLED,
      updatedAt: nowISO(),
    });

    // Try to remove from BullMQ queue
    try {
      const { getQueue } = require("../services/marketStrategy/worker");
      const q = getQueue();
      if (q) {
        const job = await q.getJob(jobId);
        if (job) await job.remove();
      }
    } catch {
      // Job may already be processing — cancellation is best-effort
    }

    res.json({ success: true, jobId, status: "cancelled" });
  } catch (err) {
    console.error("[Market Strategy] Cancel error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══ GET /:jobId/debug — Admin-only debug info ═══
router.get("/:jobId/debug", requireAdmin, async (req, res) => {
  try {
    const redis = getRedisClient();
    if (!redis) return res.status(503).json({ success: false, error: "Redis not available" });

    const { jobId } = req.params;
    const jobData = await redis.hGetAll(REDIS_KEYS.job(jobId));

    if (!jobData || !jobData.status) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    // Context size
    const contextRaw = await redis.get(REDIS_KEYS.context(jobId));
    const contextSizeBytes = contextRaw ? Buffer.byteLength(contextRaw) : 0;

    // Agent output sizes
    const agentOutputSizes = {};
    for (const agentId of ALL_AGENT_IDS) {
      const agentData = await redis.hGetAll(REDIS_KEYS.agentState(jobId, agentId));
      agentOutputSizes[agentId] = agentData.output ? Buffer.byteLength(agentData.output) : null;
    }

    // Stage statuses
    const stages = {};
    for (const [idx, stageDef] of Object.entries(STAGES)) {
      const agentStatuses = await Promise.all(
        stageDef.agents.map(async (agentId) => {
          const d = await redis.hGetAll(REDIS_KEYS.agentState(jobId, agentId));
          return d.status || AGENT_STATUS.PENDING;
        })
      );
      const allCompleted = agentStatuses.every((s) => s === AGENT_STATUS.COMPLETED);
      const anyRunning = agentStatuses.some((s) => s === AGENT_STATUS.RUNNING);
      stages[idx] = {
        name: stageDef.name,
        agents: stageDef.agents,
        status: allCompleted ? "completed" : anyRunning ? "running" : "pending",
      };
    }

    // Event count
    const eventsCount = await redis.lLen(REDIS_KEYS.events(jobId));

    // Circuit breaker states
    const circuitBreaker = require("../services/marketStrategy/providers/circuitBreaker");
    const circuitBreakers = {};
    for (const provider of ["firecrawl", "perplexity", "chatgpt"]) {
      const cb = await circuitBreaker.getState(redis, provider);
      circuitBreakers[provider] = cb.state;
    }

    // Elapsed time
    const createdAt = jobData.createdAt ? new Date(jobData.createdAt).getTime() : Date.now();
    const elapsedMs = Date.now() - createdAt;

    res.json({
      success: true,
      jobId,
      status: jobData.status,
      currentStage: parseInt(jobData.currentStage || "0", 10),
      contextSizeBytes,
      stages,
      circuitBreakers,
      eventsCount,
      agentOutputSizes,
      totalCostUsd: parseFloat(jobData.totalCostUsd || "0"),
      elapsedMs,
    });
  } catch (err) {
    console.error("[Market Strategy] Debug error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
