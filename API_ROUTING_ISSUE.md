# API Routing Issue - Investigation

**Date**: January 8, 2026  
**Status**: 🔍 **Investigating**

---

## Issue

API routes are returning HTML (404 pages) instead of JSON responses. The `/api/health` endpoint works, but other API routes like `/api/auth/signup` return Next.js 404 pages.

---

## Symptoms

- ✅ `/api/health` → Returns JSON correctly
- ❌ `/api/auth/signup` → Returns HTML 404 page
- ❌ `/api/auth/login` → Returns HTML 404 page
- ❌ `/api/leads` → Returns HTML 404 page
- ❌ All other API routes → Return HTML 404 page

---

## Possible Causes

### 1. Route File Structure
- ✅ Routes exist: `app/api/auth/signup/route.ts`
- ✅ Routes are properly exported
- ✅ Next.js App Router structure is correct

### 2. Middleware Interference
- Need to check if middleware is blocking API routes
- Middleware should allow `/api/*` paths

### 3. Build/Deployment Issue
- Routes might not be included in production build
- Need to verify build output includes API routes

### 4. Next.js Configuration
- Check `next.config.js` for routing issues
- Verify no rewrites/redirects interfering

---

## Investigation Steps

1. ✅ Verified route files exist
2. ✅ Verified route exports are correct
3. 🔄 Check middleware configuration
4. 🔄 Verify build includes API routes
5. 🔄 Check Railway deployment logs
6. 🔄 Test locally vs production

---

## Next Steps

1. **Check Middleware**: Look for `middleware.ts` that might be blocking routes
2. **Verify Build**: Ensure API routes are included in production build
3. **Check Logs**: Review Railway logs for routing errors
4. **Test Locally**: Run `npm run build && npm start` locally to verify
5. **Redeploy**: Force a fresh deployment

---

## Temporary Workaround

If routes continue to fail, we can:
1. Use the backend API directly (`https://api.leadsite.ai/api/*`)
2. Update frontend to call backend directly
3. Investigate Next.js routing configuration

---

## Status

- Health endpoint: ✅ Working
- Auth endpoints: ❌ Returning 404 HTML
- Other endpoints: ❌ Returning 404 HTML
- Investigation: 🔄 In progress
