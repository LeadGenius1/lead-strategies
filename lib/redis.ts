// Redis connection for BullMQ - optional; agent runs only when REDIS_URL is set
import IORedis from 'ioredis';

let connection: IORedis | null = null;

export function hasRedis(): boolean {
  return !!(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL);
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
