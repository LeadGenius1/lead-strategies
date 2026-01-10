# Railway Environment Variables Quick Setup Guide
## Quick Reference for Setting Infrastructure Variables

**Date:** January 9, 2026  
**Purpose:** Quick setup guide for Railway environment variables

---

## 🚀 QUICK SETUP (Copy-Paste Ready)

### **Backend Service** (`ai-lead-strategies` → `backend`)

**Required Variables:**

```bash
# Email Service (Choose ONE)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OR
EMAIL_SERVICE=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
AWS_SES_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
```

# Stripe
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET_HERE

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Security
JWT_SECRET=<generate-using-scripts/generate-jwt-secret.ps1>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://aileadstrategies.com
CORS_ORIGINS=https://aileadstrategies.com,https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.ai,https://tackleai.ai
```

---

### **Frontend Service** (`strong-communication` → `superb-possibility`)

**Required Variables:**

```bash
# Anthropic AI (for frontend AI features)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Already Configured:**
- ✅ `RAILWAY_API_URL`
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXT_PUBLIC_URL`
- ✅ `NODE_ENV`
- ✅ `PORT`

---

## 📋 STEP-BY-STEP SETUP

### **Step 1: Generate JWT Secret**

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"
.\scripts\generate-jwt-secret.ps1
```

Copy the generated secret for `JWT_SECRET` variable.

---

### **Step 2: Set Backend Variables**

**Via Railway Dashboard:**
1. Go to: https://railway.app
2. Select project: `ai-lead-strategies`
3. Click service: `backend`
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add each variable from the list above

**Via Railway CLI:**
```bash
# Link to backend service
railway link --project d1b9bb16-40cd-4f6c-8c82-e4ef1efa98ae
railway service link backend

# Set variables
railway variables set EMAIL_SERVICE=sendgrid --service backend
railway variables set SENDGRID_API_KEY=SG.xxx --service backend
railway variables set STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE --service backend
railway variables set STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET_HERE --service backend
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx --service backend
railway variables set JWT_SECRET=<generated-secret> --service backend
railway variables set JWT_EXPIRES_IN=7d --service backend
railway variables set FRONTEND_URL=https://aileadstrategies.com --service backend
railway variables set CORS_ORIGINS=https://aileadstrategies.com,https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.ai,https://tackleai.ai --service backend
```

---

### **Step 3: Set Frontend Variables**

**Via Railway Dashboard:**
1. Go to: https://railway.app
2. Select project: `strong-communication`
3. Click service: `superb-possibility`
4. Go to **Variables** tab
5. Add `ANTHROPIC_API_KEY`

**Via Railway CLI:**
```bash
# Link to frontend service
railway link --project fc3a1567-b76f-4ba1-9e5c-b288b16854e9
railway service link superb-possibility

# Set variable
railway variables set ANTHROPIC_API_KEY=sk-ant-xxx --service superb-possibility
```

---

### **Step 4: Fix Redis Configuration**

**Via Railway Dashboard:**
1. Go to: https://railway.app
2. Select project: `ai-lead-strategies`
3. Click service: `Redis`
4. Go to **Settings** tab
5. Click **Source** section
6. Change to **Docker Image**
7. Set image: `redis:8.2.1`
8. Remove any build command
9. Remove any Dockerfile reference
10. Save changes

---

### **Step 5: Verify Configuration**

```powershell
# Run comprehensive health check
.\scripts\health-check-comprehensive.ps1 -Detailed

# Or run basic infrastructure check
.\scripts\fix-infrastructure.ps1
```

---

## 🔑 WHERE TO GET API KEYS

### **SendGrid API Key**
1. Go to: https://app.sendgrid.com
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `Railway Production`
5. Permissions: **Full Access** (or **Mail Send** only)
6. Copy key (starts with `SG.`)

### **Stripe API Keys**
1. Go to: https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy **Secret key** (starts with `sk_live_` or `sk_test_`)
4. Navigate to **Developers** → **Webhooks**
5. Create endpoint: `https://backend-production-2987.up.railway.app/api/webhooks/stripe`
6. Copy **Signing secret** (starts with `whsec_`)

### **Anthropic API Key**
1. Go to: https://console.anthropic.com
2. Navigate to **API Keys**
3. Click **Create Key**
4. Name: `Railway Production`
5. Copy key (starts with `sk-ant-`)

### **AWS SES Credentials** (if using SES)
1. Go to: https://console.aws.amazon.com/ses
2. Navigate to **SMTP Settings**
3. Create SMTP credentials
4. Copy **Access Key ID** and **Secret Access Key**
5. Note **Region** (e.g., `us-east-1`)

---

## ✅ VERIFICATION CHECKLIST

After setting variables:

- [ ] Backend variables set (8 variables)
- [ ] Frontend variables set (1 variable)
- [ ] Redis configured correctly (Docker image)
- [ ] Health checks passing
- [ ] Email service working (test send)
- [ ] Stripe working (test checkout)
- [ ] AI features working (test generation)

---

## 🚨 TROUBLESHOOTING

### **Variables Not Working**
- Verify variable names match exactly (case-sensitive)
- Redeploy service after setting variables
- Check logs for variable loading errors

### **Redis Still Failing**
- Double-check Docker image is `redis:8.2.1`
- Ensure no build command exists
- Check Redis logs in Railway dashboard

### **API Keys Invalid**
- Verify keys are copied completely (no truncation)
- Check key permissions/access
- Verify keys are for correct environment (production vs test)

---

**Document Created:** January 9, 2026  
**Last Updated:** January 9, 2026
