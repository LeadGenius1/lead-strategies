# System Monitoring & Health Check Guide
## Comprehensive System Verification

**Date:** January 9, 2026  
**Status:** ✅ **MONITORING TOOLS READY**

---

## 🎯 MONITORING OBJECTIVES

Verify all critical functions and systems are working:
1. ✅ Backend Health & Services
2. ✅ Database Connectivity
3. ✅ Redis Connectivity
4. ✅ Frontend Connectivity
5. ✅ Authentication Endpoints
6. ✅ API Routes Structure
7. ✅ Railway Deployment Status
8. ✅ End-to-End User Flow

---

## 🚀 QUICK START

### **Option 1: Automated Monitoring Script (Recommended)**

```powershell
# Test production (Railway)
cd scripts
.\monitor-system.ps1

# Test local development
.\monitor-system.ps1 -Local

# Verbose output
.\monitor-system.ps1 -Verbose
```

### **Option 2: Manual Health Checks**

**Backend Health:**
```bash
curl https://api.leadsite.ai/api/v1/health
curl https://api.leadsite.ai/api/v1/health/services
```

**Local Backend:**
```bash
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/services
```

---

## 📋 MONITORING CHECKLIST

### **1. Backend Health ✅**

**Endpoint:** `GET /api/v1/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T...",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```

**Status Codes:**
- ✅ `200 OK` - Backend is healthy
- ❌ `503 Service Unavailable` - Backend is down or not ready
- ❌ `500 Internal Server Error` - Backend error

**Check:**
- [ ] Health endpoint responds
- [ ] Status is "ok"
- [ ] Timestamp is recent
- [ ] Services are reported

---

### **2. Database Connectivity ✅**

**Via Health Endpoint:** `GET /api/v1/health/services`

**Expected:**
```json
{
  "database": {
    "status": "healthy",
    "latency": "5ms"
  }
}
```

**Check:**
- [ ] Database status is "healthy"
- [ ] Latency is reasonable (< 100ms)
- [ ] No connection errors in logs

**If Unhealthy:**
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL service on Railway
- Verify network connectivity

---

### **3. Redis Connectivity ✅**

**Via Health Endpoint:** `GET /api/v1/health/services`

**Expected:**
```json
{
  "redis": {
    "status": "healthy",
    "latency": "2ms"
  }
}
```

**Check:**
- [ ] Redis status is "healthy" (or "unavailable" if using fallback)
- [ ] If unavailable, backend should use in-memory rate limiting
- [ ] No Redis errors in logs

**If Unhealthy:**
- Backend will fall back to in-memory rate limiting
- Functionality continues, but rate limiting is not shared
- Verify `REDIS_URL` environment variable on Railway

---

### **4. Frontend Connectivity ✅**

**Production:**
- `https://leadsite.ai` - Main frontend
- `https://leadsite.io` - LeadSite.IO
- `https://clientcontact.io` - ClientContact.IO
- `https://videosite.ai` - VideoSite.IO
- `https://tackleai.ai` - Tackle.AI

**Check:**
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] API calls succeed
- [ ] Authentication works

---

### **5. Authentication Endpoints ✅**

**Signup:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "password123",
  "tier": "leadsite-ai",
  "companyName": "Test Company"
}
```

**Expected:**
- ✅ `201 Created` - User created, token returned
- ❌ `400 Bad Request` - Validation error
- ❌ `409 Conflict` - Email already exists
- ❌ `503 Service Unavailable` - Backend not ready

**Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected:**
- ✅ `200 OK` - Login successful, token returned
- ❌ `401 Unauthorized` - Invalid credentials
- ❌ `503 Service Unavailable` - Backend not ready

**Check:**
- [ ] Signup creates user successfully
- [ ] Login authenticates user
- [ ] Token is returned and set as cookie
- [ ] Protected routes require authentication

---

### **6. API Routes Structure ✅**

**Key Endpoints:**
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/leads` - List leads (requires auth)
- `GET /api/campaigns` - List campaigns (requires auth)
- `GET /api/conversations` - List conversations (requires auth, tier 3+)

**Check:**
- [ ] All routes are accessible
- [ ] Protected routes return 401 without auth
- [ ] Authenticated requests succeed
- [ ] Tier-gated features work correctly

---

