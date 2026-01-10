# Infrastructure Fix Guide
## Making Infrastructure Solid, Sound, and Unbreakable

**Date:** January 9, 2026  
**Status:** Critical Infrastructure Fixes Required

---

## 🎯 INFRASTRUCTURE FIX PRIORITIES

### **Priority 1: Fix Redis Deployment** 🔴 **CRITICAL**

**Problem:**
- Redis service is trying to build Node.js backend instead of running Redis
- Deployment fails with Prisma schema validation errors
- Currently using old deployment (cannot update)

**Solution:**

#### **Option A: Use Official Redis Docker Image (Recommended)**

1. **Go to Railway Dashboard:**
   - Navigate to: https://railway.app
   - Select project: `ai-lead-strategies`
   - Click on **Redis** service

2. **Fix Service Configuration:**
   - Go to **Settings** tab
   - Click **Source** section
   - Change to **Docker Image**
   - Set image to: `redis:8.2.1`
   - **Remove any build command**
   - **Remove any Dockerfile reference**
   - Save changes

3. **Configure Redis Volume (if needed):**
   - Go to **Volumes** tab
   - Ensure volume is attached
   - Mount point: `/data`
   - This persists Redis data

4. **Redeploy:**
   - Railway will automatically redeploy
   - Check logs - should see Redis startup, not Node.js build

**Expected Logs:**
```
1:C 09 Jan 2026 07:00:00.000 # Redis version=8.2.1
1:C 09 Jan 2026 07:00:00.000 # Ready to accept connections
```

**Verification:**
```bash
railway logs --service redis
# Should see Redis logs, NOT npm/prisma logs
```

---

#### **Option B: Use Railway Redis Template (Alternative)**

