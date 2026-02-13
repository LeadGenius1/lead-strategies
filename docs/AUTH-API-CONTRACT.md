# Auth API Contract

**Purpose:** Single source of truth for auth endpoints. Frontend and backend MUST match this contract.

**Last Updated:** February 2026

---

## Endpoints

| Endpoint | Method | Request | Response (success) | Used By |
|----------|--------|---------|--------------------|---------|
| `/api/v1/auth/signup` | POST | `{ email, password, name?, company?, tier?, businessInfo? }` | `{ success: true, token, data: { user } }` | `lib/auth.js` signup() |
| `/api/v1/auth/login` | POST | `{ email, password }` | `{ success: true, token, data: { user } }` | `lib/auth.js` login() |
| `/api/v1/auth/me` | GET | `Authorization: Bearer <token>` | `{ success: true, data: { user } }` | `lib/auth.js` getCurrentUser() |
| `/api/v1/auth/oauth/callback` | POST | `{ code, redirectUri, provider?, tier? }` | `{ success: true, token, user }` | OAuth flow |
| `/api/v1/auth/logout` | POST | (optional token) | `{ success: true }` | `lib/auth.js` logout() |

---

## Critical Rules

1. **Do NOT remove or rename** `/api/v1/auth/signup` – frontend calls this.
2. **Do NOT change** request/response shapes without updating `lib/auth.js` and this doc.
3. **Auth routes** must be registered in `backend/src/index.js` before protected routes.
4. **Route registration:** `app.use('/api/v1/auth', authRoutes)` is required.

---

## Protection Checklist (before deploy)

- [ ] Run `.\scripts\system-diagnostics.ps1` – all tests pass
- [ ] Auth tests: 5 (me 401), 5b (signup 400), 5c (login 400) must PASS
- [ ] If signup returns 404: route is missing – do NOT deploy until fixed

---

## File Locations

| Purpose | File |
|---------|------|
| **Auth endpoints (SOURCE OF TRUTH)** | `lib/auth-endpoints.js` |
| Backend auth routes | `backend/src/routes/auth.js` |
| Frontend auth client | `lib/auth.js` |
| API base URL | `lib/api.js` → `NEXT_PUBLIC_API_URL` |
| Auth protection rule | `.cursor/rules/auth-protection.mdc` |
