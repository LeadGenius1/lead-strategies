# Backend Deployment Guide

## 🎯 Current Situation

Railway shows backend service as "Online" at `api.leadsite.ai`, but:
- Backend code may not be deployed
- Backend endpoints may not be implemented
- Backend may need to be redeployed with latest code

## 📋 What Needs to Happen

### Option 1: Backend Repository Exists
If you have a backend repository:

1. **Check Backend Repository:**
   ```bash
   # Navigate to backend directory
   cd path/to/backend-repo
   
   # Check git status
   git status
   
   # Check if connected to Railway
   railway status
   ```

2. **Deploy Backend:**
   ```bash
   # Deploy to Railway
   railway up
   
   # OR if connected to GitHub, push and Railway will auto-deploy
   git push origin main
   ```

### Option 2: Backend Needs to Be Created
If backend doesn't exist yet, you need to:

1. **Create Backend Repository**
2. **Implement All Required Endpoints** (see ACTIVATION-REQUIREMENTS.md)
3. **Set Up Database Schema**
4. **Configure Railway Service**
5. **Deploy to Railway**

---

## 🚀 Quick Start: Deploy Existing Backend

### Step 1: Locate Backend Code
- Check if backend is in a separate repository
- Or check if backend code exists in a `backend/` folder
- Or check Railway to see which GitHub repo is connected

### Step 2: Connect Backend to Railway

**If using Railway CLI:**
```bash
cd backend-directory
railway login
railway link  # Link to existing backend service
railway up    # Deploy
```

**If using GitHub:**
1. Go to Railway Dashboard
2. Select Backend service
3. Go to "Settings" tab
4. Check "Source" - see which repo is connected
5. Push code to that repo to trigger deployment

### Step 3: Set Environment Variables

In Railway Backend service → Variables tab, set:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# JWT
JWT_SECRET=your-secret-key-here

# Email Service (choose one)
SENDGRID_API_KEY=your-key
# OR
MAILGUN_API_KEY=your-key
MAILGUN_DOMAIN=your-domain

# Internal API Key (for AI agent)
INTERNAL_API_KEY=secure-random-key

# CORS (allow frontend domain)
CORS_ORIGIN=https://aileadstrategies.com

# Node Environment
NODE_ENV=production
```

### Step 4: Verify Deployment

1. **Check Railway Logs:**
   - Go to Backend service → Logs tab
   - Look for startup messages
   - Check for errors

2. **Test Endpoint:**
   ```bash
   curl https://api.leadsite.ai/api/health
   # Should return success response
   ```

---

## 📝 Required Backend Endpoints Summary

The frontend expects these endpoints at `https://api.leadsite.ai`:

### Authentication (Critical)
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Campaigns
- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `GET /api/campaigns/daily-status`

### Prospects
- `GET /api/prospects`
- `POST /api/prospects`
- `GET /api/prospects/:id`
- `POST /api/prospects/:id/send-email`
- `POST /api/prospects/search`

### Users
- `GET /api/users/active`
- `GET /api/users/:userId`
- `PUT /api/users/profile`
- `PUT /api/users/password`

### Inbox
- `GET /api/inbox/messages`
- `POST /api/inbox/messages/:id/reply`
- `POST /api/inbox/ai-suggest`

### CRM
- `GET /api/crm/deals`
- `POST /api/crm/deals`
- `PUT /api/crm/deals/:id`
- `DELETE /api/crm/deals/:id`

### Calls
- `GET /api/calls`
- `POST /api/calls/make`

### Websites
- `GET /api/websites`
- `POST /api/websites/analyze`
- `GET /api/websites/:id/prospects`

### AI Agent (Internal)
- `POST /api/ai/generate-email`
- `POST /api/campaigns/schedule`
- `POST /api/campaigns/status`

---

## 🔍 Troubleshooting

### Backend Shows "Online" but Endpoints Return 404:
- Backend code may not have routes implemented
- Check Railway logs for route registration
- Verify endpoint paths match frontend expectations

### Backend Shows "Online" but Returns 500 Errors:
- Check Railway logs for error details
- Verify database connection
- Check environment variables
- Verify dependencies are installed

### How to Check What's Actually Deployed:
1. Go to Railway → Backend service → Deployments tab
2. Click on latest deployment
3. Check "Source" to see which commit/repo
4. Compare with your local backend code

---

## ✅ Next Steps

1. **Identify Backend Location:**
   - Where is your backend code?
   - Is it in a separate repository?
   - Is it already connected to Railway?

2. **Deploy Backend:**
   - Use Railway CLI: `railway up`
   - Or push to GitHub (if connected)
   - Or manually deploy from Railway dashboard

3. **Verify:**
   - Check Railway logs
   - Test endpoints
   - Verify frontend can connect

---

**Need Help?**
- Check Railway logs for specific errors
- Verify backend repository location
- Ensure all endpoints are implemented
- Test endpoints individually
