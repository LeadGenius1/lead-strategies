# Troubleshooting Guide
## Railway Deployment Issues & Fixes

**Date:** January 9, 2026  
**Last Updated:** January 9, 2026

---

## 🐛 CRITICAL ISSUES

### **Issue 1: Redis Service Deployment Failure** 🔴

### **Problem Description**

**Error:** Redis service deployment failed 16 hours ago  
**Error Type:** Prisma schema validation error  
**Error Location:** `prisma/schema.prisma:49`  
**Error Message:** `widgets Widget[]` validation error  
**Build Command:** `npm install && npx prisma generate`

### **Root Cause**

The Redis service in Railway is incorrectly configured to build the Node.js backend application instead of running a standalone Redis container.

**What's Happening:**
- Redis service is trying to execute `npm install && npx prisma generate`
- This suggests Redis has a Dockerfile or build command pointing to the backend directory
- Redis should be a simple Redis container, not building any Node.js code

**Current Status:**
- ✅ Redis is currently working (using older successful deployment)
- 🔴 New deployments are failing
- ⚠️ Cannot update Redis without fixing configuration

### **Solution Steps**

#### **Step 1: Check Redis Service Configuration in Railway**

1. Go to Railway dashboard
2. Navigate to `ai-lead-strategies` project
3. Click on **Redis** service
4. Go to **Settings** tab
5. Check **Source** section

**Expected Configuration:**
- **Source Type:** Docker Image
- **Image:** `redis:8.2.1` or `redis:latest`
- **Build Command:** (should be empty or not exist)
- **Dockerfile:** (should not exist or point to Redis)

**If Wrong Configuration Found:**
- Redis source is pointing to backend directory
- Redis has a build command
- Redis has a Dockerfile in backend directory

#### **Step 2: Fix Redis Service Configuration**

**Option A: Use Official Redis Image (Recommended)**

1. In Railway Redis service settings:
   - Change **Source** to **Docker Image**
   - Set **Image** to: `redis:8.2.1`
   - Remove any build command
   - Remove any Dockerfile reference
   - Save changes

2. Add Redis volume (if not already added):
   - Go to **Volumes** tab
   - Ensure `redis-volume` is attached
   - Mount point: `/data`

3. Redeploy Redis service

**Option B: Use Railway Redis Template**

1. Delete current Redis service
2. Add new service → **Template** → **Redis**
3. Railway will auto-configure Redis correctly

#### **Step 3: Verify Fix**

After redeploying Redis:

```bash
# Check Redis logs (should see Redis startup, not Node.js build)
railway logs --service redis

# Expected output:
# 1:C 09 Jan 2026 07:00:00.000 # Redis version=8.2.1
# 1:C 09 Jan 2026 07:00:00.000 # Ready to accept connections
```

**If you see Node.js/npm/prisma logs, the fix didn't work.**

---

### **Issue 2: Prisma Version Mismatch** ⚠️ **HIGH**

**Problem:**
- Local Prisma CLI version: 7.2.0 (newer)
- Package.json Prisma version: 5.7.1 (older)
- Prisma 7 has breaking changes (datasource `url` property removed)

**Error:**
```
Error: The datasource property `url` is no longer supported in schema files.
Move connection URLs for Migrate to `prisma.config.ts`
```

**Root Cause:**
- Prisma 7 changed schema format
- Local environment has Prisma 7 installed globally
- Package.json specifies Prisma 5.7.1
- Railway should use Prisma 5.7.1 from package.json

**Solution:**

**Option A: Use Prisma 5.7.1 (Recommended - No Schema Changes)**

1. Ensure Railway uses Prisma from package.json:
   ```json
   {
     "dependencies": {
       "@prisma/client": "^5.7.1",
       "prisma": "^5.7.1"
     }
   }
   ```

2. Verify Railway build uses correct version:
   - Railway should run `npm install` which installs Prisma 5.7.1
   - Check Railway build logs for Prisma version

3. If Prisma 7 is being used, pin version:
   ```json
   {
     "dependencies": {
       "@prisma/client": "5.7.1",
       "prisma": "5.7.1"
     }
   }
   ```
   (Remove `^` to pin exact version)

**Option B: Update to Prisma 7 (Breaking Changes)**