1. **Delete current Redis service** (if Option A doesn't work)
2. **Add new service:**
   - Click **+ New** → **Template**
   - Search for **Redis**
   - Select **Redis** template
   - Railway auto-configures correctly

3. **Update backend REDIS_URL:**
   - Get new Redis URL from Railway
   - Update backend environment variable

---

### **Priority 2: Configure Backend Environment Variables** 🟡 **HIGH**

**Required Variables:**

#### **Email Service Configuration**

**Option A: SendGrid (Recommended for Start)**
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Option B: AWS SES (For Scale)**
```bash
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SES_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
```

**How to Set:**
1. Go to Railway → `ai-lead-strategies` project → `backend` service
2. Go to **Variables** tab
3. Add each variable:
   - Click **+ New Variable**
   - Enter name and value
   - Save

---

#### **Stripe Configuration**

```bash
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET_HERE
```

**How to Get:**
1. Go to Stripe Dashboard: https://dashboard.stripe.com
2. **API Keys:**
   - Go to **Developers** → **API keys**
   - Copy **Secret key** (starts with `sk_live_` or `sk_test_`)
3. **Webhook Secret:**
   - Go to **Developers** → **Webhooks**
   - Create endpoint: `https://backend-production-2987.up.railway.app/api/webhooks/stripe`
   - Copy **Signing secret** (starts with `whsec_`)

**How to Set:**
- Railway → `backend` service → **Variables** → Add both variables

---

#### **Anthropic AI Configuration**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to Get:**
1. Go to Anthropic Console: https://console.anthropic.com
2. Go to **API Keys**
3. Create new key or copy existing
4. Key starts with `sk-ant-`

**How to Set:**
- Railway → `backend` service → **Variables** → Add variable

---

#### **JWT & Security Configuration**

```bash
JWT_SECRET=<generate-strong-random-secret-here>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://aileadstrategies.com
CORS_ORIGINS=https://aileadstrategies.com,https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.ai,https://tackleai.ai
```

**Generate JWT_SECRET:**
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use online generator: https://randomkeygen.com/
```

**How to Set:**
- Railway → `backend` service → **Variables** → Add all variables

---

### **Priority 3: Configure Frontend Environment Variables** 🟡 **MEDIUM**

**Required Variables:**

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to Set:**
1. Go to Railway → `strong-communication` project → `superb-possibility` service
2. Go to **Variables** tab
3. Add `ANTHROPIC_API_KEY` (same value as backend)

**Note:** Frontend already has:
- ✅ `RAILWAY_API_URL`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXT_PUBLIC_URL`
- ✅ `NODE_ENV`
- ✅ `PORT`

---

### **Priority 4: Verify Prisma Version** 🟢 **MEDIUM**

**Current Configuration:**
- `backend/package.json` specifies: `"prisma": "^5.7.1"`
- Railway should use this version automatically

**Verification Steps:**

1. **Check Railway Build Logs:**
   - Go to Railway → `backend` service → **Deployments**
   - Click latest deployment
   - Check build logs for Prisma version
   - Should see: `prisma@5.7.1` or similar

2. **If Prisma 7 Detected:**
   - Pin version explicitly in `package.json`:
   ```json
   {
     "devDependencies": {
       "prisma": "5.7.1"
     },
     "dependencies": {
       "@prisma/client": "5.7.1"
     }
   }
   ```
   - Remove `^` to prevent auto-upgrade
   - Redeploy backend

3. **Test Prisma Locally:**
   ```bash
   cd backend
   npm install
   npx prisma validate
   # Should succeed without errors
   ```

---

## 🔧 RAILWAY-SPECIFIC FIXES

### **Fix Redis via Railway CLI**

```bash
# Link to project
railway link --project d1b9bb16-40cd-4f6c-8c82-e4ef1efa98ae

# Link to Redis service
railway service link Redis

# Check Redis logs
railway logs --service Redis

# Set Redis variables (if needed)
railway variables set REDIS_PASSWORD=your-password --service Redis
```

**Note:** Redis configuration changes must be done in Railway Dashboard (Settings → Source).

---

### **Set Environment Variables via Railway CLI**

```bash
# Link to backend service
railway service link backend

# Set variables
railway variables set EMAIL_SERVICE=sendgrid --service backend
railway variables set SENDGRID_API_KEY=SG.xxx --service backend
railway variables set STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE --service backend
railway variables set STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET_HERE --service backend
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx --service backend
railway variables set JWT_SECRET=<generate-random-64-chars> --service backend
railway variables set JWT_EXPIRES_IN=7d --service backend
railway variables set FRONTEND_URL=https://aileadstrategies.com --service backend
railway variables set CORS_ORIGINS=https://aileadstrategies.com,https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.ai,https://tackleai.ai --service backend

# Link to frontend service
railway link --project fc3a1567-b76f-4ba1-9e5c-b288b16854e9
railway service link superb-possibility

# Set frontend variables
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx --service superb-possibility
```

---

## ✅ VERIFICATION CHECKLIST

After fixing infrastructure, verify everything works:

### **1. Redis Verification**
- [ ] Redis logs show Redis startup (not Node.js build)
- [ ] Backend can connect to Redis
- [ ] Redis is accessible via `REDIS_URL`

**Test:**
```bash
railway logs --service Redis
# Should see: "Ready to accept connections"
```

### **2. Backend Verification**
- [ ] All environment variables set
- [ ] Backend health check passes: `https://backend-production-2987.up.railway.app/health`
- [ ] Email service configured (or mock working)
- [ ] Stripe routes accessible (with API keys)
- [ ] AI routes accessible (with API key)

**Test:**
```bash
# Health check
curl https://backend-production-2987.up.railway.app/health

# Should return: {"status":"ok","timestamp":"...","database":"connected","redis":"connected"}
```

### **3. Frontend Verification**
- [ ] Frontend environment variables set
- [ ] Frontend health check passes: `https://superb-possibility-production.up.railway.app/api/health`
- [ ] Frontend can connect to backend
- [ ] AI features work (with API key)

**Test:**
```bash
# Health check
curl https://superb-possibility-production.up.railway.app/api/health

# Should return: {"status":"ok","frontend":"operational","backend":"configured"}
```

### **4. Database Verification**
- [ ] Database connected
- [ ] Prisma migrations applied
- [ ] Schema matches code

**Test:**
```bash
railway run --service backend npx prisma db push
# Should succeed without errors
```

### **5. End-to-End Verification**
- [ ] User signup works
- [ ] User login works
- [ ] Dashboard loads
- [ ] Campaign creation works
- [ ] Lead import works
- [ ] Website creation works (Tier 2+)

**Test:**
```bash
# Run E2E test script
node scripts/e2e-test.js
```

---

## 🚨 TROUBLESHOOTING

### **Redis Still Failing**

**Symptoms:**
- Logs show npm/prisma errors
- Deployment fails

**Fix:**
1. Double-check Settings → Source is `redis:8.2.1`
2. Ensure no build command exists
3. Ensure no Dockerfile reference
4. Try Option B (delete and recreate with template)

---

### **Environment Variables Not Working**

**Symptoms:**
- Backend still uses defaults
- API calls fail

**Fix:**
1. Verify variables are set in correct service
2. Verify variable names match code (case-sensitive)
3. Redeploy service after setting variables
4. Check logs for variable loading errors

---

### **Prisma Version Mismatch**

**Symptoms:**
- Build fails with schema errors
- Local vs Railway version mismatch

**Fix:**
1. Pin Prisma version in `package.json` (remove `^`)
2. Clear Railway build cache
3. Redeploy backend
4. Verify build logs show correct version

---

## 📊 INFRASTRUCTURE HEALTH MONITORING

### **Create Health Check Script**

Create `scripts/health-check.ps1`:

```powershell
# Check all services
$backend = Invoke-RestMethod -Uri "https://backend-production-2987.up.railway.app/health"
$frontend = Invoke-RestMethod -Uri "https://superb-possibility-production.up.railway.app/api/health"

Write-Host "Backend: $($backend.status)"
Write-Host "Frontend: $($frontend.status)"
```

Run daily to monitor infrastructure health.

---

## 🎯 SUCCESS CRITERIA

Infrastructure is **solid, sound, and unbreakable** when:

1. ✅ **Redis:** Running correctly, no build errors
2. ✅ **Backend:** All env vars configured, health check passes
3. ✅ **Frontend:** All env vars configured, health check passes
4. ✅ **Database:** Connected, migrations applied
5. ✅ **Email:** Service configured (SendGrid or SES)
6. ✅ **Payments:** Stripe configured and working
7. ✅ **AI:** Anthropic API configured and working
8. ✅ **Security:** JWT secrets strong, CORS configured
9. ✅ **Monitoring:** Health checks passing
10. ✅ **E2E:** All user flows working

---

## 📝 NEXT STEPS AFTER INFRASTRUCTURE FIXES

1. **Test All Features:**
   - Signup/login
   - Campaign creation/sending
   - Lead import/export
   - Website creation/publishing

2. **Monitor for 24 Hours:**
   - Check logs for errors
   - Monitor health endpoints
   - Test critical user flows

3. **Proceed to Phase 2:**
   - Complete LeadSite.IO visual builder
   - Build section components
   - Create template library

---

**Document Created:** January 9, 2026  
**Last Updated:** January 9, 2026  
**Status:** Ready for Implementation
