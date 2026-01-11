# Fix Root Directory - Action Required

**Date:** January 10, 2026  
**Issue:** Root Directory mismatch causing 404 errors  
**Status:** 🔧 **ACTION REQUIRED**

---

## 🔍 Problem

**Railway Configuration:**
- Root Directory: `.` (expects files at repository root)
- Repository: `LeadGenius1/lead-strategies-backend`
- Branch: `master`

**Actual Repository Structure:**
- Backend code is in `backend/` folder
- Railway can't find `package.json` at root
- Routes return 404 because app doesn't start

---

## ✅ Solution: Update Railway Root Directory

**Quick Fix (2 minutes):**

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Project: `ai-lead-strategies`
   - Service: `backend`
   - Tab: **Settings**

2. **Find "Root Directory" Field:**
   - In the "Source" section
   - Currently set to: `.`
   - Change to: `backend`

3. **Save Settings:**
   - Railway will automatically redeploy
   - Wait 2-3 minutes for deployment

4. **Verify:**
   - Check Deployments tab for successful build
   - Test routes: `/api/canned-responses` should return 401 (not 404)

---

## 📋 Step-by-Step Instructions

### Step 1: Open Railway Settings
- Go to Railway Dashboard
- Click on `backend` service
- Click **Settings** tab

### Step 2: Update Root Directory
- Scroll to **"Source"** section
- Find **"Root Directory"** field
- Change from `.` to `backend`
- Click **Save** or settings auto-save

### Step 3: Wait for Redeploy
- Railway will detect the change
- Automatic redeploy will start
- Check **Deployments** tab
- Wait for "ACTIVE" and "successful" status

### Step 4: Test Routes
- Test: `https://backend-production-2987.up.railway.app/api/canned-responses`
- Expected: **401** (Unauthorized - route exists, needs auth)
- Not Expected: **404** (Not Found - route doesn't exist)

---

## ✅ Success Criteria

**After Fix:**
- ✅ Railway build succeeds
- ✅ Routes return 401 (not 404)
- ✅ Backend service shows "Online"
- ✅ New API routes are accessible

**Then:**
- Run database migration (`npx prisma db push`)

---

## 🎯 Why This Works

**Before:**
- Railway looks for `package.json` at repo root
- Can't find it (it's in `backend/` folder)
- Build fails or app doesn't start
- Routes return 404

**After:**
- Railway looks for `backend/package.json`
- Finds it correctly
- Build succeeds
- App starts correctly
- Routes work

---

**Status:** 🔧 **UPDATE RAILWAY ROOT DIRECTORY TO 'backend'** → **WAIT FOR REDEPLOY** → **TEST ROUTES**