If Railway is using Prisma 7, update schema:
1. Create `prisma.config.ts` file
2. Move `DATABASE_URL` to config file
3. Update Prisma client initialization
4. Update all Prisma usage in code

**Recommendation:** Stick with Prisma 5.7.1 for now (no breaking changes needed)

**Verification:**
```bash
# Check Railway build logs for Prisma version
railway logs --build

# Should see: "Installing prisma@5.7.1"
# NOT: "Installing prisma@7.x.x"
```

---

## ⚠️ HIGH PRIORITY: Missing Environment Variables

### **Backend Service Variables Needed**

#### **1. Email Service Configuration**

**Choose ONE option:**

**Option A: SendGrid**
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
```

**Option B: AWS SES**
```bash
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_access_key
AWS_SES_SECRET_ACCESS_KEY=your_secret_key
```

**How to Add:**
1. Go to Railway dashboard
2. Select backend service (`api.leadsite.ai`)
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add variables above
6. Redeploy service

#### **2. Stripe Configuration**

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**How to Get:**
1. Go to Stripe Dashboard → Developers → API keys
2. Copy **Secret key** (starts with `sk_live_`)
3. Go to Webhooks → Add endpoint
4. Copy **Signing secret** (starts with `whsec_`)

#### **3. JWT & Security**

```bash
JWT_SECRET=your_secure_random_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
```

**Generate Secure Secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator: https://randomkeygen.com/
```

#### **4. Frontend URL & CORS**

```bash
FRONTEND_URL=https://aileadstrategies.com
CORS_ORIGINS=https://aileadstrategies.com,https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.ai,https://tackleai.ai
```

### **Frontend Service Variables Needed**

#### **AI Service**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

**How to Get:**
1. Go to Anthropic Console: https://console.anthropic.com/
2. Navigate to API Keys
3. Create new API key
4. Copy key (starts with `sk-ant-`)

---

## 🔍 VERIFICATION CHECKLIST

### **After Fixing Redis:**

- [ ] Redis service deploys successfully
- [ ] Redis logs show Redis startup (not Node.js build)
- [ ] Backend health check shows Redis connected
- [ ] No Prisma errors in Redis logs

### **After Adding Environment Variables:**

- [ ] Email sending works (test with campaign send)
- [ ] Stripe checkout works (test payment flow)
- [ ] AI email generation works (test campaign creation)
- [ ] No "not configured" errors in logs

---

## 📊 CURRENT DEPLOYMENT STATUS

### **✅ Working Services**

| Service | Status | URL | Notes |
|---------|-------|-----|-------|
| **Backend** | ✅ Online | `backend-production-2987.up.railway.app` | Operational |
| **Frontend** | ✅ Online | `superb-possibility-production.up.railway.app` | Operational |
| **PostgreSQL** | ✅ Online | Railway managed | Connected |
| **Redis** | ⚠️ Online* | Railway managed | *Using old deployment |

### **⚠️ Issues**

| Issue | Priority | Status | Fix Time |
|-------|----------|--------|----------|
| Redis deployment failure | 🔴 Critical | Needs fix | 15-30 min |
| Missing email service config | ⚠️ High | Needs config | 30 min |
| Missing Stripe keys | ⚠️ High | Needs config | 15 min |
| Missing AI keys | ⚠️ Medium | Needs config | 15 min |

---

## 🛠️ QUICK FIX COMMANDS

### **Verify Prisma Schema**

```bash
cd backend
npx prisma validate
npx prisma format
npx prisma generate
```

### **Check Railway Service Status**

```bash
railway status
railway logs --service backend
railway logs --service frontend
railway logs --service redis
```

### **Test Backend Health**

```bash
curl https://backend-production-2987.up.railway.app/health
```

### **Test Frontend Health**

```bash
curl https://superb-possibility-production.up.railway.app/api/health
```

---

## 📝 NEXT STEPS AFTER FIXES

1. ✅ Fix Redis deployment (15-30 minutes)
2. ✅ Add environment variables (30 minutes)
3. ✅ Test email sending
4. ✅ Test Stripe payment flow
5. ✅ Test AI email generation
6. ✅ Run end-to-end tests
7. ✅ Continue with Phase 2 (visual website builder)

---

**Document Version:** 1.0  
**Last Updated:** January 9, 2026
