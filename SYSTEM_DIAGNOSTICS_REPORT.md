# System Diagnostics Report
**Date:** 2026-02-10  
**Project:** AI Lead Strategies (lead-strategies-build)

---

## Executive summary

| Category        | Status    | Notes                                      |
|----------------|-----------|--------------------------------------------|
| **Connectivity** | OK       | Frontend + API health endpoints reachable   |
| **Build**       | OK       | Next.js build succeeds with minor warnings |
| **Stability**   | Degraded | Critical backend bug (see below)            |
| **Performance** | OK       | Build output reasonable, CSP/headers set    |
| **Security**    | Needs attention | Axios + Next.js vulnerabilities       |

---

## 1. Connectability

### External endpoints (live)

| Endpoint                              | Status  | Response                                |
|---------------------------------------|---------|-----------------------------------------|
| https://aileadstrategies.com/api/health | 200 OK  | `{"status":"ok","service":"frontend"}`  |
| https://api.aileadstrategies.com/health | 200 OK  | `{"status":"healthy"}`                  |

### API configuration

- **NEXT_PUBLIC_API_URL:** `https://api.aileadstrategies.com` (used consistently)
- **lib/api.js:** baseURL correct, auth interceptor present
- **CORS:** aileadstrategies.com, leadsite.ai, localhost in allowed origins
- **CSP (middleware.js):** `connect-src` includes `https://api.aileadstrategies.com`, `https://api.stripe.com`

### Auth flow

- Login: `api.post('/api/v1/auth/login')` → backend
- Signup: `api.post('/api/v1/auth/signup')` → backend
- Token stored in cookie; 401 clears token and rejects

---

## 2. Performance

### Next.js build (78 pages)

- **Build time:** ~87s
- **First Load JS (shared):** 87.3 kB
- **Largest pages:** `/crm/deals` (20.5 kB), `/inbox` (20.2 kB), `/lead-hunter` (8.91 kB)
- **Optimizations:** `swcMinify`, `compress`, image formats (avif, webp)

### Build warnings (non-blocking)

1. **BullMQ:** `Critical dependency: the request of a dependency is an expression` (child-processor.js)
2. **Dynamic routes:** OAuth routes use `headers`/`searchParams` — expected for API routes (not static)

---

## 3. Stability

### Critical: Backend crash on startup

**Problem:** `emailRoutes` is used but **never imported** in `backend/src/index.js`.

```
ReferenceError: emailRoutes is not defined
    at Object.<anonymous> (backend/src/index.js:170:27)
```

**Fix:** Add `const emailRoutes = require('./routes/emails');` to imports.

**Impact:** Any fresh run of the backend from this repo (local or deploy) will crash before handling requests.

### Railway deployment

| Item              | Value                                |
|-------------------|--------------------------------------|
| Frontend start    | `node start.js`                      |
| Backend start     | `node src/index.js` (railway.json)   |
| Health check path | `/api/health` (railway.toml)         |
| Memory limit      | 512Mi                                |
| Restart policy    | ON_FAILURE, max 10 retries           |

### Error handling

- **Backend:** Express error handler for Prisma, JWT, validation; production hides stack traces
- **Frontend:** `start.js` handles SIGTERM, SIGINT, uncaughtException, unhandledRejection
- **Redis:** Reconnect strategy (10 retries), fallback to in-memory rate limiting

### Rate limiting

- 100 req/15 min per IP, in-memory (Redis store created but not wired; requires restart to use Redis)
- Webhooks skipped

---

## 4. Security

### Dependency vulnerabilities (npm audit)

| Package | Severity | Issue                                  | Fix available     |
|---------|----------|----------------------------------------|-------------------|
| **axios** | High   | DoS via `__proto__` in mergeConfig      | Yes (upgrade)     |
| **next**  | High   | RSC deserialization DoS (GHSA-h25m-26qc-wcjf) | Yes (15.0.8+) |
| **next**  | Moderate | Image Optimizer DoS (remotePatterns)   | Yes (15.5.10+)    |

**Recommendation:** Run `npm audit fix` and review any major version bumps (Next.js 16+).

### Security headers (middleware)

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: 1 year
- CSP: restrictive; allows self, CDNs, API, Stripe, analytics

---

## 5. Architecture checklist

| Component            | Status |
|----------------------|--------|
| Prisma schema        | OK     |
| Redis config         | OK (fallback to in-memory) |
| CORS whitelist       | OK (aileadstrategies.com included) |
| Health endpoints     | OK (frontend + backend) |
| Auth flow (login/signup) | OK |
| Error handler        | OK     |
| Graceful shutdown     | OK     |

---

## 6. Recommended actions (priority order)

1. **Fix backend `emailRoutes` import** — Add missing `require('./routes/emails')` so backend starts.
2. **Address security advisories** — Update axios, evaluate Next.js upgrade.
3. **Verify Railway backend root** — Ensure backend service uses `backend/` as root and `node src/index.js`.
4. **Optional:** Wire Redis store to rate limiter at startup for shared rate limiting across instances.
