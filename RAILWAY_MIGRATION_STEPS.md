# Railway Database Migration - Step by Step

**Date:** January 10, 2026  
**Status:** ✅ **CODE PUSHED** | ⏳ **WAITING FOR DEPLOYMENT** | ⏳ **MIGRATION READY**

---

## ✅ What's Done

**Code Push:**
- ✅ Pushed to: `LeadGenius1/lead-strategies-backend`
- ✅ Branch: `master`
- ✅ Commit: `b2ed4ae` - ClientContact.IO features
- ✅ Railway is auto-deploying

---

## ⚠️ Why Railway CLI Can't Run Migration

**Issue:**
- Railway CLI `railway run` tries to connect from local machine
- Database uses Railway's internal network (`postgres-b5y3.railway.internal`)
- Local machine cannot access Railway's internal network
- **Migration MUST run from Railway Dashboard terminal**

---

## 📋 Step-by-Step Migration Instructions

### Step 1: Wait for Deployment (2-3 minutes)

**Check Railway Dashboard:**
1. Go to: https://railway.app
2. Select project: `ai-lead-strategies`
3. Select service: `backend`
4. Go to **Deployments** tab
5. Wait for latest deployment to show **"ACTIVE"** and **"successful"**

**Verify Routes:**
- Test: `https://backend-production-2987.up.railway.app/api/canned-responses`
- Should return **401** (not 404) when deployed

---

### Step 2: Run Database Migration

**Via Railway Dashboard Terminal:**

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Project: `ai-lead-strategies`
   - Service: `backend`

2. **Open Deployment Terminal:**
   - Go to **Deployments** tab
   - Click on **latest ACTIVE deployment**
   - Look for **"Terminal"**, **"Shell"**, or **"Connect"** button
   - Click to open terminal

3. **Run Migration Command:**
   ```bash
   npx prisma db push
   ```

4. **Expected Output:**
   ```
   Prisma schema loaded from prisma/schema.prisma
   Datasource "db": PostgreSQL database "railway"
   ✅ Pushing schema to database...
   ✅ Successfully pushed schema
   ✅ Tables created/updated
   ```

---

### Step 3: Verify Migration Success

**After migration completes:**

1. **Test API Routes with Authentication:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://backend-production-2987.up.railway.app/api/canned-responses
   ```
   - **Expected:** 200 OK with empty array `[]`
   - **Not Expected:** 500 Internal Server Error

2. **Check Tables Exist:**
   - Railway Dashboard → Database (Postgres-B5Y3)
   - Check for tables: `canned_responses`, `auto_responses`, `conversation_notes`

---

## ✅ Migration Checklist

**Before Migration:**
- [ ] Railway deployment shows "ACTIVE" and "successful"
- [ ] New API routes return 401 (not 404)
- [ ] Terminal/Shell access available in Railway dashboard

**During Migration:**
- [ ] Run `npx prisma db push` in Railway terminal
- [ ] Wait for completion
- [ ] Check for errors

**After Migration:**
- [ ] Migration completed successfully
- [ ] New tables exist in database
- [ ] API routes return 200 (not 500) with authentication
- [ ] Test creating canned response, auto-response, note

---

## 🎯 Summary

**Current Status:**
- ✅ Code pushed to Railway repository
- ⏳ Railway deploying (2-3 minutes)
- ⏳ Migration pending (run after deployment)

**Next Action:**
1. Wait for Railway deployment to complete
2. Open Railway Dashboard → backend → Deployments → Terminal
3. Run: `npx prisma db push`
4. Verify everything works

---

**Status:** ✅ **CODE PUSHED** | ⏳ **DEPLOYING** | ⏳ **MIGRATION READY**
