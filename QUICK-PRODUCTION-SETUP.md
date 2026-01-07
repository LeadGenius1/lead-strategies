# ⚡ Quick Production Setup Guide

## 🎯 TL;DR - No Conflicts Strategy

**Production:**
- Backend: Railway (PostgreSQL + API) → `https://api.leadsite.ai`
- Frontends: Vercel (5 separate deployments) → `leadsite.ai`, `leadsite.io`, etc.

**Local Development:**
- Option 1: Point to production API (easiest)
- Option 2: Use Docker Compose for local backend dev (optional)

---

## 🚀 Quick Start (5 Steps)

### Step 1: Railway Backend Setup
```bash
# 1. Create Railway account: https://railway.app
# 2. New Project → Add PostgreSQL Database
# 3. New Service → Deploy Backend API
# 4. Set environment variables (see PRODUCTION-DEPLOYMENT-STRATEGY.md)
# 5. Get API URL: https://api.leadsite.ai
```

### Step 2: Vercel Frontend Setup (Repeat for each platform)
```bash
cd leadsite-ai-frontend  # or each frontend directory
vercel login
vercel --prod
```

**Set in Vercel Dashboard → Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1  # Change per platform
```

### Step 3: Configure Custom Domains
- Railway: Set `api.leadsite.ai` in project settings
- Vercel: Add domains in each project's settings

### Step 4: Test
```bash
# Test backend
curl https://api.leadsite.ai/api/v1/health

# Test frontend
# Visit https://leadsite.ai and check Network tab
```

### Step 5: Verify No Conflicts
- ✅ Production uses Railway (not Docker)
- ✅ Frontends use production API URL
- ✅ Local Docker only for backend dev (optional)

---

## 🔒 Environment Variables Quick Reference

### Production (Vercel)
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1  # Change per platform
```

### Local Development
```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.leadsite.ai  # Use production API
# OR
NEXT_PUBLIC_API_URL=http://localhost:3001     # If using local backend
```

---

## 🐳 Local Docker (Optional)

**Only use if developing backend locally:**

```bash
# Start local PostgreSQL
docker-compose up -d postgres

# Backend connects to: postgresql://leadsite_user:leadsite_password_dev@localhost:5432/leadsite_dev
# Frontend connects to: http://localhost:3001
```

**Important:** Local Docker containers are **separate** from production and won't conflict.

---

## ✅ Conflict Prevention Checklist

- [ ] Production backend uses Railway (not Docker)
- [ ] Production frontends use `https://api.leadsite.ai`
- [ ] Local Docker only for backend development
- [ ] Environment variables set correctly in Vercel
- [ ] `.env.local` files not committed to git
- [ ] Different ports for local vs production

---

## 📚 Full Documentation

See `PRODUCTION-DEPLOYMENT-STRATEGY.md` for complete details.

