# AI Lead Strategies Platform Audit Report
**Date:** February 12, 2026  
**Type:** Read-only discovery — no code changes

---

## 1. Executive Summary

The AI Lead Strategies platform is a unified monorepo serving five products (LeadSite.AI, LeadSite.IO, ClientContact.IO, VideoSite.AI, UltraLead) with a Next.js frontend and Express backend. **OAuth login was recently fixed** (POST /api/auth/oauth/callback added to backend). Critical gaps: **VideoSite videosite.js references Prisma models VideoView, CreatorEarning, Payout that do not exist** in the schema—earnings, payouts, and authenticated view tracking will throw at runtime. **Channel model is missing** (channels.js references db.channel). Redis rate-limiting uses `rate-limit-redis` but logs show "RedisStore is not a constructor". Frontend AuthContext fetches `/api/auth/me` which may not exist as a dedicated route (NextAuth provides `/session`). Overall backend routes are mostly wired; VideoSite monetization and ClientContact channel persistence are blocked by missing schema models.

---

## 2. Phase 1: Repository Structure

### Directory Structure (Key Paths)

```
lead-strategies-repo/
├── app/                    # Next.js App Router
│   ├── (auth)/             # signup, login, forgot-password, reset-password
│   ├── (dashboard)/        # dashboard, prospects, campaigns, crm, inbox, videos, websites, etc.
│   ├── api/                # Next.js API routes (auth, user, leads, etc.)
│   ├── admin/              # Admin dashboard
│   ├── watch/[id]/         # Public video viewing
│   └── [platforms]/        # leadsite-ai, leadsite-io, clientcontact-io, ultralead, videosite-ai
├── backend/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/         # 25+ route files
│       ├── middleware/     # auth, errorHandler, logger
│       ├── config/        # redis
│       ├── emailSentinel/
│       └── services/
├── components/
├── contexts/               # AuthContext
├── lib/                    # api, auth, redis, email-oauth, email-pool
└── prisma/                 # Root schema (duplicate? backend uses backend/prisma)
```

### Package.json Locations

