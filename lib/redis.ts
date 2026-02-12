// Redis connection for BullMQ - optional; agent runs only when REDIS_URL is set
import IORedis from 'ioredis';

let connection: IORedis | null = null;
let connectionFailed = false;

export function hasRedis(): boolean {
  return !!(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);
}

/** Check if Redis is reachable (avoids crash when redis.railway.internal is in a project without Redis) */
export async function canConnectToRedis(): Promise<boolean> {
  if (connectionFailed) return false;
  const url = process.env.REDIS_URL;
  if (!url) return false;
  try {
    const test = new IORedis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      connectTimeout: 5000,
    });
    await test.ping();
    await test.quit();
    return true;
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
      console.warn('[Redis] Skipping Email Sentinel - Redis unreachable:', (err as Error).message);
      connectionFailed = true;
    }
    return false;
  }
}

export function getRedisConnection(): IORedis {
  if (!connection) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL required for Email Sentinel (BullMQ uses IORedis)');
    }
    connection = new IORedis(url, { maxRetriesPerRequest: null });
  }
  return connection;
}
