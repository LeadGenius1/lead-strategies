# ✅ Backend URL Updated to Vercel

**Date:** January 11, 2026  
**Status:** ✅ **Configuration Updated** | ⚠️ **Environment Variables Required**

---

## 🎯 What Changed

**New Backend URL:** `https://backend-wheat-beta-15.vercel.app`

### Files Updated:
- ✅ `vercel.json` - Updated default backend URL
- ✅ `next.config.js` - Updated default backend URL and rewrites

---

## ⚠️ CRITICAL: Set Environment Variables in Vercel

You **MUST** set these environment variables in your Vercel frontend project for the app to work correctly.

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your **frontend project** (likely `ai-lead-strategies-website` or `lead-strategies`)

### Step 2: Navigate to Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in the left sidebar

### Step 3: Add/Update These Variables

**Add or update these three variables:**

1. **NEXT_PUBLIC_API_URL**
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://backend-wheat-beta-15.vercel.app`
   - **Environment:** Production, Preview, Development (select all)
   - Click **Save**

2. **RAILWAY_API_URL**
   - **Name:** `RAILWAY_API_URL`
   - **Value:** `https://backend-wheat-beta-15.vercel.app`
   - **Environment:** Production, Preview, Development (select all)
   - Click **Save**

3. **NODE_ENV** (if not already set)
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - **Environment:** Production only
   - Click **Save**

### Step 4: Redeploy
After setting environment variables:
1. Go to **Deployments** tab
2. Click the **3-dot menu** on the latest deployment
3. Click **Redeploy**
4. Check **"Use existing Build Cache"** = OFF (to ensure new env vars are used)
5. Click **Redeploy**

---

## 🔗 Backend Endpoints

Your backend is now live at: `https://backend-wheat-beta-15.vercel.app`

### Available Endpoints:
- ✅ **API Status:** https://backend-wheat-beta-15.vercel.app/api/status
- ✅ **Health Check:** https://backend-wheat-beta-15.vercel.app/health
- ✅ **Auth Endpoints:** https://backend-wheat-beta-15.vercel.app/api/auth/*
- ✅ **API v1:** https://backend-wheat-beta-15.vercel.app/api/v1/*

---

## 🧪 Testing After Setup

After setting environment variables and redeploying:

### 1. Test Backend Connection
```bash
# Test health endpoint
curl https://backend-wheat-beta-15.vercel.app/health

# Test API status
curl https://backend-wheat-beta-15.vercel.app/api/status
```

### 2. Test Frontend → Backend Connection
1. Visit: `https://aileadstrategies.com/api/health`
2. Should return backend health status (not error)

### 3. Test Authentication
1. Go to: `https://aileadstrategies.com/login`
2. Try logging in
3. Should connect to backend successfully

### 4. Test Signup
1. Go to: `https://aileadstrategies.com/signup`
2. Fill in form and submit
3. Should create account via backend

---

## 📋 Configuration Summary

### Frontend (Vercel)
- **Project:** Your frontend Next.js project
- **Environment Variables Required:**
  - `NEXT_PUBLIC_API_URL=https://backend-wheat-beta-15.vercel.app`
  - `RAILWAY_API_URL=https://backend-wheat-beta-15.vercel.app`
  - `NODE_ENV=production`

### Backend (Vercel)
- **URL:** `https://backend-wheat-beta-15.vercel.app`
- **Status:** ✅ Deployed and responding
- **Environment Variables:** Set in backend Vercel project (JWT_SECRET, etc.)

---

## 🔄 Migration Notes

### Old Configuration:
- Backend URL: `https://tackleai.ai` or `https://backend-production-2987.up.railway.app`
- Railway-based deployment

### New Configuration:
- Backend URL: `https://backend-wheat-beta-15.vercel.app`
- Vercel-based deployment
- Same API structure, just different host

---

## ✅ Verification Checklist

- [ ] Environment variables set in Vercel frontend project
- [ ] Frontend redeployed with new environment variables
- [ ] Backend health check working: `/health`
- [ ] Frontend can reach backend: `/api/health`
- [ ] Login works: `/api/auth/login`
- [ ] Signup works: `/api/auth/signup`
- [ ] Dashboard loads after login

---

## 🆘 Troubleshooting

### Problem: Frontend still using old backend URL
**Solution:**
1. Verify environment variables are set correctly in Vercel
2. Redeploy frontend (don't use cache)
3. Check browser console for API errors

### Problem: CORS errors
**Solution:**
- Backend should already have CORS configured
- Check backend Vercel project settings
- Verify `Access-Control-Allow-Origin` headers

### Problem: 404 errors on API endpoints
**Solution:**
- Verify backend URL is correct: `https://backend-wheat-beta-15.vercel.app`
- Check backend deployment status in Vercel
- Test backend endpoints directly

---

**Status:** ✅ **Configuration Updated** | ⚠️ **Set Environment Variables & Redeploy**
