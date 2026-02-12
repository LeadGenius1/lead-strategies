// Next.js instrumentation - runs on server startup
// Email Sentinel runs on BACKEND only (Redis). Frontend never connects to Redis.
export async function register() {
  // No Redis/Email Sentinel startup in frontend - backend owns it
}