| Location | Purpose | Key Deps |
|----------|---------|----------|
| **Root** package.json | Next.js frontend | next@14.2, @prisma/client@5.7, axios, next-auth, stripe |
| **backend/** package.json | Express API | express, @prisma/client@5.22, jwt, @aws-sdk/client-s3, stripe |

### Dependency Notes

- **Prisma version mismatch:** Root `@prisma/client@5.7.1`, backend `@prisma/client@5.22.0`. Script uses `prisma generate --schema=backend/prisma/schema.prisma` so backend schema wins.
- **Frontend has** next-auth, @next-auth/prisma-adapter (adapter disabled, JWT used), bullmq, ioredis—some may be vestigial.
- **No bcrypt** in backend—OAuth uses crypto.createHash for password placeholder.

---

## 3. Phase 2: Authentication System

### Auth Files

| File | Purpose |
|------|---------|
| `backend/src/routes/auth.js` | Login, register, logout, me, **POST /oauth/callback** (recently added) |
| `backend/src/middleware/auth.js` | authenticate, optionalAuth, requireAdmin, requireFeature, checkLeadLimit |
| `app/api/auth/oauth/google/route.js` | Redirect to Google OAuth |
| `app/api/auth/oauth/callback/route.js` | Receives Google redirect, POSTs to backend oauth/callback, sets cookie |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth (Google, Azure AD), JWT sessions |
| `lib/auth.js` | signup, login, logout, getCurrentUser (uses api.get) |

### Auth Flow

1. **Google OAuth:** User → `/api/auth/oauth/google` (Next.js) → Google → `/api/auth/oauth/callback` (Next.js GET) → fetch backend `POST /api/auth/oauth/callback` → JWT + user → set cookie → redirect.
2. **Backend** auth mounted at `/api/auth` and `/api/v1/auth` (index.js lines 179, 218).
3. **Token storage:** Cookie `token` (httpOnly: false for client access).
4. **Validation:** JWT in `Authorization: Bearer <token>`; middleware `authenticate` verifies.

### Status

- **OAuth callback:** FIXED — POST /api/auth/oauth/callback exists and is live.
- **AuthContext** fetches `fetch('/api/auth/me')` — relative URL hits frontend. No `app/api/auth/me/route.js`. NextAuth provides `/api/auth/session`, not `/me`. **Potential gap:** /api/auth/me may 404 unless proxied or implemented.
- **lib/auth.js** getCurrentUser uses `api.get('/api/auth/me')` — goes to NEXT_PUBLIC_API_URL (backend), so backend `/api/auth/me` is used when calling through lib. AuthContext uses raw fetch to same origin = frontend.

---

## 4. Phase 3: Database & Prisma Schema

### Schema Location

- **Primary:** `backend/prisma/schema.prisma`
- **Root:** `prisma/schema.prisma` exists (possibly duplicate or legacy)

### Models Present

| Category | Models |
|----------|--------|
| Auth | User, AdminUser, AdminSession, AdminAuditLog |
| LeadSite.AI | Lead, Campaign, CampaignLead, EmailTemplate, EmailEvent |
| LeadSite.IO | Website |
| ClientContact | Conversation, Message, CannedResponse, AutoResponse, ConversationNote |
| UltraLead CRM | Company, Contact, Deal, Activity, Call, Document, Team, TeamMember, Pipeline, PipelineStage, Sequence, SequenceStep |
| VideoSite | **Video** only |
| Billing | User (Stripe fields), EmailPoolSubscription |
| System | SystemHealthMetric, DiagnosticReport, RepairHistory, LearningPattern, Prediction, SecurityIncident, PerformanceMetric, SystemAlert |
| Email | UserEmailAccount, domain_pool, domain_mailboxes, domain_acquisition_logs, email_reminders, email_verification_tokens, subscription_logs |

### Models MISSING (Referenced in Code)

| Model | Used In | Impact |
|-------|---------|--------|
| **VideoView** | videosite.js (view tracking) | Runtime error on POST /videos/:id/view |
| **CreatorEarning** | videosite.js (earnings) | Runtime error on earnings, payouts |
| **Payout** | videosite.js (payouts) | Runtime error on payout request/history |
| **Channel** | channels.js | Runtime error on GET /channels (db.channel) |

### Migrations

- **No** `backend/prisma/migrations/` directory found. Likely using `prisma db push` or migrations elsewhere.

---

## 5. Phase 4: API Routes Inventory

### Backend Route Mounting (index.js)

| Mount Path | Route Module | Platform |
|------------|--------------|----------|
| /api/v1/auth, /api/auth | auth.js | All |
| /api/v1/dashboard | dashboard.js | LeadSite.AI |
| /api/v1/campaigns | campaigns.js | LeadSite.AI |
| /api/v1/leads | leads.js | LeadSite.AI |
| /api/v1/emails | emails.js | LeadSite.AI |
| /api/v1/websites | websites.js | LeadSite.IO |
| /api/v1/videosite | videosite.js | VideoSite.AI |
| /api/v1/videos, /api/videos | videos.js | VideoSite (legacy + public) |
| /api/v1/clientcontact | ultralead/index.js | ClientContact.IO |
| /api/v1/crm | crm.js | UltraLead |
| /api/v1/channels | channels.js | ClientContact.IO |
| /api/v1/copilot | copilot.js | LeadSite.AI |
| /api/v1/templates | templates.js | LeadSite.IO |
| /api/v1/agents | agents.js | UltraLead |
| /api/v1/stripe | stripe.js | Billing |
| /api/v1/payouts | payouts.js | VideoSite |
| /api/v1/clips | clips.js | VideoSite |
| /api/v1/publish | publish.js | Social |
| /api/v1/email-sentinel | emailSentinel.js | Email Sentinel |
| /api/master | master-validation.js | Agent 6 |
| /admin | adminRoutes.js | Admin |

### VideoSite.AI Routes

| Endpoint | Status | Notes |
|----------|--------|-------|
| POST /upload/presign | ✅ | R2 presigned URL |
| POST /upload/complete | ✅ | Updates video record |
| GET/POST/DELETE /videos | ✅ | CRUD |
| POST /videos/:id/view | ⚠️ | Uses VideoView, CreatorEarning — models missing |
| GET /earnings | ⚠️ | Uses CreatorEarning |
| GET /earnings/history | ⚠️ | Uses CreatorEarning |
| POST /payouts/request | ⚠️ | Uses CreatorEarning, Payout |
| GET /payouts, /payouts/history | ⚠️ | Uses Payout |
| GET /analytics | ⚠️ | Uses VideoView |
| Stripe Connect | ✅ | stripe/connect, stripe/status |

### Public Video Routes (videos.js)

| Endpoint | Status |
|----------|--------|
| GET /:id/public | ✅ |
| POST /:id/track-view | ✅ |

### LeadSite.IO Routes

| Endpoint | Status |
|----------|--------|
| GET/POST /websites | ✅ |
| GET/PUT/DELETE /:id | ✅ |
| POST /generate | ✅ |
| POST /:id/publish, /:id/unpublish | ✅ |
| GET /subdomain/:subdomain | ✅ (public) |

### ClientContact.IO Routes

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /channels | ⚠️ | Uses db.channel — model missing |
| GET /connections | ✅ | Mock |
| GET /oauth/:channelId/authorize | ✅ | Placeholder URL |
| POST /connect | ⚠️ | References db |

---

## 6. Phase 5: Frontend Pages

### Dashboard Routes

| Path | Platform | Exists |
|------|----------|--------|
| /dashboard | Aggregator | ✅ |
| /prospects | LeadSite.AI | ✅ |
| /lead-hunter | LeadSite.AI | ✅ |
| /proactive-hunter | LeadSite.AI | ✅ |
| /campaigns | LeadSite.AI | ✅ |
| /replies | LeadSite.AI | ✅ |
| /inbox | ClientContact.IO | ✅ |
| /inbox/settings/channels | ClientContact.IO | ✅ |
| /crm | UltraLead | ✅ |
| /crm/deals | UltraLead | ✅ |
| /videos | VideoSite.AI | ✅ |
| /videos/upload | VideoSite.AI | ✅ |
| /videos/[id] | VideoSite.AI | ✅ |
| /videos/analytics | VideoSite.AI | ✅ |
| /websites | LeadSite.IO | ✅ |
| /earnings | VideoSite.AI | ✅ |
| /settings | All | ✅ |
| /analytics | LeadSite.AI | ✅ |

### API Integration

- **Base URL:** `NEXT_PUBLIC_API_URL` (default `https://api.aileadstrategies.com`)
- **Auth:** Cookie `token`; api interceptor adds `Authorization: Bearer`
- **Hardcoded URLs:** Some fallbacks to api.aileadstrategies.com in code

---

## 7. Phase 6: External Service Integrations

### Cloudflare R2

- **Config:** CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, CLOUDFLARE_R2_BUCKET, CLOUDFLARE_R2_PUBLIC_URL
- **Presigned URLs:** PutObjectCommand + getSignedUrl (videosite.js)
- **Public URL:** `${R2_PUBLIC_URL}/${key}` set on video create
- **CORS:** Not audited in code

### PostgreSQL

- **Connection:** DATABASE_URL, DATABASE_PUBLIC_URL (Railway fallback)
- **Prisma:** Lazy-loaded in most routes via getPrisma()

### Redis

- **Uses:** Rate limiting (rate-limit-redis), Email Sentinel (BullMQ)
- **Config:** REDIS_URL
- **Issue:** Logs show "RedisStore is not a constructor" — rate-limit-redis API may have changed

### Stripe

- **Backend:** stripe.js (create-checkout, create-portal), videosite (Connect for payouts)
- **Webhooks:** /api/v1/webhooks/stripe (raw body)
- **Email pool:** STRIPE_SECRET_KEY, EMAIL_POOL_STRIPE_WEBHOOK_SECRET, EMAIL_POOL_STRIPE_PRICE_ID

### Mailgun / Email

- **Pool:** POOL_SMTP_HOST, POOL_SMTP_USERNAME, POOL_SMTP_PASSWORD
- **Two-tier:** UserEmailAccount, EmailPoolSubscription

### Social / ClientContact Channels

- **OAuth:** Placeholder URLs (example.com). Real OAuth for Microsoft/LinkedIn/Google (email accounts) exists in lib/email-oauth, app/api/user/email-accounts/oauth

---

## 8. Phase 7: Critical Gap Summary

### BROKEN

| Item | Location | Error |
|------|----------|-------|
| VideoSite earnings/payouts/view (auth) | videosite.js | Prisma: VideoView, CreatorEarning, Payout models do not exist |
| Channels list (DB) | channels.js | Prisma: Channel model does not exist |
| Redis rate-limit store | backend/config/redis.js | "RedisStore is not a constructor" |

### INCOMPLETE

| Item | Exists | Missing |
|------|--------|---------|
| Auth /api/auth/me (frontend) | AuthContext calls it | No app/api/auth/me/route.js; may 404 or rely on NextAuth |
| LeadSite.IO templates | templates.js | Template model not in schema; templates from JSON/file |
| ClientContact channel OAuth | Placeholder authUrl | Real OAuth per channel not implemented |
| Videosite qualified view tracking | POST /videos/:id/view | Blocked by VideoView model |

### WORKING

| Item | Verification |
|------|--------------|
| OAuth Google login | POST /api/auth/oauth/callback returns 400 on empty body (route exists) |
| Video upload (presign + complete) | Implemented |
| Public watch /api/v1/videos/:id/public | Implemented |
| Public track-view | Implemented |
| Website CRUD + generate | Implemented |
| Lead/Campaign CRUD | Implemented |
| Basic Stripe checkout/portal | Implemented |

---

## 9. Phase 8: Dependency Chain Mapping

### Feature: VideoSite Qualified View + Earnings

**Status:** INCOMPLETE (blocked)

**Blocking:** VideoView, CreatorEarning, Payout models missing

**Dependencies:**
- Add VideoView, CreatorEarning, Payout to schema
- Run migration / prisma db push
- Verify videosite.js field names match schema

**Files:** backend/prisma/schema.prisma, (migration)

---

### Feature: ClientContact Channel Persistence

**Status:** INCOMPLETE (blocked)

**Blocking:** Channel model missing

**Dependencies:**
- Add Channel model to schema
- Run migration
- Fix channels.js to use correct field names

**Files:** backend/prisma/schema.prisma, backend/src/routes/channels.js

---

### Feature: Redis Rate Limiting

**Status:** BROKEN

**Issue:** rate-limit-redis API change or incorrect usage

**Files:** backend/src/config/redis.js, backend/src/index.js (limiter config)

---

## 10. Output Summary

### Platform-by-Platform Status Matrix

| Platform | % Complete | Critical Blockers | Missing Features |
|-----------|------------|------------------|------------------|
| LeadSite.AI | 85% | None | Email pool wiring, signup→backend |
| LeadSite.IO | 90% | None | Template persistence |
| ClientContact.IO | 60% | Channel model | Real channel OAuth, 22+ channels |
| VideoSite.AI | 70% | VideoView, CreatorEarning, Payout | Qualified view tracking, payouts |
| UltraLead | 85% | None | Minor integrations |

### Prioritized Fix Order

1. **VideoView, CreatorEarning, Payout models** — Unblocks VideoSite earnings/payouts (HIGH)
2. **Channel model** — Unblocks ClientContact channels (MEDIUM)
3. **Redis rate-limit** — Fix or remove Redis store (MEDIUM)
4. **/api/auth/me** — Add route or ensure AuthContext uses correct endpoint (LOW)

