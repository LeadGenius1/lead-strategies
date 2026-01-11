# Redeploy Instructions - Backend Service

**Date:** January 10, 2026  
**Action Required:** Redeploy BACKEND service

---

## 🎯 What to Redeploy

**Service:** ✅ **BACKEND** (not frontend)

**Why:**
- Recent GitHub auto-deployments failed (build errors)
- Current active deployment is from 3 hours ago (old code)
- New ClientContact.IO features code (commit `b2ed4ae`) needs to be deployed
- New API routes returning 404 because latest code isn't deployed

---

## 🚀 How to Redeploy

### Option 1: Railway Dashboard (Recommended)

1. **Go to Railway Dashboard:**
   - You're already there: https://railway.app
   - Project: `ai-lead-strategies`
   - Service: `backend` (api.leadsite.ai)

2. **Trigger Redeploy:**
   - In the **Deployments** tab
   - Look for **"Redeploy"** button (usually near the active deployment)
   - Or click the **three dots menu** (⋯) on the active deployment
   - Select **"Redeploy"** or **"Deploy Latest"**

3. **Monitor Deployment:**
   - Watch the deployment logs
   - Check for build errors
   - Wait for deployment to complete

### Option 2: Railway CLI

```bash
cd backend
railway link --project ai-lead-strategies
railway service link backend
railway up --service backend
```

---

## ✅ What to Expect

### During Deployment:

**Build Steps:**
1. ✅ Pull latest code from GitHub
2. ✅ Install dependencies (`npm install`)
3. ✅ Generate Prisma client (`npx prisma generate`)
4. ✅ Build service
5. ✅ Deploy

**Timeline:** Usually 2-3 minutes

### After Successful Deployment:

1. **Verify Routes:**
   ```bash
   # Should return 401 (not 404)
   curl https://backend-production-2987.up.railway.app/api/canned-responses
   curl https://backend-production-2987.up.railway.app/api/auto-responses
   curl https://backend-production-2987.up.railway.app/api/conversation-notes
   ```

2. **Run Database Migration:**
   - Go to Railway Dashboard → `backend` → Deployments
   - Click on latest deployment
   - Find Terminal/Shell/Connect
   - Run: `npx prisma db push`

---

## ⚠️ If Deployment Fails Again

**Common Issues:**

1. **"Error creating build plan with Railpack"**
   - Check `package.json` for build script
   - Verify Prisma is in dependencies
   - Check Railway build logs for specific error

2. **Build Timeout**
   - Railway may need more time
   - Check if dependencies are installing correctly

3. **Prisma Errors**
   - Verify `schema.prisma` is valid
   - Check Prisma version matches `package.json`

**Solutions:**
- Check build logs in Railway dashboard
- Verify all files are committed to git
- Ensure `package.json` has correct build script

---

## 📋 Post-Redeploy Checklist

**After redeployment succeeds:**

- [ ] Deployment shows "ACTIVE" and "successful"
- [ ] Health endpoint still returns `ok`
- [ ] New API routes return 401 (not 404)
- [ ] Run database migration (`npx prisma db push`)
- [ ] Verify new tables exist
- [ ] Test API routes with authentication

---

## 🎯 Summary

**Action:** Redeploy **BACKEND** service  
**Method:** Railway Dashboard → `backend` → Redeploy button  
**Expected Result:** New code deployed, routes return 401  
**Next Step:** Run database migration

---

**Status:** ⏳ **READY TO REDEPLOY** → **AWAITING REDEPLOYMENT** → **MIGRATION NEXT**
