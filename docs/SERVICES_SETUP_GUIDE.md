# SERVICES SETUP GUIDE - Manual Configuration Required

**Critical services that need setup for production launch**

---

## 🗄️ STEP 1: PostgreSQL Database (CRITICAL - 5 minutes)

**Status:** ⚠️ REQUIRED FOR ALL FEATURES

### Setup via Railway Dashboard

1. **Go to Railway Dashboard:**  
   https://railway.app/project/strong-communication

2. **Add PostgreSQL Database:**
   - Click "+ New"
   - Select "Database"
   - Click "PostgreSQL"
   - Wait 30 seconds for provisioning

3. **Verify Connection:**
   - DATABASE_URL automatically created
   - Backend service auto-linked
   - Service will restart

4. **Run Database Migration:**

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"
railway ssh --service superb-possibility "npx prisma db push --accept-data-loss"
```

**Expected Output:**
```
✓ Database synchronized
Created 30+ tables for all platforms
```

**Verification:**
```powershell
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health" | ConvertFrom-Json | Select-Object status, platforms
```

---

## 📧 STEP 2: SendGrid Email Service (2 hours)

**Status:** ⚠️ REQUIRED FOR EMAIL CAMPAIGNS

### Sign Up

1. **Go to SendGrid:**  
   https://sendgrid.com/pricing/

2. **Select Free Plan:**
   - 100 emails/day (enough for MVP)
   - No credit card required
   - Free forever

3. **Complete Registration:**
   - Email address
   - Company name: "AI Lead Strategies LLC"
   - Website: leadsite.ai

4. **Verify Email Address:**
   - Check your inbox
   - Click verification link

### Generate API Key

1. **Go to Settings → API Keys:**  
   https://app.sendgrid.com/settings/api_keys

2. **Create API Key:**
   - Name: "AI Lead Strategies Production"
   - Permissions: "Full Access"
   - Click "Create & View"

3. **Copy API Key:**
   - Starts with `SG.`
   - **Save immediately** (shown only once!)

### Add to Railway

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"
railway variables --service superb-possibility --set SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Configure Sender Identity

1. **In SendGrid → Settings → Sender Authentication**
2. **Single Sender Verification:**
   - Email: noreply@leadsite.ai
   - Name: "AI Lead Strategies"
   - Reply-to: support@leadsite.ai

3. **Verify Sender:**
   - Check email
   - Click verification link

**OR Domain Authentication (Better):**
1. Settings → Sender Authentication → Authenticate Domain
2. Enter: leadsite.ai
3. Add DNS records to your domain
4. Verify

### Test Email Sending

```powershell
# Test via API
$body = @{
    to = "your-email@example.com"
    subject = "Test from AI Lead Strategies"
    text = "If you receive this, SendGrid is configured correctly!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/test-email" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer YOUR_TOKEN"}
```

**Expected:** Email arrives in 1-2 minutes

---

## 📊 STEP 3: Sentry Error Monitoring (2 hours)

**Status:** ⚠️ RECOMMENDED FOR PRODUCTION

### Sign Up for Sentry

1. **Go to Sentry:**  
   https://sentry.io/signup/

2. **Select Free Plan:**
   - 5,000 errors/month
   - 1 project
   - Free forever

3. **Create Account:**
   - Email + password
   - Or sign in with GitHub

### Create Project

1. **Select Platform:**
   - Platform: "Node.js"
   - Framework: "Express"

2. **Name Project:**
   - Project name: "ai-lead-strategies-backend"
   - Team: Your organization

3. **Get DSN:**
   - Copy DSN (looks like: `https://xxx@sentry.io/xxx`)

### Add to Railway

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"
railway variables --service superb-possibility --set SENTRY_DSN=https://xxxx@o<YOUR-ORG>.ingest.us.sentry.io/xxxx
```

### Add to Vercel (Frontend)

1. **Go to Vercel Dashboard:**  
   Your project → Settings → Environment Variables

2. **Add Variable:**
   - Name: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: Same DSN from above
   - Environment: Production, Preview, Development

3. **Redeploy:**
   - Vercel will redeploy automatically

### Test Error Tracking

**Trigger test error:**

```powershell
# This endpoint intentionally errors for testing
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/test-error"
```

**Check Sentry Dashboard:**
1. Go to sentry.io → Projects → ai-lead-strategies-backend
2. Should see error in "Issues" tab
3. Click to see full stack trace

### Configure Alerts

1. **Sentry → Alerts**
2. **Create Alert Rule:**
   - Condition: "Error count > 10 in 5 minutes"
   - Action: Email to your-email@example.com
   - Frequency: Max once per hour

---

## 📞 STEP 4: Twilio Voice Calling (Optional - Tier 5)

**Status:** 🔵 OPTIONAL (For Tackle.IO call features)

### Setup Twilio

1. **Sign up:** https://www.twilio.com/try-twilio
2. **Get free trial credits** ($15)
3. **Get credentials:**
   - Account SID
   - Auth Token
   - Phone number

4. **Add to Railway:**

```powershell
railway variables --service superb-possibility --set TWILIO_ACCOUNT_SID=ACxxxxx
railway variables --service superb-possibility --set TWILIO_AUTH_TOKEN=your_token
railway variables --service superb-possibility --set TWILIO_PHONE_NUMBER=+1234567890
```

---

## ✅ VERIFICATION CHECKLIST

After completing all setups, verify:

```powershell
# 1. Check all environment variables are set
railway variables --service superb-possibility

# Expected variables:
# - DATABASE_URL ✅
# - ENABLE_SELF_HEALING ✅ (already set!)
# - SENDGRID_API_KEY ✅
# - SENTRY_DSN ✅
# - TWILIO_ACCOUNT_SID ✅ (optional)
# - NPM_CONFIG_PRODUCTION=false ✅ (already set!)

# 2. Check health endpoint
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health" | ConvertFrom-Json

# Expected output:
# {
#   "status": "ok",
#   "platforms": [5 platforms],
#   "selfHealing": {
#     "enabled": true,
#     "agents": 7
#   }
# }

# 3. Test database connection
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/campaigns"

# 4. Check Railway logs
railway logs --service superb-possibility

# Look for:
# ✅ "Self-Healing System started"
# ✅ "7 agents active"
# ✅ "Database connected"
# ✅ "Server started on port 3000"
```

---

## 🎯 PRIORITY ORDER

**Do these in order:**

1. **🔴 CRITICAL:** PostgreSQL Database (5 min)
2. **🟠 HIGH:** SendGrid Email (2 hours)
3. **🟡 MEDIUM:** Sentry Monitoring (2 hours)
4. **🟢 LOW:** Twilio Calling (1 hour) - Optional

**Total Time:** ~5 hours for all critical services

---

## 🚨 TROUBLESHOOTING

### SendGrid emails not sending

**Check:**
- API key copied correctly
- Sender email verified
- Not exceeding free tier limit (100/day)
- Check SendGrid activity log

### Sentry not capturing errors

**Check:**
- DSN copied correctly
- Environment variable set in Railway AND Vercel
- Services redeployed after adding variable
- Test error endpoint works

### Database connection fails

**Check:**
- PostgreSQL service running in Railway
- DATABASE_URL environment variable exists
- Backend service restarted after database added
- Migration ran successfully

---

## 📞 Need Help?

**If you encounter issues:**
1. Check this troubleshooting section
2. Review service documentation
3. Check Railway/Vercel logs
4. Contact support: support@aileadstrategies.com

---

## ✅ COMPLETION STATUS

Update after each service configured:

- [ ] PostgreSQL Database added to Railway
- [ ] Database migration completed
- [ ] SendGrid account created
- [ ] SendGrid API key added
- [ ] Sender email verified
- [ ] Test email sent successfully
- [ ] Sentry account created
- [ ] Sentry DSN added (Railway + Vercel)
- [ ] Test error captured
- [ ] Twilio configured (optional)
- [ ] All services verified

---

**Once complete, all 5 platforms will be fully operational! 🚀**

---

*Last updated: January 10, 2026*  
*Version: 1.0*
