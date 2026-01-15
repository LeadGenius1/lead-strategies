# Railway Deployment Guide

## 🚂 Railway Configuration

This project is deployed on **Railway** (not Vercel). Both frontend and backend run on Railway.

---

## 📋 Setting Up Daily Email Cron Job

Railway doesn't have built-in cron like Vercel. You have **3 options** for scheduling the daily email process:

### Option 1: Railway Cron Service (Recommended)

1. **Create a new Cron service in Railway:**
   - Go to your Railway project
   - Click "New" → "Cron"
   - Set schedule: `0 2 * * *` (daily at 2 AM UTC)
   - Set command: `node scripts/cron-daily-email.js`
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL` - Your Railway frontend URL
     - `CRON_SECRET` - Secret for authentication

2. **The cron script will:**
   - Call the `/api/ai-agent/daily-email` endpoint
   - Process all active users
   - Schedule emails for 8am send

### Option 2: External Cron Service

Use a free cron service like **cron-job.org** or **EasyCron**:

1. **Sign up** at cron-job.org (free)
2. **Create new cron job:**
   - URL: `https://your-railway-app.up.railway.app/api/ai-agent/daily-email`
   - Method: POST
   - Schedule: Daily at 2:00 AM UTC
   - Headers:
     - `Content-Type: application/json`
     - `x-cron-secret: YOUR_CRON_SECRET`
   - Body: `{"cronSecret": "YOUR_CRON_SECRET"}`

### Option 3: Backend Cron Service

Run the cron job from your backend service:

1. **Add cron endpoint to backend:**
   - Create endpoint that calls frontend API
   - Schedule via Railway Cron or external service
   - Backend handles the scheduling logic

---

## 🔐 Environment Variables

Set these in Railway Dashboard → Variables:

### Frontend Service:
```env
NEXT_PUBLIC_API_URL=https://backend-production-2987.up.railway.app
CRON_SECRET=your-secure-random-secret-here
```

### Cron Service (if using Option 1):
```env
NEXT_PUBLIC_API_URL=https://your-frontend-app.up.railway.app
CRON_SECRET=your-secure-random-secret-here
```

---

## 🚀 Deployment Steps

1. **Push to GitHub** (already done ✅)
2. **Railway auto-deploys** from GitHub
3. **Set environment variables** in Railway dashboard
4. **Set up cron job** using one of the options above
5. **Verify deployment** at your Railway URL

---

## 📝 Railway-Specific Notes

- Railway auto-deploys on git push
- Use Railway's public domain or custom domain
- Environment variables are set per service
- Cron jobs run as separate services
- Check Railway logs for debugging

---

## ✅ Current Status

- ✅ Code pushed to GitHub
- ✅ Build successful
- ✅ API routes ready
- ⏳ Set up Railway cron job
- ⏳ Configure environment variables

---

**Deployment Platform:** Railway (Frontend + Backend)
**Cron Solution:** Railway Cron Service or External Cron
