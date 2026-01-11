# Set Railway Environment Variable - NPM_CONFIG_PRODUCTION

**Date:** January 10, 2026  
**Action Required:** Set environment variable in Railway Dashboard

---

## 🔧 Fix: Set NPM_CONFIG_PRODUCTION=false

**Why:**
- Railway runs `npm install` in production mode
- This may skip some packages needed for the build
- Setting `NPM_CONFIG_PRODUCTION=false` ensures Prisma is available during build

---

## 📋 Steps

**1. Go to Railway Dashboard:**
- https://railway.app
- Project: `ai-lead-strategies`
- Service: `backend`

**2. Click on "Variables" tab**

**3. Click "New Variable"**

**4. Add variable:**
- **Variable:** `NPM_CONFIG_PRODUCTION`
- **Value:** `false`

**5. Click "Add"**

**6. Railway will automatically redeploy**

---

## ✅ Expected Result

**After setting the variable:**
- Railway will install all dependencies
- Prisma will be available during build
- `npx prisma generate` will succeed
- Build will complete successfully
- New routes will be deployed

---

## 🔍 Alternative: Use Railway CLI

```bash
cd backend
railway variables --set NPM_CONFIG_PRODUCTION=false
```

---

**Status:** ⏳ **SET ENVIRONMENT VARIABLE** → **RAILWAY WILL REDEPLOY** → **BUILD SHOULD SUCCEED**
