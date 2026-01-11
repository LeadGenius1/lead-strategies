# Post-Redeploy Checklist - ClientContact.IO Features

**Date:** January 10, 2026  
**Status:** ✅ **REDEPLOY COMPLETE** | ⏳ **VERIFICATION IN PROGRESS**

---

## ✅ Step 1: Verify Deployment Success

### Test New API Routes

**Expected:** All routes should return **401** (not 404)

```bash
curl https://backend-production-2987.up.railway.app/api/canned-responses
curl https://backend-production-2987.up.railway.app/api/auto-responses
curl https://backend-production-2987.up.railway.app/api/conversation-notes
```

**Results:**
- ✅ **401 (Unauthorized):** Deployment successful! ✅
- ❌ **404 (Not Found):** Deployment not complete yet
- ⚠️ **500 (Server Error):** Deployed but migration needed

---

## ⏳ Step 2: Run Database Migration (CRITICAL)

**After routes return 401, run migration immediately:**

### Via Railway Dashboard:

1. Go to Railway Dashboard → `backend` service
2. Go to **Deployments** tab
3. Click on **latest ACTIVE deployment** (not "Removed")
4. Look for **Terminal**, **Shell**, or **Connect** button
5. Open terminal/shell
6. Run: `npx prisma db push`

### Via Railway CLI:

```bash
cd backend
railway link --project ai-lead-strategies
railway service link backend
railway run --service backend "npx prisma db push"
```

**What Migration Will Create:**
- ✅ `canned_responses` table
- ✅ `auto_responses` table
- ✅ `conversation_notes` table
- ✅ Update `users` table (add relations)
- ✅ Update `conversations` table (add notes relation)

---

## ✅ Step 3: Verify Migration Success

### Test API Routes with Authentication:

```bash
# Should return 200 OK with empty array (not 500 error)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://backend-production-2987.up.railway.app/api/canned-responses
```

**Expected Results:**
- ✅ **200 OK:** `[]` (empty array) - Migration successful! ✅
- ❌ **500 Error:** Migration not run yet or failed

### Check Tables Exist:

**Via Railway Dashboard:**
- Go to Railway Dashboard → Database (Postgres-B5Y3)
- Check tables: `canned_responses`, `auto_responses`, `conversation_notes`

**Via Prisma Studio:**
```bash
railway run --service backend "npx prisma studio"
```

---

## 📋 Complete Checklist

**Deployment Verification:**
- [ ] Backend service shows "Online" in Railway
- [ ] Health endpoint returns `ok`
- [ ] New API routes return 401 (not 404)
- [ ] Latest deployment shows "ACTIVE" (not "Removed")

**Database Migration:**
- [ ] Run `npx prisma db push` via Railway terminal
- [ ] Migration completed without errors
- [ ] New tables exist in database
- [ ] API routes return 200 (not 500) with authentication

**Testing:**
- [ ] Test creating a canned response
- [ ] Test creating an auto-response rule
- [ ] Test creating a conversation note

---

## 🎯 Next Steps After Migration

**Once migration is complete:**

1. **Create Frontend API Proxies** (Next step)
   - `app/api/canned-responses/route.ts`
   - `app/api/auto-responses/route.ts`
   - `app/api/conversation-notes/route.ts`

2. **Build UI Components** (Final step)
   - Canned Response Selector/Editor
   - Auto-Response Rules Manager
   - Internal Notes Panel

---

## ⚠️ Troubleshooting

### If Routes Still Return 404:

**Possible Causes:**
- Deployment not complete yet (wait 1-2 minutes)
- Wrong service deployed (check you deployed `backend`, not frontend)
- Deployment failed (check Railway build logs)

**Solutions:**
- Check Railway dashboard → `backend` → Deployments
- Look for latest deployment status
- Check build logs for errors

### If Migration Fails:

**Common Errors:**
- "Can't reach database server" → Use Railway Dashboard terminal (has internal network access)
- "Table already exists" → Migration will update safely
- "Relation does not exist" → Check schema.prisma is correct

---

**Status:** ✅ **REDEPLOYED** → ⏳ **VERIFYING** → ⏳ **MIGRATION NEXT**
