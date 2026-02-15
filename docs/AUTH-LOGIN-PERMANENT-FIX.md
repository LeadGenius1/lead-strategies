# Auth Login - Permanent Fix Documentation

**Last updated:** 2026-02-13

This document captures the root causes of recurring login 401 issues and the permanent fixes applied.

## Root Causes Addressed

### 1. **Generic Error Messages**
- **Problem:** Users saw "Request failed with status code 401" instead of actionable messages.
- **Fix:** `lib/auth.js` now extracts `error.response.data.error` and surfaces backend messages:
  - "Invalid email or password" (401)
  - "Please sign in with Google" (400 - OAuth-only accounts)
  - "Server error. Please try again later." (5xx)
  - "Network error. Check your connection."

### 2. **Missing CORS Origins**
- **Problem:** `videosite.ai`, `ultralead.ai` were not in backend CORS allowlist; requests from those domains could be blocked.
- **Fix:** Added all platform domains to `backend/src/index.js` defaultOrigins.

### 3. **Cookie Configuration**
- **Problem:** Cookies lacked `secure` and `sameSite` in production.
- **Fix:** `Cookies.set()` now uses `{ secure: true, sameSite: 'lax' }` when `location.protocol === 'https'`.

### 4. **OAuth User Confusion**
- **Problem:** Users who signed up with Google tried email/password and got a generic error.
- **Fix:** When error contains "google", a secondary toast prompts: "Use the 'Continue with Google' button above."

## Files Modified

| File | Change |
|------|--------|
| `lib/auth.js` | `getAuthErrorMessage()`, `loginWithErrorHandling()`, signup error handling, cookie options |
| `app/(auth)/login/page.js` | Use `loginWithErrorHandling`, surface backend errors, Google hint |
| `backend/src/index.js` | Add videosite.ai, ultralead.ai, www variants to CORS |

## Auth API Contract (Backend → Frontend)

| Endpoint | Success | 400 | 401 | 500 |
|----------|---------|-----|-----|-----|
| POST /api/v1/auth/login | `{ success: true, token, data: { user } }` | `{ error: "Please sign in with Google" }` | `{ error: "Invalid email or password" }` | `{ error: string }` |
| POST /api/v1/auth/signup | `{ success: true, token, data: { user } }` | `{ error: "An account with this email already exists" }` etc | — | `{ error: string }` |

**Do not change** backend error keys (`error`, `message`) without updating `getAuthErrorMessage()` in `lib/auth.js`.

## Verification Checklist

After deployment:

- [ ] Login with valid email/password → success
- [ ] Login with wrong password → toast shows "Invalid email or password"
- [ ] Login with non-existent email → toast shows "Invalid email or password"
- [ ] Login with Google-only account via email form → toast shows "Please sign in with Google" + Google hint
- [ ] Login from videosite.ai, clientcontact.io, ultralead.ai → no CORS errors
- [ ] Token persists after page refresh (cookie)
- [ ] Forgot password flow works

## 404 / Route Not Found

If the backend returns **404** for `/api/v1/auth/login`:
- Auth routes exist in `backend/src/routes/auth.js` and are registered in `backend/src/index.js`
- Run `npm run verify:auth` (with backend running) to confirm routes respond
- Do **NOT** replace `auth.js` with a simplified version – existing password hashes use `salt:hash` format; a different scheme would break all users

## If Login Breaks Again

1. **Check backend logs** – Is the request reaching the backend? Database connected?
2. **Check Network tab** – Status code (404 = route missing, 401 = wrong creds), response body, CORS headers
3. **Check env vars** – `NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `JWT_SECRET` (must match across services)
4. **Run verify:auth** – `npm run verify:auth` with backend running on port 3001
