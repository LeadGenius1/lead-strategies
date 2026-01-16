# 📊 Platform Monitoring Setup Guide

This guide explains how to set up and verify the platform monitoring system.

---

## 🎯 Overview

The monitoring system tracks:
- Frontend availability
- Backend API health
- Response times
- Error rates
- System uptime

---

## 🚀 Quick Setup

### 1. Run Monitoring Setup Script

```bash
node scripts/setup-monitoring.js
```

This will:
- Check frontend availability
- Check backend availability
- Verify health endpoints
- Provide monitoring recommendations

### 2. Run Health Check

```bash
node scripts/health-check.js
```

This performs a comprehensive health check of all endpoints.

---

## 📋 Monitoring Components

### 1. Health Check Script

**Location:** `scripts/health-check.js`

**Purpose:** Continuous health monitoring

**Usage:**
```bash
# Manual check
node scripts/health-check.js

# Cron job (every 5 minutes)
*/5 * * * * cd /path/to/project && node scripts/health-check.js
```

**Checks:**
- Frontend availability
- Backend API availability
- Health endpoint response
- Response times

---

### 2. Setup Monitoring Script

**Location:** `scripts/setup-monitoring.js`

**Purpose:** Initial monitoring setup and verification

**Usage:**
```bash
node scripts/setup-monitoring.js
```

**Actions:**
- Verifies all endpoints are accessible
- Provides monitoring recommendations
- Checks system health

---

## 🔧 Railway Monitoring

### Built-in Monitoring

Railway provides built-in monitoring:

1. **Logs:** View real-time logs in Railway dashboard
2. **Metrics:** CPU, Memory, Network usage
3. **Deployments:** Track deployment status
4. **Alerts:** Configure alerts for failures

### Setting Up Railway Alerts

1. Go to Railway dashboard
2. Select your service
3. Go to Settings → Notifications
4. Configure alert channels:
   - Email alerts
   - Slack notifications
   - Webhook alerts

---

## 🌐 External Monitoring Services

### Recommended Services:

#### 1. UptimeRobot (Free)
- **URL:** https://uptimerobot.com
- **Features:**
  - 50 monitors (free tier)
  - 5-minute check interval
  - Email/SMS alerts
  - Status pages

**Setup:**
1. Create account
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://leadsite.ai`
   - Interval: 5 minutes
3. Add backend monitor:
   - URL: `https://api.leadsite.ai/api/v1/health`
   - Interval: 5 minutes

#### 2. Pingdom (Paid)
- **URL:** https://www.pingdom.com
- **Features:**
  - Advanced monitoring
  - Real user monitoring
  - Transaction monitoring
  - Detailed analytics

#### 3. StatusCake (Free Tier Available)
- **URL:** https://www.statuscake.com
- **Features:**
  - 10 monitors (free tier)
  - SSL monitoring
  - Page speed monitoring
  - Public status pages

---

## 📊 Error Tracking

### Sentry (Recommended)

**Setup:**
1. Create account at https://sentry.io
2. Create project (Node.js/React)
3. Add SDK to backend:
   ```bash
   npm install @sentry/node
   ```
4. Initialize in backend:
   ```javascript
   const Sentry = require('@sentry/node')
   Sentry.init({ dsn: 'YOUR_DSN' })
   ```
5. Add SDK to frontend:
   ```bash
   npm install @sentry/react
   ```
6. Initialize in frontend:
   ```javascript
   import * as Sentry from '@sentry/react'
   Sentry.init({ dsn: 'YOUR_DSN' })
   ```

---

## 📈 Performance Monitoring

### New Relic (Recommended)

**Setup:**
1. Create account at https://newrelic.com
2. Install agent:
   ```bash
   npm install newrelic
   ```
3. Configure in backend
4. Monitor:
   - Response times
   - Throughput
   - Error rates
   - Database performance

---

## 📝 Log Aggregation

### Logtail (Recommended)

**Setup:**
1. Create account at https://logtail.com
2. Install client:
   ```bash
   npm install @logtail/node
   ```
3. Configure logging
4. View logs in dashboard

### Alternative: Datadog

- Comprehensive logging
- APM (Application Performance Monitoring)
- Infrastructure monitoring
- Alerting

---

## 🔔 Alert Configuration

### Recommended Alerts:

1. **Uptime Alerts:**
   - Frontend down for > 1 minute
   - Backend down for > 1 minute
   - Health check failing

2. **Performance Alerts:**
   - Response time > 2 seconds
   - Error rate > 1%
   - CPU usage > 80%

3. **Error Alerts:**
   - Critical errors (500s)
   - Database connection failures
   - API rate limit exceeded

---

## 📊 Monitoring Dashboard

### Create Status Page:

1. **UptimeRobot Status Page:**
   - Free status page
   - Public URL
   - Real-time status

2. **StatusPage.io:**
   - Professional status pages
   - Incident management
   - Custom branding

---

## ✅ Verification Checklist

- [ ] Health check script runs successfully
- [ ] Frontend is monitored
- [ ] Backend is monitored
- [ ] Health endpoint responds correctly
- [ ] Alerts are configured
- [ ] Error tracking is set up
- [ ] Log aggregation is active
- [ ] Performance monitoring is enabled
- [ ] Status page is public (optional)

---

## 🚨 Troubleshooting

### Health Check Fails

**Check:**
1. Endpoints are accessible
2. Health endpoint is implemented
3. CORS is configured correctly
4. Network connectivity

### Monitoring Not Working

**Check:**
1. Scripts have correct permissions
2. Environment variables are set
3. Dependencies are installed
4. Cron jobs are configured (if using)

---

## 📝 Maintenance

### Regular Tasks:

1. **Daily:** Review error logs
2. **Weekly:** Check performance metrics
3. **Monthly:** Review alert effectiveness
4. **Quarterly:** Update monitoring configuration

---

## 🔐 Security Considerations

- Don't expose sensitive data in logs
- Use secure connections (HTTPS)
- Rotate API keys regularly
- Monitor for suspicious activity
- Set up rate limiting alerts

---

**Last Updated:** January 15, 2026
