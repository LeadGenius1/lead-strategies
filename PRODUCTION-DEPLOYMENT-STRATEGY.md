# 🚀 Production Deployment Strategy - No Conflicts

## 📋 Overview

This document outlines how to deploy your 5-platform leadsite.ai system to production **without conflicts** between local development and production environments.

---

## 🏗️ Architecture Separation

### **Production (Cloud)**
```
┌─────────────────────────────────────────┐
│         RAILWAY BACKEND                 │
│    https://api.leadsite.ai              │
│    PostgreSQL Database (Railway)        │
└─────────────────────────────────────────┘
              │
              │ REST API
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Vercel │ │ Vercel │ │ Vercel │
│ Tier 1 │ │ Tier 2 │ │ Tier 3 │
└────────┘ └────────┘ └────────┘
    │         │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Vercel │ │ Vercel │
│ Tier 4 │ │ Tier 5 │
└────────┘ └────────┘
```

### **Local Development (Optional)**
```
┌─────────────────────────────────────────┐
│    Docker Compose (Local Only)          │
│    PostgreSQL: localhost:5432            │
│    Backend API: localhost:3001           │
└─────────────────────────────────────────┘
              │
              │ (Only for local dev)
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Next.js │ │ Next.js │ │ Next.js │
│ Dev     │ │ Dev     │ │ Dev     │
└────────┘ └────────┘ └────────┘
```

---

## ✅ Step-by-Step Production Setup

### **Phase 1: Railway Backend Setup**

#### 1.1 Create Railway Project
```bash
# Install Railway CLI (if not installed)
npm i -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

#### 1.2 Add PostgreSQL Database
1. Go to Railway Dashboard: https://railway.app
2. Click "New Project" → "Add Database" → "PostgreSQL"
3. Railway will automatically create:
   - Database instance
   - Connection string (DATABASE_URL)
   - Username and password

#### 1.3 Deploy Backend API
1. In Railway dashboard, click "New Service"
2. Connect your backend repository (or upload code)
3. Set environment variables:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.io,https://tackle.io
   ```

#### 1.4 Get Production API URL
- Railway will provide: `https://your-project.up.railway.app`
- Set custom domain: `api.leadsite.ai` (in Railway settings)

---

### **Phase 2: Vercel Frontend Setup**

#### 2.1 Deploy Each Frontend Separately

**For LeadSite.AI (Tier 1):**
```bash
cd leadsite-ai-frontend  # or root if it's the main app
vercel login
vercel --prod
```

**Set Environment Variables in Vercel Dashboard:**
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1
```

**Repeat for each platform:**
- `leadsite-io-frontend` → `leadsite.io` (Tier 2)
- `clientcontact-io-frontend` → `clientcontact.io` (Tier 3)
- `videosite-io-frontend` → `videosite.io` (Tier 4)
- `tackle-io-frontend` → `tackle.io` (Tier 5)

#### 2.2 Configure Custom Domains
1. In Vercel Dashboard → Project Settings → Domains
2. Add custom domain for each platform
3. Update DNS records as instructed

---

## 🔒 Environment Variable Strategy

### **Production (Railway Backend)**
```env
# Database (Auto-provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
JWT_SECRET=your-production-secret-key-min-32-chars
NODE_ENV=production

# API Configuration
PORT=3000
API_VERSION=v1

# CORS (All production domains)
CORS_ORIGIN=https://leadsite.ai,https://leadsite.io,https://clientcontact.io,https://videosite.io,https://tackle.io
```

### **Production (Vercel Frontends)**
Each frontend needs:
```env
# LeadSite.AI (.env.production)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1

# LeadSite.IO (.env.production)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier2

# ClientContact.IO (.env.production)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier3

# VideoSite.IO (.env.production)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier4

# Tackle.IO (.env.production)
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier5
```

### **Local Development (Optional)**
```env
# .env.local (for local frontend development)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1
```

---

## 🐳 Local Development Setup (Optional)

### **Option 1: Use Production API (Recommended)**
- Point local frontends to `https://api.leadsite.ai`
- No local Docker needed
- Simplest setup

### **Option 2: Local Docker Compose (For Backend Development)**
If you need to develop the backend locally:

```bash
# Use docker-compose.yml (see below)
docker-compose up -d

# Backend connects to localhost:5432
# Frontends connect to localhost:3001
```

**Important:** Local Docker containers should **NEVER** conflict with production because:
- Different ports (local: 5432, Railway: managed)
- Different environment variables
- Different databases

---

## 🚫 Preventing Conflicts

