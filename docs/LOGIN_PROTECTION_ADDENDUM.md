# LOGIN PROTECTION ADDENDUM

**MANDATORY: All agents executing MULTI_AGENT_EXECUTION_PLAN.md MUST follow these rules.**  
**DO NOT BREAK LOGIN.**

---

## Protected Auth Endpoints (Never Rate-Limit, Never Break)

| Path | Purpose | Critical |
|------|---------|----------|
| `POST /api/v1/auth/login` | Email/password login | Yes |
| `POST /api/v1/auth/signup` | Registration | Yes |
| `POST /api/v1/auth/register` | Alias for signup | Yes |
| `POST /api/auth/oauth/callback` | Google OAuth callback | Yes |
| `GET /api/auth/me` | Session / current user | Yes |
| `GET /api/v1/auth/me` | Same (backend) | Yes |
| `POST /api/v1/auth/logout` | Logout | Yes |
| `GET /api/auth/oauth/google` | OAuth redirect (Next.js) | Yes |
| `POST /api/auth/login` | Frontend proxy → backend | Yes |
| `POST /api/auth/signup` | Frontend proxy → backend | Yes |

---

## Agent-Specific LOGIN Safeguards

### AGENT 1: Database Infrastructure

- **Prisma Singleton path**: From `backend/src/routes/auth.js` use `require('../../lib/prisma')` (path: `backend/lib/prisma.js`).
- **Auth uses Prisma for**: `prisma.user.findUnique`, `prisma.user.create`, `prisma.user.update` (login, signup, oauth callback).
- **Verify**: After changes, test `POST /api/v1/auth/login` and `GET /api/auth/me` return correct responses.

### AGENT 2: Monitoring (Sentry)

- **No Sentry on `backend/server.js`**: Backend entry is `backend/src/index.js`. Initialize Sentry there.
- **Do not add Sentry before auth routes**: Auth must run first; Sentry should not intercept or alter 401/403.
- **Error handler order**: `Sentry.Handlers.errorHandler()` must come AFTER all routes but MUST NOT change auth error responses. Preserve existing `errorHandler` behavior for JWT/Prisma errors.

### AGENT 3: API Safety & Rate Limiting

- **CRITICAL: Exclude auth from rate limiting.**  
  Add to the rate limiter `skip` function:
  ```javascript
  skip: (req) => {
    // NEVER rate limit auth — users must always be able to log in
    if (req.path.includes('/auth/login') || 
        req.path.includes('/auth/signup') || 
        req.path.includes('/auth/register') || 
        req.path.includes('/auth/oauth') || 
        req.path.includes('/auth/me') ||
        req.path.includes('/auth/logout')) return true;
    if (req.path.includes('/webhooks/') && req.method === 'POST') return true;
    if (req.path === '/health' || req.path === '/api/health' || req.path === '/api/v1/health') return true;
    return false;
  },
  ```
- **Pagination limits**: Only apply to list endpoints (leads, contacts, deals, etc.). Do NOT touch auth routes.

### AGENT 4: System Reliability

- **Graceful shutdown**: Use the shared Prisma singleton from `backend/lib/prisma.js` (Agent 1). Path: `require('../lib/prisma')` from `backend/src/index.js`, or `require('./lib/prisma')` if lib is in backend root.
- **Do not disconnect Prisma before auth routes finish**: Shutdown should close the server first (stop new connections), then disconnect Prisma. Auth requests in-flight must complete.

### AGENT 5: Integration Testing

- **Mandatory login tests before declaring success:**
  1. `POST /api/v1/auth/login` with valid credentials → 200, returns token.
  2. `POST /api/v1/auth/login` with invalid credentials → 401.
  3. `GET /api/auth/me` without token → 401.
  4. `GET /api/auth/me` with valid token → 200, returns user.
  5. Google OAuth flow (if configured): Sign in with Google → redirect → callback → cookie set → dashboard loads.
  6. **Rate limit test must NOT include auth**: Do not send 101 requests to `/api/v1/auth/login`. Use `/api/health` or another non-auth endpoint for rate limit testing.

---

## Pre-Deploy Checklist (LOGIN)

Before `git push` to production:

- [ ] Login (email/password) works locally
- [ ] Signup works locally
- [ ] `/api/auth/me` returns 401 without token, 200 with token
- [ ] Auth endpoints are excluded from rate limiting
- [ ] Prisma singleton used in auth routes (no `new PrismaClient()` in auth.js)
- [ ] No middleware reordering that could block auth

---

## If Login Breaks

1. **Immediate rollback**: `git revert HEAD` and push.
2. **Check**: Rate limiter skip rules, Prisma import paths, middleware order.
3. **Verify**: `curl -X POST https://api.aileadstrategies.com/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'` — should NOT return 429.

---

*This addendum overrides any conflicting instructions in MULTI_AGENT_EXECUTION_PLAN.md regarding auth endpoints.*
