# Scaling to 1M+ Users/Subscribers

**Target:** Platform readiness for 1M+ active users across LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.IO, UltraLead  
**Last Updated:** February 12, 2026

---

## Executive Summary

| Area | Current | At 1M+ | Priority |
|------|---------|--------|----------|
| Rate limiting | 100 req/15min global | Tiered, per-user, Redis | High |
| Database | Single Postgres, no pool config | PgBouncer + pool + replicas | High |
| Caching | Redis (rate limit only) | Session, API response, hot data | High |
| Auth | Stateless JWT | JWT + Redis session, token rotation | Medium |
| Email | Mailgun, sync send | Queue (BullMQ), dedicated IPs | Medium |
| Monitoring | Basic logs | APM, Sentry, metrics, alerting | High |

---

## 1. Database

### Connection Pooling
- **Current:** Prisma default (no explicit pool)
- **At scale:** Use PgBouncer or Prisma connection pool in URL
  ```
  DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30"
  ```
- **1M users:** PgBouncer in transaction mode; 1–2 connections per app instance; read replicas for analytics/dashboards

### Indexing
- Add composite indexes for high-traffic queries:
  - `(userId, createdAt)` on leads, campaigns, conversations
  - `(userId, status)` on leads, deals
  - `(videoId, createdAt)` on video_views
- Review slow-query logs regularly

### Sharding (Future)
- User sharding by `userId` hash when single DB becomes bottleneck
- Separate services: auth, leads, video, email

---

## 2. Rate Limiting

### Current
- 100 requests / 15 min per IP (global)
- Redis-backed when REDIS_URL set
- Webhooks excluded

### Recommended for 1M+

```
Tier 1–2 (LeadSite):  300 req/15min
Tier 3–4 (ClientContact/VideoSite): 500 req/15min  
Tier 5 (UltraLead):   1000 req/15min
Unauthenticated:      50 req/15min (signup, health)
```

- Per-user limits via Redis key: `rl:{userId}:{window}`
- Separate limits for expensive endpoints:
  - AI: 20/min per user
  - Email send: 50/min per user
  - Video upload: 10/hour per user

---

## 3. Caching

### Redis Usage Today
- Rate limiting only

### Recommended
- **Session cache:** JWT blacklist on logout; optional session metadata
- **API response cache:** Dashboard stats, channel list (short TTL)
- **Hot data:** User tier, feature flags, tier limits
- **Cache invalidation:** On user/tier/plan updates

### CDN
- Static assets (images, JS, CSS)
- Video thumbnails and metadata (if public)

---

## 4. Auth & Sessions

### Current
- Stateless JWT, no rotation
- Cookie + Bearer token

### At Scale
- **Token rotation:** Refresh tokens with short-lived access tokens
- **Revocation:** Redis blacklist for revoked tokens
- **Concurrent sessions:** Limit per user (e.g. 5 devices)
- **MFA:** Enforce for admin and high-value accounts

---

## 5. Email Delivery

### Current
- Mailgun sync send
- BullMQ in Email Sentinel (Redis)

### At Scale
- **Queue all sends:** BullMQ with workers
- **Dedicated IPs:** Per tier or domain for reputation
- **Bounce/complaint handling:** Webhooks, auto-disable problematic senders
- **Throughput:** Scale workers horizontally

---

## 6. API & Backend

### Pagination
- Enforce max `limit` (e.g. 100) on all list endpoints
- Cursor-based pagination for large tables (leads, videos)
- Default page size 20–50

### Async Jobs
- AI scoring, email generation, analytics → background jobs
- Webhooks: idempotency keys for Stripe, Mailgun, Meta, Twitter

### Horizontal Scaling
- Stateless API; scale instances behind load balancer
- Shared Redis for rate limit and cache
- Shared Postgres (or read replicas)

---

## 7. Frontend

- **Edge caching:** Vercel/Railway edge for static and API routes where possible
- **Image optimization:** Next.js Image, WebP, lazy load
- **Code splitting:** Route-level and component-level
- **Monitoring:** Core Web Vitals, error boundaries

---

## 8. Monitoring & Observability

### Must-Have
- **APM:** Response times, error rates, DB query times (e.g. Sentry, Datadog, New Relic)
- **Error tracking:** Sentry or similar
- **Log aggregation:** Structured logs, correlation IDs
- **Alerts:** Error spike, latency, DB connections, queue depth
- **Health checks:** Liveness + readiness (/health vs /ready)

### Metrics to Track
- Requests/sec, error rate, p95/p99 latency
- DB connection count, query time
- Redis memory, hit rate
- Queue length (BullMQ)
- Active users, signups/day

---

## 9. Security at Scale

- **DDoS:** Cloudflare or similar in front of Railway
- **Per-user rate limits:** Prevent single-user abuse
- **Audit logs:** Sensitive actions (payouts, plan changes)
- **Secrets:** Rotate JWT_SECRET, API keys periodically
- **Input validation:** Centralized, strict limits on payload size

---

## 10. Quick Wins (Implement Now)

| Change | Effort | Impact |
|--------|--------|--------|
| Increase global rate limit to 300 | 5 min | Reduces false 429s |
| Add `connection_limit=20` to DATABASE_URL | 2 min | Better connection reuse |
| Enforce `limit ≤ 100` on list endpoints | 1–2 hrs | Prevents heavy queries |
| Add Sentry | 1 hr | Visibility into errors |
| Cache `/api/v1/dashboard` response 60s | 2 hrs | Cuts DB load |

---

## 11. Phased Roadmap

| Phase | Focus | Timeline |
|-------|-------|----------|
| 1 | Quick wins, monitoring, tiered rate limits | 1–2 weeks |
| 2 | Redis caching (sessions, hot data), queue email | 2–4 weeks |
| 3 | PgBouncer, read replicas, CDN | 1–2 months |
| 4 | Token rotation, sharding exploration | 2–3 months |

---

## References

- [PROCESS_COMPLETE.md](./PROCESS_COMPLETE.md) — Run order, env vars
- [CHANGES_VERIFICATION.md](./CHANGES_VERIFICATION.md) — Auth safety
- [RAILWAY_STATUS.md](./RAILWAY_STATUS.md) — Current deploy status
