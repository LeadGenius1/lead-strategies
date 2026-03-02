// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — SSE MANAGER
// Handles: replay from Redis list, live pub/sub, heartbeat, cleanup.
// Pub/sub uses a dedicated ioredis subscriber (same pattern as Email Sentinel).
// Main app Redis (node-redis v4) is used for RPUSH, LRANGE, and reads.
// ═══════════════════════════════════════════════════════════════

const IORedis = require("ioredis");
const { REDIS_KEYS, HEARTBEAT_INTERVAL_MS } = require("./constants");

/**
 * Publish an SSE event — stores for replay + broadcasts to live subscribers.
 * Called from pipeline executor and worker.
 *
 * @param {import("redis").RedisClientType} redis - node-redis v4 client
 * @param {string} jobId
 * @param {object} event - { type: string, ...data }
 */
async function publishEvent(redis, jobId, event) {
  const payload = JSON.stringify(event);

  // 1. Append to replay list (RPUSH for ordered replay)
  await redis.rPush(REDIS_KEYS.events(jobId), payload);

  // 2. Broadcast to live subscribers
  await redis.publish(REDIS_KEYS.liveChannel(jobId), payload);
}

/**
 * Create an SSE stream for a client connection.
 * Steps: set headers → replay history → subscribe to live → heartbeat → cleanup.
 *
 * @param {import("express").Response} res - Express response object
 * @param {string} jobId
 * @param {import("redis").RedisClientType} redis - node-redis v4 client (for LRANGE replay)
 */
function createSSEStream(res, jobId, redis) {
  // --- SSE Headers ---
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no", // Disable Nginx buffering if proxied
  });
  res.flushHeaders();

  let subscriber = null;
  let heartbeatInterval = null;
  let closed = false;

  /**
   * Send a single SSE event to the client.
   */
  function send(eventType, data) {
    if (closed) return;
    res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Send a raw JSON payload (already has .type field).
   */
  function sendRaw(payload) {
    if (closed) return;
    try {
      const parsed = JSON.parse(payload);
      if (parsed.type) {
        res.write(`event: ${parsed.type}\ndata: ${payload}\n\n`);
      }
    } catch {
      // Skip malformed payloads
    }
  }

  /**
   * Cleanup: unsubscribe, clear heartbeat, end response.
   */
  function cleanup() {
    if (closed) return;
    closed = true;

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    if (subscriber) {
      const channel = REDIS_KEYS.liveChannel(jobId);
      subscriber.unsubscribe(channel).catch(() => {});
      subscriber.disconnect();
      subscriber = null;
    }
  }

  // --- Cleanup on client disconnect ---
  res.on("close", cleanup);

  // --- Start async setup ---
  (async () => {
    try {
      // 1. Replay: read all stored events
      const events = await redis.lRange(REDIS_KEYS.events(jobId), 0, -1);
      for (const payload of events) {
        sendRaw(payload);
      }

      if (closed) return; // Client disconnected during replay

      // 2. Subscribe: dedicated ioredis connection for pub/sub
      if (process.env.REDIS_URL) {
        subscriber = new IORedis(process.env.REDIS_URL, {
          maxRetriesPerRequest: null,
          lazyConnect: true,
        });
        await subscriber.connect();

        const channel = REDIS_KEYS.liveChannel(jobId);
        await subscriber.subscribe(channel);

        subscriber.on("message", (_ch, message) => {
          sendRaw(message);
        });
      }

      // 3. Heartbeat: send every 30s if no other event
      heartbeatInterval = setInterval(() => {
        if (closed) return;
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);
      }, HEARTBEAT_INTERVAL_MS);

    } catch (err) {
      // If setup fails, send error and close
      if (!closed) {
        send("error", { message: "SSE setup failed: " + err.message });
        res.end();
        cleanup();
      }
    }
  })();
}

module.exports = { publishEvent, createSSEStream };
