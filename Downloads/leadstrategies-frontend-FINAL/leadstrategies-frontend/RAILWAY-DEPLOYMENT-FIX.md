# Railway Deployment Fix Guide

Based on the deployment logs, here are the issues and fixes:

## Issues Identified

1. **Next.js Standalone Warning**: `"next start" does not work with "output: standalone" configuration`
2. **Google OAuth Not Configured**: `GOOGLE_CLIENT_ID not configured`
3. **Backend URL**: Requests going to `https://api.aileadstrategies.com` (may be intentional)
4. **ECONNRESET Errors**: Network connection resets (normal, not critical)

## Fixes Applied

### 1. Next.js Standalone Configuration ✅

**Fixed in code:**
- Updated `next.config.js` to include `output: 'standalone'`
- Updated `package.json` start script to use `node .next/standalone/server.js`

**Railway Configuration:**
- Railway should automatically use the `start` script from `package.json`
- The new start command will use the standalone server

### 2. Environment Variables Required in Railway

Go to your Railway frontend service → **Variables** tab and add/verify:

#### Required Variables:

```bash
# Backend API URL (choose one based on your backend deployment)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
# OR if your backend is at:
# NEXT_PUBLIC_API_URL=https://api.aileadstrategies.com

# Frontend URL (for OAuth redirects)
NEXT_PUBLIC_FRONTEND_URL=https://aileadstrategies.com

# Google OAuth (REQUIRED for Google sign-in to work)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Microsoft OAuth (Optional, for Microsoft sign-in)
MICROSOFT_CLIENT_ID=your-microsoft-client-id

# LinkedIn OAuth (Optional, for LinkedIn sign-in)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

### 3. How to Set Environment Variables in Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Select your frontend service (`superb-possibility` or similar)
3. Click on the **Variables** tab
4. Click **+ New Variable** for each variable above
5. Enter the variable name and value
6. Click **Add**
7. Railway will automatically redeploy with new variables

### 4. Backend URL Configuration

**Current Issue:** Logs show requests to `https://api.aileadstrategies.com`

**Options:**
- If your backend is at `https://api.aileadstrategies.com`, keep it as is
- If your backend is at `https://api.leadsite.ai`, update `NEXT_PUBLIC_API_URL` in Railway

**To Check Backend URL:**
1. Verify where your backend is actually deployed
2. Update `NEXT_PUBLIC_API_URL` in Railway to match
3. Redeploy if needed

### 5. Google OAuth Setup

To get `GOOGLE_CLIENT_ID`:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Google Identity Services** API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Authorized redirect URIs**: `https://aileadstrategies.com/api/auth/oauth/callback?provider=google`
6. Copy the **Client ID** and add it to Railway as `GOOGLE_CLIENT_ID`

### 6. ECONNRESET Errors

These are **normal** and **not critical**. They occur when:
- Clients disconnect abruptly
- Network timeouts
- Railway load balancer resets connections

**No action needed** - these don't affect functionality.

## Verification Steps

After setting environment variables:

1. **Check Railway Logs:**
   - Should NOT see: `❌ GOOGLE_CLIENT_ID not configured`
   - Should see: `✓ Ready in XXXms` without warnings

2. **Test OAuth:**
   - Go to `/signup` or `/login`
   - Click "Continue with Google"
   - Should redirect to Google login (not show error)

3. **Test Backend Connection:**
   - Check logs for backend requests
   - Should connect to correct backend URL
   - Should not see connection errors

## Quick Fix Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` in Railway (if backend URL is wrong)
- [ ] Add `GOOGLE_CLIENT_ID` in Railway (required for Google OAuth)
- [ ] Add `NEXT_PUBLIC_FRONTEND_URL` in Railway (for OAuth redirects)
- [ ] Add `MICROSOFT_CLIENT_ID` in Railway (optional, for Microsoft OAuth)
- [ ] Add `LINKEDIN_CLIENT_ID` in Railway (optional, for LinkedIn OAuth)
- [ ] Redeploy service (Railway auto-redeploys when variables change)
- [ ] Verify logs show no configuration errors

## After Fixes

The deployment should:
- ✅ Start without Next.js standalone warnings
- ✅ Have Google OAuth working
- ✅ Connect to correct backend URL
- ✅ Handle OAuth redirects properly

## Support

If issues persist:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure backend is deployed and accessible
4. Check OAuth provider settings (redirect URIs match)
