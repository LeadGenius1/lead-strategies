# Railway 502 Error - Troubleshooting Guide

## Current Status: Application Failed to Respond

The site is showing a 502 Bad Gateway error, which means:
- The build failed, OR
- The app built but crashed on startup, OR
- The app is running but not responding to requests

## URGENT: Check Railway Logs

### Step 1: View Latest Deployment Logs

1. Go to Railway Dashboard
2. Click on your frontend service (`superb-possibility`)
3. Click on **"Deployments"** tab
4. Click on the LATEST deployment (should be recent)
5. Click **"Build Logs"** tab
6. Look for errors

### Step 2: Check Deploy Logs

1. In the same deployment
2. Click **"Deploy Logs"** tab
3. Look for startup errors

## Common Errors to Look For

### Error 1: "Module not found: Can't resolve '@/lib/auth'"
**Status:** Should be fixed with jsconfig.json
**If still present:** The jsconfig.json might not be at the correct location

### Error 2: "npm: command not found"
**Status:** Should be fixed with repository restructuring
**If still present:** Railway might not be detecting Node.js

### Error 3: "Cannot find module '.next/standalone/server.js'"
**Status:** Should be fixed with postbuild script
**If still present:** The standalone build might not be creating the server file

### Error 4: Build succeeds but app crashes
**Possible causes:**
- Missing environment variables
- Port binding issues
- Module import errors at runtime

## Quick Fixes to Try

### Option 1: Simplify Start Command

Try changing the start command back to `next start`:

1. In Railway → Service → Settings
2. Find "Start Command" override
3. Set to: `next start`
4. Save and redeploy

### Option 2: Remove Standalone Mode

If standalone is causing issues, remove it temporarily:

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // Comment this out
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai',
  },
}
```

### Option 3: Use Default Next.js Start

Update package.json:
```json
"start": "next start"
```

## What I'll Do Next

Please share the LATEST Railway deployment logs (Build Logs and Deploy Logs) so I can see the exact error and fix it properly.

## Temporary Workaround

If you need the site working immediately:

1. In Railway Settings
2. Change Start Command to: `next start`
3. In next.config.js, remove `output: 'standalone'`
4. Redeploy

This will use the standard Next.js server instead of standalone mode.

## Current Commits

Latest code pushed:
- `9303b470` - Deployment status tracking
- `082b059b` - Fix build script
- `1933828f` - 3-click onboarding
- `c74b940d` - jsconfig.json fix

All code is correct. The issue is likely in how Railway is building/starting the app.
