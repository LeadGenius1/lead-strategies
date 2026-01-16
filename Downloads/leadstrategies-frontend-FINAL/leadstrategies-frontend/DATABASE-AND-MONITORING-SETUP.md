# 🗄️ Database Reset & Monitoring Setup

**Date:** January 15, 2026  
**Status:** ✅ Scripts Created & Ready

---

## 📋 Overview

This document explains how to:
1. **Clear the database** - Remove all user data and mock data
2. **Set up monitoring** - Ensure platform monitoring is active

---

## 🗄️ Database Reset

### ⚠️ IMPORTANT

**These scripts must be run on the BACKEND server**, not the frontend.

The backend repository is: `LeadGenius1/lead-strategies-backend`

### Quick Start

1. **Copy scripts to backend:**
   ```bash
   # Copy these files to backend/scripts/:
   - scripts/reset-database-safe.js (recommended)
   - scripts/reset-database.js (for automation)
   ```

2. **Run safe reset (requires confirmation):**
   ```bash
   cd lead-strategies-backend
   node scripts/reset-database-safe.js
   ```

3. **Follow prompts:**
   - Type `RESET` to confirm
   - Type `DELETE ALL DATA` to confirm again

### What Gets Deleted

- ✅ All users
- ✅ All leads/prospects
- ✅ All campaigns
- ✅ All websites
- ✅ All conversations
- ✅ All CRM deals
- ✅ All calls
- ✅ All analytics data
- ✅ All integrations
- ✅ All scheduled emails

### What Stays Intact

- ✅ Database schema (tables remain)
- ✅ Database structure
- ✅ Migrations history

---

## 📊 Monitoring Setup

### Quick Start

1. **Run monitoring setup:**
   ```bash
   node scripts/setup-monitoring.js
   ```

2. **Run health check:**
   ```bash
   node scripts/health-check.js
   ```

3. **Set up continuous monitoring:**
   ```bash
   # Add to cron (every 5 minutes)
   */5 * * * * cd /path/to/project && node scripts/health-check.js
   ```

### Monitoring Checks

The scripts check:
- ✅ Frontend availability (`https://leadsite.ai`)
- ✅ Backend availability (`https://api.leadsite.ai`)
- ✅ Health endpoint (`https://api.leadsite.ai/api/v1/health`)
- ✅ Response times
- ✅ Error rates

---

## 🚀 Implementation Steps

### Step 1: Copy Scripts to Backend

The scripts are currently in the frontend repository. Copy them to the backend:

```bash
# From frontend repo
cp scripts/reset-database-safe.js ../lead-strategies-backend/scripts/
cp scripts/reset-database.js ../lead-strategies-backend/scripts/
cp scripts/setup-monitoring.js ../lead-strategies-backend/scripts/
cp scripts/health-check.js ../lead-strategies-backend/scripts/
```

### Step 2: Install Dependencies (Backend)

Ensure backend has required dependencies:

```bash
cd lead-strategies-backend
npm install @prisma/client readline
```

### Step 3: Run Database Reset

```bash
# Safe reset (recommended)
node scripts/reset-database-safe.js

# Or direct reset (for automation)
node scripts/reset-database.js
```

### Step 4: Verify Database is Empty

```bash
# Using Prisma Studio
npx prisma studio

# Or check via database client
# All tables should be empty
```

### Step 5: Set Up Monitoring

```bash
# Initial setup
node scripts/setup-monitoring.js

# Test health check
node scripts/health-check.js

# Set up cron job (optional)
crontab -e
# Add: */5 * * * * cd /path/to/backend && node scripts/health-check.js
```

---

## 🔧 Railway-Specific Instructions

### Database Reset on Railway

1. **Access Railway backend service**
2. **Open terminal/console**
3. **Run reset script:**
   ```bash
   node scripts/reset-database-safe.js
   ```

### Monitoring on Railway

Railway has built-in monitoring:
- ✅ Logs (real-time)
- ✅ Metrics (CPU, Memory, Network)
- ✅ Deployment status
- ✅ Health checks

**To enable:**
1. Go to Railway dashboard
2. Select backend service
3. Go to Settings → Notifications
4. Configure alerts

---

## 📋 External Monitoring Setup

### Recommended Services:

1. **UptimeRobot** (Free)
   - 50 monitors
   - 5-minute intervals
   - Email/SMS alerts
   - Setup: https://uptimerobot.com

2. **Sentry** (Error Tracking)
   - Real-time error tracking
   - Performance monitoring
   - Setup: https://sentry.io

3. **Logtail** (Log Aggregation)
   - Centralized logging
   - Search and filter
   - Setup: https://logtail.com

See `MONITORING-SETUP-GUIDE.md` for detailed instructions.

---

## ✅ Verification Checklist

### Database Reset:
- [ ] Scripts copied to backend
- [ ] Dependencies installed
- [ ] Database reset completed
- [ ] Database verified empty
- [ ] Test user created successfully

### Monitoring:
- [ ] Setup script runs successfully
- [ ] Health check works
- [ ] Frontend monitored
- [ ] Backend monitored
- [ ] Alerts configured
- [ ] External monitoring set up (optional)

---

## 🚨 Troubleshooting

### Database Reset Issues

**Error: "Cannot find module '@prisma/client'"**
- Solution: Run `npm install` in backend directory

**Error: "Connection refused"**
- Solution: Check `DATABASE_URL` in backend `.env`

**Error: "Table does not exist"**
- Solution: Run `npx prisma migrate deploy`

### Monitoring Issues

**Health check fails**
- Check endpoints are accessible
- Verify health endpoint exists
- Check network connectivity

**Scripts not found**
- Ensure scripts are in `backend/scripts/` directory
- Check file permissions

---

## 📝 Next Steps

1. **Immediate:**
   - Copy scripts to backend repository
   - Run database reset
   - Verify database is empty

2. **Short-term:**
   - Set up monitoring
   - Configure alerts
   - Test health checks

3. **Long-term:**
   - Set up external monitoring
   - Configure error tracking
   - Set up log aggregation

---

## 📚 Documentation

- **Database Reset:** See `DATABASE-RESET-GUIDE.md`
- **Monitoring Setup:** See `MONITORING-SETUP-GUIDE.md`
- **Backend Deployment:** See `BACKEND-DEPLOYMENT-GUIDE.md`

---

**Status:** ✅ Scripts Created  
**Next Action:** Copy scripts to backend and run database reset
