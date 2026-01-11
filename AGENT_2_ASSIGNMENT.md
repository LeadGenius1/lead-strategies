# 🤖 AGENT 2: INFRASTRUCTURE & DEVOPS SPECIALIST

**Mission:** Enable self-healing system + email service + monitoring

**Duration:** 3-4 hours  
**Priority:** CRITICAL  
**Status:** ⏳ START IMMEDIATELY

---

## 📋 YOUR TASKS

### Task 1: Enable Self-Healing System (30 mins)
- Add `ENABLE_SELF_HEALING=true` to Railway backend
- Verify 7 agents start successfully
- Test admin dashboard

### Task 2: Configure SendGrid Email Service (60 mins)
- Sign up for SendGrid (free tier: 100 emails/day)
- Generate API key
- Add to Railway
- Test email sending

### Task 3: Set Up Sentry Monitoring (60 mins)
- Sign up for Sentry (free tier)
- Create project and get DSN
- Add to Railway + Vercel
- Test error reporting

### Task 4: Production Verification (30 mins)
- Verify all environment variables
- Test health endpoints
- Check SSL certificates
- Verify security headers

---

## 💻 YOUR COMMANDS

```powershell
# Navigate to backend
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"

# ========================================
# TASK 1: ENABLE SELF-HEALING SYSTEM
# ========================================

# 1. Add environment variable
railway variables --set ENABLE_SELF_HEALING=true

# 2. Verify variable set
railway variables | Select-String "SELF_HEALING"

# 3. Restart backend (automatic, but verify)
railway logs --follow --limit 50

# 4. Test health endpoint (should show selfHealing: enabled)
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health" | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 5. Test admin dashboard
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/admin/system/dashboard"

# ========================================
# TASK 2: SENDGRID EMAIL SERVICE
# ========================================

# Step 1: Sign up at https://sendgrid.com
# - Choose "Free Plan" (100 emails/day)
# - Verify email address
# - Complete setup wizard

# Step 2: Create API Key
# - Go to: Settings → API Keys → Create API Key
# - Name: "AI Lead Strategies Production"
# - Permissions: "Full Access"
# - Copy the key (starts with SG.)

# Step 3: Add to Railway
railway variables --set SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Step 4: Verify
railway variables | Select-String "SENDGRID"

# Step 5: Test email sending
# Create test script or use API endpoint:
$body = @{
    to = "test@example.com"
    subject = "Test Email from AI Lead Strategies"
    body = "This is a test email from the platform."
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/campaigns/test-email" -Method POST -Body $body -ContentType "application/json"

# ========================================
# TASK 3: SENTRY MONITORING
# ========================================

# Step 1: Sign up at https://sentry.io
# - Create account
# - Choose "JavaScript" platform
# - Project name: "ai-lead-strategies-backend"

# Step 2: Get DSN
# - After project creation, copy the DSN
# - Format: https://xxxxx@sentry.io/xxxxx

# Step 3: Add to Railway (Backend)
railway variables --set SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Step 4: Add to Vercel (Frontend)
# Go to Vercel Dashboard → leadsite.ai → Settings → Environment Variables
# Add: NEXT_PUBLIC_SENTRY_DSN = https://xxxxx@sentry.io/xxxxx
# Or via CLI:
# vercel env add NEXT_PUBLIC_SENTRY_DSN

# Step 5: Test error reporting
# Trigger a test error:
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/test-error"

# Check Sentry dashboard for the error

# ========================================
# TASK 4: PRODUCTION VERIFICATION
# ========================================

# 1. List all environment variables
railway variables

# 2. Test health endpoint
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 3. Check SSL certificate
Test-NetConnection -ComputerName "backend-production-2987.up.railway.app" -Port 443

# 4. Test security headers
$response = Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health"
$response.Headers

# 5. Verify Redis connection (if applicable)
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/health/redis"

# 6. Test rate limiting
1..10 | ForEach-Object {
    Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health"
    Write-Host "Request $_"
}
```

---

## ✅ YOUR DELIVERABLES

- [ ] Self-healing system enabled and running
- [ ] 7 AI agents operational and reporting status
- [ ] SendGrid account created (free tier)
- [ ] SendGrid API key added to Railway
- [ ] Test email sent successfully
- [ ] Sentry account created (free tier)
- [ ] Sentry DSN added to Railway + Vercel
- [ ] Test error captured in Sentry
- [ ] All environment variables verified
- [ ] Production health checks passing

---

## 🎯 SUCCESS CRITERIA

### Self-Healing System:
- [ ] `/health` endpoint shows `selfHealing: { enabled: true, agents: 7 }`
- [ ] `/admin/system/dashboard` returns agent status
- [ ] Railway logs show "✅ Self-Healing System started"
- [ ] All 7 agents initialized successfully

### Email Service:
- [ ] SendGrid API key valid
- [ ] Test email delivered to inbox
- [ ] No bounces or errors
- [ ] SendGrid dashboard shows successful send

### Monitoring:
- [ ] Sentry dashboard accessible
- [ ] Test error appears in Sentry
- [ ] Error details include stack trace
- [ ] Alerts configured

---

## ⚠️ POTENTIAL BLOCKERS

**If you encounter these issues:**

1. **Self-healing agents not starting:**
   - Check Railway logs: `railway logs --follow`
   - Verify `ENABLE_SELF_HEALING=true` (case-sensitive)
   - Check backend restarted after variable added
   - Verify no TypeScript/syntax errors

2. **SendGrid emails not sending:**
   - Verify API key copied correctly (starts with `SG.`)
   - Check SendGrid domain verification status
   - Verify sender email is verified in SendGrid
   - Check SendGrid activity log for errors

3. **Sentry not capturing errors:**
   - Verify DSN copied correctly
   - Check Sentry project is active
   - Verify environment variable set in both Railway + Vercel
   - Trigger test error to verify

4. **Railway variables not persisting:**
   - Use `railway link` to ensure correct project
   - Try setting via Railway dashboard instead of CLI
   - Verify Railway CLI is latest version

---

## 📊 PROGRESS TRACKING

Update this section every 30 minutes:

**Hour 1:**
- [ ] Self-healing system enabled
- [ ] Agent status verified
- [ ] SendGrid account created

**Hour 2:**
- [ ] SendGrid API key configured
- [ ] Test email sent
- [ ] Sentry account created

**Hour 3:**
- [ ] Sentry DSN configured (Railway + Vercel)
- [ ] Test error captured
- [ ] Environment variables verified

**Hour 4:**
- [ ] All health checks passing
- [ ] Documentation updated
- [ ] Handoff to Agent 4 (Testing)

---

## 📝 ACCOUNTS TO CREATE

| Service | URL | Plan | Purpose |
|---------|-----|------|---------|
| SendGrid | https://sendgrid.com | Free (100 emails/day) | Email delivery |
| Sentry | https://sentry.io | Free | Error tracking |

**Save credentials in password manager!**

---

## 🚀 START NOW!

**Your first command:**

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"
Write-Host "AGENT 2 STARTING INFRASTRUCTURE SETUP..." -ForegroundColor Cyan
railway variables --set ENABLE_SELF_HEALING=true
```

**Report status every 30 minutes to project lead.**

**Expected completion:** 3-4 hours from now.
