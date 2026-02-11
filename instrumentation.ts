// Next.js instrumentation - runs on server startup
// Starts Email Infrastructure Sentinel (8th Agent) when REDIS_URL is set
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.REDIS_URL) {
    try {
      const { createEmailSentinelWorker } = await import('@/agents/email-infrastructure-sentinel/worker');
      const { scheduleHealthChecks } = await import('@/agents/email-infrastructure-sentinel');
      createEmailSentinelWorker();
      scheduleHealthChecks().then(() => {
        console.log('[Worker] Email Infrastructure Sentinel started');
      }).catch((err) => {
        console.error('[Worker] Email Sentinel schedule failed:', err);
      });
    } catch (err) {
      console.warn('[Worker] Email Sentinel skipped:', (err as Error).message);
    }
  }
}
