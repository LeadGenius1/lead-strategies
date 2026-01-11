# Vercel Deployment Fix Instructions

## Issue
The login page, dashboard, and platform landing pages return 404 errors on the live site.

## Root Cause
The Vercel deployment is outdated and doesn't include the latest routes.

---

## Step 1: Set Environment Variables in Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://backend-production-2987.up.railway.app` |
| `RAILWAY_API_URL` | `https://backend-production-2987.up.railway.app` |
| `NODE_ENV` | `production` |

---

## Step 2: Push Changes to GitHub

Run these commands in the project folder:

```bash
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"

# Add the new/updated files
git add vercel.json next.config.js

# Commit
git commit -m "Fix Vercel routing and API rewrites

- Add vercel.json with API rewrites to Railway backend
- Update next.config.js with standalone output and proper rewrites
- Add CORS headers for API routes
- Enable www to non-www redirect"

# Push to main branch (triggers Vercel deploy)
git push origin main
```

---

## Step 3: Trigger Redeploy in Vercel

### Option A: Automatic (if GitHub connected)
Pushing to main will automatically trigger a new deployment.

### Option B: Manual Redeploy
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click the 3-dot menu on the latest deployment
5. Click "Redeploy"
6. Check "Use existing Build Cache" = OFF (force fresh build)
7. Click "Redeploy"

---

## Step 4: Verify Deployment

Wait for deployment to complete (2-5 minutes), then test:

```
https://aileadstrategies.com/login          → Should show login form
https://aileadstrategies.com/signup         → Should show signup wizard
https://aileadstrategies.com/leadsite-ai    → Should show LeadSite.AI landing
https://aileadstrategies.com/tackle-io      → Should show Tackle.IO landing
https://aileadstrategies.com/dashboard      → Should redirect to login
https://aileadstrategies.com/api/v1/health  → Should return backend health JSON
```

---

## What Was Fixed

### 1. Created `vercel.json`
- Configured API rewrites to Railway backend
- Added CORS headers for API routes
- Set region to `iad1` (US East)

### 2. Updated `next.config.js`
- Changed output to `standalone` for proper serverless deployment
- Added rewrites for `/api/v1/*` → Railway backend
- Added CORS headers
- Enabled www → non-www redirect

### 3. Fixed Authentication & Tier System
- Updated `User` type to use numeric tiers (1-5) instead of strings
- Added `getTierNumber()` and `getTierName()` helper functions
- Updated `AuthContext` to normalize user data with proper tier numbers
- Fixed all Tackle.IO dashboard pages to use `useAuth()` context
- Added tier-based access control (tier 5 required for Tackle.IO)

### 4. Dashboard Access by Tier

| Tier | Platform | Dashboards Accessible |
|------|----------|----------------------|
| 1 | LeadSite.AI | /dashboard, /dashboard/leads, /dashboard/campaigns |
| 2 | LeadSite.IO | All Tier 1 + /dashboard/websites |
| 3 | ClientContact.IO | All Tier 2 + /dashboard/inbox |
| 4 | VideoSite.IO | All Tier 3 + video features |
| 5 | Tackle.IO | ALL dashboards including /dashboard/tackle/* |

---

## If Still Getting 404s

### Check Build Logs
1. Go to Vercel Dashboard → Deployments
2. Click latest deployment
3. Check "Build Logs" for errors

### Common Issues

**Error: "Cannot find module '@/contexts/AuthContext'"**
- The `@/` path alias should resolve to project root
- Verify `tsconfig.json` has `"paths": { "@/*": ["./*"] }`

**Error: "Module not found"**
- Run `npm install` locally first
- Make sure all dependencies are in package.json

**Still 404 after deploy**
- Clear Vercel build cache
- Delete `.next` folder locally
- Force redeploy without cache

---

## Quick Fix Commands

```bash
# Navigate to project
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"

# Clean build
rm -rf .next node_modules
npm install
npm run build

# If build succeeds, push to GitHub
git add -A
git commit -m "Force rebuild with latest changes"
git push origin main
```

---

## Environment Variables Summary

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://leadstrategies-backend-production.up.railway.app
RAILWAY_API_URL=https://leadstrategies-backend-production.up.railway.app
NODE_ENV=production
```

### Railway (Backend) - Already Set
```
DATABASE_URL=postgresql://...
ENABLE_SELF_HEALING=true
JWT_SECRET=...
NODE_ENV=production
```
