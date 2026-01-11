# ⚠️ URGENT: Set Railway Environment Variables

**Date:** January 10, 2026  
**Issue:** Dashboard access blocked - Frontend API routes need backend URL  
**Action Required:** Set environment variables in Railway Dashboard

---

## 🎯 What Needs to Be Done

Set these environment variables in the **frontend service** (`superb-possibility`) in the **strong-communication** project:

```
RAILWAY_API_URL=https://backend-production-2987.up.railway.app
NEXT_PUBLIC_API_URL=https://backend-production-2987.up.railway.app
```

---

## 📋 Step-by-Step Instructions

### Step 1: Open Railway Dashboard
1. Go to: https://railway.app
2. Login to your account

### Step 2: Navigate to Frontend Service
1. Click on project: **strong-communication**
2. Click on service: **superb-possibility** (frontend service)
3. Go to **Variables** tab

### Step 3: Add/Update Variables

**Add or update these two variables:**

1. **RAILWAY_API_URL**
   - Click **+ New Variable** (or edit if exists)
   - **Name:** `RAILWAY_API_URL`
   - **Value:** `https://backend-production-2987.up.railway.app`
   - Click **Save**

2. **NEXT_PUBLIC_API_URL**
   - Click **+ New Variable** (or edit if exists)
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://backend-production-2987.up.railway.app`
   - Click **Save**

### Step 4: Verify Variables Are Set

After saving, you should see both variables in the list:
- ✅ `RAILWAY_API_URL` = `https://backend-production-2987.up.railway.app`
- ✅ `NEXT_PUBLIC_API_URL` = `https://backend-production-2987.up.railway.app`

### Step 5: Wait for Redeployment

Railway will automatically redeploy the service when variables are updated. This takes 1-2 minutes.

---

## ✅ Verification

After deployment completes:

1. **Test Health Check:**
   ```powershell
   Invoke-RestMethod -Uri "https://aileadstrategies.com/api/health"
   ```
   Should show backend is connected (not "not_configured")

2. **Test Login:**
   - Go to: https://aileadstrategies.com/login
   - Enter credentials
   - Should successfully log in and redirect to dashboard

3. **Test Dashboard:**
   - After login, go to: https://aileadstrategies.com/dashboard
   - Should load successfully

---

## 🔍 Why This Is Needed

**Current Problem:**
- Frontend API routes (`/api/auth/login`, `/api/auth/signup`, `/api/auth/me`) require `RAILWAY_API_URL` to forward requests to backend
- Without this variable, login/signup fail
- Users can't authenticate, so they can't access dashboard

**After Fix:**
- Frontend can communicate with backend
- Login/signup will work
- Users can access dashboard after authentication

---

## 📊 Backend API Status

**Backend URL:** `https://backend-production-2987.up.railway.app`
- ✅ **Status:** Online and accessible
- ✅ **Health Check:** Working
- ✅ **Tested:** Responds correctly

---

## 🎯 Quick Reference

**Project:** strong-communication  
**Service:** superb-possibility  
**Environment:** production  
**Backend URL:** https://backend-production-2987.up.railway.app

**Variables to Set:**
1. `RAILWAY_API_URL=https://backend-production-2987.up.railway.app`
2. `NEXT_PUBLIC_API_URL=https://backend-production-2987.up.railway.app`

---

**Status:** ⚠️ **ACTION REQUIRED** - Set variables in Railway Dashboard  
**Time Required:** 2-3 minutes  
**Impact:** Fixes dashboard access issue completely