### File Change Manifest

| File | Change | Risk |
|------|--------|------|
| backend/prisma/schema.prisma | Add VideoView, CreatorEarning, Payout, Channel | MEDIUM |
| backend/src/config/redis.js | Fix RedisStore usage or downgrade rate-limit-redis | LOW |
| app/api/auth/me/route.js | Create proxy to backend /api/auth/me | LOW |

### New Files Required

- None for core fixes; schema + migrations only.

### Environment Variables Audit

| Variable | Required For | Likely in Railway |
|----------|--------------|-------------------|
| DATABASE_URL | All | Yes |
| DATABASE_PUBLIC_URL | Railway | Yes |
| JWT_SECRET | Auth | Yes |
| GOOGLE_CLIENT_ID | OAuth | Yes (frontend) |
| GOOGLE_CLIENT_SECRET | OAuth callback | Backend only |
| REDIS_URL | Rate limit, Email Sentinel | Optional |
| CLOUDFLARE_* | Video upload | If R2 used |
| STRIPE_SECRET_KEY | Payments | Optional |
| ANTHROPIC_API_KEY | AI features | Optional |
| NEXT_PUBLIC_API_URL | Frontend API calls | Yes |
| NEXTAUTH_URL, NEXTAUTH_SECRET | NextAuth | Yes |

---

## 11. Unclear / Manual Verification

1. **Exact deployment topology:** Which Railway service is aileadstrategies.com vs api.aileadstrategies.com.
2. **AuthContext vs lib/auth:** AuthContext uses fetch('/api/auth/me'); lib/auth getCurrentUser uses api.get. Which is actually used by dashboard layout?
3. **rate-limit-redis version:** Check package version vs docs for correct RedisStore import.
4. **Prisma schema sync:** Is backend using backend/prisma or root prisma? npm scripts point to backend/prisma.

---

*End of Audit Report*