### **1. Port Separation**
- **Local Docker PostgreSQL**: `localhost:5432` (only when running locally)
- **Railway PostgreSQL**: Managed internally (no local port)
- **Local Backend**: `localhost:3001` (only when running locally)
- **Production Backend**: `https://api.leadsite.ai`

### **2. Environment Variable Separation**
- **Production**: Always use `https://api.leadsite.ai`
- **Local Dev**: Use `http://localhost:3001` OR `https://api.leadsite.ai`
- **Never mix**: Don't point production to localhost

### **3. Database Separation**
- **Production**: Railway PostgreSQL (shared across all platforms)
- **Local Dev**: Docker PostgreSQL (separate, local-only data)

### **4. Git Ignore Strategy**
```gitignore
# Environment files (never commit secrets)
.env
.env.local
.env.production.local
.env.development.local

# Docker volumes (local only)
docker-data/
postgres-data/
```

---

## 📝 Deployment Checklist

### **Backend (Railway)**
- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Deploy backend API code
- [ ] Set environment variables
- [ ] Configure custom domain: `api.leadsite.ai`
- [ ] Test API endpoint: `https://api.leadsite.ai/api/v1/health`
- [ ] Verify database connection

### **Frontend 1: LeadSite.AI (Vercel)**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure domain: `leadsite.ai`
- [ ] Test connection to backend API
- [ ] Verify authentication flow

### **Frontend 2: LeadSite.IO (Vercel)**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure domain: `leadsite.io`
- [ ] Test connection to backend API

### **Frontend 3: ClientContact.IO (Vercel)**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure domain: `clientcontact.io`
- [ ] Test connection to backend API

### **Frontend 4: VideoSite.IO (Vercel)**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure domain: `videosite.io`
- [ ] Test connection to backend API

### **Frontend 5: Tackle.IO (Vercel)**
- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Configure domain: `tackle.io`
- [ ] Test connection to backend API

---

## 🔍 Testing Production Setup

### **1. Test Backend API**
```bash
# Health check
curl https://api.leadsite.ai/api/v1/health

# Should return: {"status": "ok"}
```

### **2. Test Frontend → Backend Connection**
1. Visit `https://leadsite.ai`
2. Open browser DevTools → Network tab
3. Try to login
4. Verify API calls go to `https://api.leadsite.ai`

### **3. Test All Platforms**
- [ ] `leadsite.ai` → connects to `api.leadsite.ai` ✅
- [ ] `leadsite.io` → connects to `api.leadsite.ai` ✅
- [ ] `clientcontact.io` → connects to `api.leadsite.ai` ✅
- [ ] `videosite.io` → connects to `api.leadsite.ai` ✅
- [ ] `tackle.io` → connects to `api.leadsite.ai` ✅

---

## 🛠️ Troubleshooting Conflicts

### **Problem: Local Docker container conflicts with production**
**Solution:**
- Stop local Docker containers: `docker-compose down`
- Use production API: Set `NEXT_PUBLIC_API_URL=https://api.leadsite.ai`
- Local Docker is only for backend development, not frontend

### **Problem: Frontend connects to wrong API**
**Solution:**
- Check `.env.local` file (local development)
- Check Vercel environment variables (production)
- Verify `NEXT_PUBLIC_API_URL` is correct

### **Problem: Database connection errors**
**Solution:**
- Production: Check Railway DATABASE_URL
- Local: Check docker-compose.yml DATABASE_URL
- Never mix production and local database URLs

---

## 🎯 Key Principles

1. **Production Always Uses Railway + Vercel**
   - Backend: Railway (PostgreSQL + API)
   - Frontends: Vercel (5 separate deployments)

2. **Local Development is Optional**
   - Can use production API for frontend development
   - Docker only needed for backend development

3. **Environment Variables Control Everything**
   - Production: `https://api.leadsite.ai`
   - Local: `http://localhost:3001` (if using local backend)

4. **No Conflicts Because:**
   - Different ports (local vs production)
   - Different databases (local Docker vs Railway)
   - Different URLs (localhost vs production domains)

---

## 📚 Next Steps

1. **Set up Railway backend** (Phase 1)
2. **Deploy all 5 frontends to Vercel** (Phase 2)
3. **Configure custom domains**
4. **Test end-to-end**
5. **Monitor and maintain**

---

**Remember:** Your local Docker containers (`leadsite-postgres`) are **completely separate** from production. They won't conflict as long as you:
- Use production API URL in Vercel deployments
- Only use local Docker for local backend development
- Never point production to localhost


