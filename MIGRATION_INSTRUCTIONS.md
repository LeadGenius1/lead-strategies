# Database Migration Instructions - ClientContact.IO Features

**Date:** January 10, 2026  
**Status:** ✅ **CODE DEPLOYED** | ⏳ **MIGRATION PENDING**

---

## ✅ Deployment Status

**Git Push:** ✅ Complete  
**Commit:** `b2ed4ae` - ClientContact.IO features  
**Railway Auto-Deploy:** ⏳ Triggered (usually 2-3 minutes)

---

## ⚠️ IMPORTANT: Database Migration Required

After Railway deployment completes, you **MUST** run the database migration to create the new tables.

---

## 🚀 Migration Methods

### Method 1: Railway CLI (Recommended)

**Step 1: Link to backend service**
```bash
cd backend
railway link --project ai-lead-strategies
railway service link backend
```

**Step 2: Run migration**
```bash
railway run --service backend "npx prisma db push"
```

**OR using Railway shell:**
```bash
railway shell --service backend
# Then inside Railway shell:
npx prisma db push
```

---

### Method 2: Railway Dashboard (Alternative)

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Select project: `ai-lead-strategies`
   - Select service: `backend`

2. **Open Deployment Terminal:**
   - Go to **Deployments** tab
   - Click on latest deployment
   - Click **View Logs** or **Terminal** option
   - Or use **Shell** feature if available

3. **Run Migration:**
   ```bash
   npx prisma db push
   ```

---

### Method 3: One-Time Migration Script

**Create a temporary migration script:**
```bash
cd backend
railway run --service backend "npx prisma db push --accept-data-loss"
```

---

## ✅ What Migration Will Create

**New Tables:**
- ✅ `canned_responses` - Template storage
- ✅ `auto_responses` - Automation rules
- ✅ `conversation_notes` - Internal notes

**Updated Tables:**
- ✅ `users` - Added relations to new models
- ✅ `conversations` - Added `notes` relation

---

## 🔍 Verify Migration Success

**After running migration, verify:**

### 1. Check Tables Exist
```bash
railway run --service backend "npx prisma studio"
# Or check database directly via Railway dashboard
```

### 2. Test API Routes
```bash
# Should return empty array (no templates yet)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://backend-production-2987.up.railway.app/api/canned-responses

# Should return 401 if not authenticated (correct behavior)
curl https://backend-production-2987.up.railway.app/api/canned-responses
```

---

## 📋 Post-Migration Checklist

- [ ] Migration completed successfully
- [ ] New tables created (`canned_responses`, `auto_responses`, `conversation_notes`)
- [ ] User and Conversation tables updated
- [ ] API routes accessible (with authentication)
- [ ] Test creating a canned response
- [ ] Test creating an auto-response rule
- [ ] Test creating a conversation note

---

## 🔧 Troubleshooting

### If Migration Fails:

**Error: "Environment variable not found: DATABASE_URL"**
- ✅ Solution: Run migration via Railway CLI or Railway dashboard (has access to DATABASE_URL)

**Error: "Table already exists"**
- ✅ Solution: Tables may already exist. Migration will update schema safely.

**Error: "Relation does not exist"**
- ✅ Solution: Ensure all relations are correctly defined in schema.prisma

**Error: "Prisma Client not generated"**
- ✅ Solution: Railway build should generate Prisma client automatically. If not, run:
  ```bash
  railway run --service backend "npx prisma generate"
  ```

---

## ✅ Migration Command Summary

**Quick Command:**
```bash
cd backend
railway link --project ai-lead-strategies
railway service link backend
railway run --service backend "npx prisma db push"
```

**Expected Output:**
```
✅ Prisma schema loaded
✅ Database connection successful
✅ Pushing schema to database...
✅ Successfully pushed schema
✅ Tables created/updated
```

---

**Status:** ⏳ **WAITING FOR RAILWAY DEPLOYMENT** | 🔄 **MIGRATION READY**