### **7. Railway Deployment Status ✅**

**Check Railway Dashboard:**
1. Go to Railway dashboard
2. Select project: `ai-lead-strategies`
3. Check environment: `production`

**Backend Service:**
- [ ] Status: "Online" ✅
- [ ] Latest deployment: Successful ✅
- [ ] Build logs: No errors ✅
- [ ] Runtime logs: No errors ✅

**Services:**
- [ ] Postgres: "Online" ✅
- [ ] Redis: "Online" (or optional) ✅
- [ ] Backend: "Online" ✅

**Check:**
- [ ] All services are "Online"
- [ ] Latest deployment succeeded
- [ ] No build errors
- [ ] No runtime errors in logs

---

### **8. End-to-End User Flow ✅**

**Test Flow:**
1. **Signup:**
   - [ ] Navigate to signup page
   - [ ] Fill form with valid data
   - [ ] Submit form
   - [ ] User created successfully
   - [ ] Redirected to dashboard

2. **Login:**
   - [ ] Navigate to login page
   - [ ] Enter credentials
   - [ ] Submit form
   - [ ] Login successful
   - [ ] Redirected to dashboard

3. **Dashboard:**
   - [ ] Dashboard loads
   - [ ] User data displayed
   - [ ] Navigation works
   - [ ] No console errors

4. **Protected Routes:**
   - [ ] Can access tier-gated features
   - [ ] Cannot access higher-tier features
   - [ ] Logout works

**Check:**
- [ ] Complete user journey works
- [ ] No errors in browser console
- [ ] All pages load correctly
- [ ] Authentication persists

---

## 🔧 TROUBLESHOOTING

### **Backend Health Check Fails**

**Symptoms:**
- Health endpoint returns 503 or timeout
- Service shows as "Offline" on Railway

**Solutions:**
1. Check Railway deployment status
2. View Railway logs for errors
3. Verify environment variables
4. Check database connectivity
5. Restart backend service

---

### **Database Connection Fails**

**Symptoms:**
- Health endpoint shows database as "unhealthy"
- Backend logs show database errors

**Solutions:**
1. Verify `DATABASE_URL` is set on Railway
2. Check PostgreSQL service is "Online"
3. Verify database credentials
4. Check network connectivity
5. Review database logs

---

### **Authentication Fails**

**Symptoms:**
- Signup/login returns errors
- 401/403 errors on protected routes
- Cookies not set

**Solutions:**
1. Check backend logs for errors
2. Verify `JWT_SECRET` is set
3. Check cookie settings (domain, secure, etc.)
4. Verify frontend `RAILWAY_API_URL` is set
5. Test backend endpoints directly

---

### **Frontend Cannot Connect to Backend**

**Symptoms:**
- Frontend shows 503 errors
- API calls fail
- Console shows network errors

**Solutions:**
1. Verify `RAILWAY_API_URL` on frontend Railway service
2. Check backend is "Online" on Railway
3. Test backend health endpoint directly
4. Check CORS configuration
5. Verify SSL certificates

---

## 📊 MONITORING SCRIPT OUTPUT

The monitoring script (`monitor-system.ps1`) provides:

**Console Output:**
- ✅ Pass/Fail status for each test
- Service status details
- Summary statistics
- Color-coded results

**JSON Report:**
- Detailed results saved to file
- Timestamp included
- All test data preserved

**Exit Codes:**
- `0` - All tests passed
- `1` - One or more tests failed

---

## 🎯 REGULAR MONITORING SCHEDULE

**Recommended:**
- **Before deployment:** Run full monitoring
- **After deployment:** Run full monitoring
- **Daily:** Check health endpoints
- **Weekly:** Run full monitoring script
- **On issues:** Run full monitoring immediately

---

## ✅ SUCCESS CRITERIA

**All systems healthy when:**
- ✅ Backend health endpoint returns 200 OK
- ✅ Database status is "healthy"
- ✅ Redis status is "healthy" (or unavailable with fallback)
- ✅ Frontend loads without errors
- ✅ Authentication flow works end-to-end
- ✅ All API routes are accessible
- ✅ Railway services are "Online"
- ✅ No errors in logs

---

**Document Created:** January 9, 2026  
**Status:** ✅ **MONITORING READY - RUN SCRIPTS TO VERIFY**
