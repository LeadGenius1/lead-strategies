# 🤖 AGENT 1: TACKLE.IO INTEGRATION SPECIALIST

**Mission:** Deploy Tackle.IO enterprise CRM frontend + database migration

**Duration:** 3-4 hours  
**Priority:** CRITICAL  
**Status:** ⏳ START IMMEDIATELY

---

## 📋 YOUR TASKS

### Task 1: Copy Tackle.IO Frontend Files (30 mins)
Copy all 5 dashboard pages from `tackle-io-frontend/` to `app/dashboard/tackle/`

**Files to copy:**
- `deals/page.js`
- `contacts/page.js`
- `companies/page.js`
- `activities/page.js`
- `analytics/page.js`

### Task 2: Update Navigation (15 mins)
- Add Tackle.IO links to main navigation
- Update tier-based access control (Tier 5 only)

### Task 3: Verify Backend Integration (15 mins)
- Confirm routes registered in `backend/src/index.js`
- Test all API endpoints return 200 OK

### Task 4: Database Migration (30 mins)
- Verify 13 Tackle.IO models in `prisma/schema.prisma`
- Run `railway ssh npx prisma db push`
- Verify all tables created

### Task 5: Deploy to Production (45 mins)
- Push to GitHub
- Verify Vercel deployment
- Test complete Tackle.IO workflow

---

## 💻 YOUR COMMANDS

```powershell
# Navigate to project
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"

# 1. CREATE DIRECTORIES
New-Item -Path "app\dashboard\tackle\deals" -ItemType Directory -Force
New-Item -Path "app\dashboard\tackle\contacts" -ItemType Directory -Force
New-Item -Path "app\dashboard\tackle\companies" -ItemType Directory -Force
New-Item -Path "app\dashboard\tackle\activities" -ItemType Directory -Force
New-Item -Path "app\dashboard\tackle\analytics" -ItemType Directory -Force

# 2. COPY FILES
Copy-Item "tackle-io-frontend\app\dashboard\deals\*" -Destination "app\dashboard\tackle\deals\" -Recurse -Force
Copy-Item "tackle-io-frontend\app\dashboard\contacts\*" -Destination "app\dashboard\tackle\contacts\" -Recurse -Force
Copy-Item "tackle-io-frontend\app\dashboard\companies\*" -Destination "app\dashboard\tackle\companies\" -Recurse -Force
Copy-Item "tackle-io-frontend\app\dashboard\activities\*" -Destination "app\dashboard\tackle\activities\" -Recurse -Force
Copy-Item "tackle-io-frontend\app\dashboard\analytics\*" -Destination "app\dashboard\tackle\analytics\" -Recurse -Force

# 3. VERIFY COPY
Get-ChildItem "app\dashboard\tackle" -Recurse -File | Measure-Object | Select-Object Count

# 4. VERIFY BACKEND ROUTES
Get-Content backend\src\index.js | Select-String "tackle"

# 5. CHECK DATABASE SCHEMA
Get-Content backend\prisma\schema.prisma | Select-String "model Company"
Get-Content backend\prisma\schema.prisma | Select-String "model Deal"
Get-Content backend\prisma\schema.prisma | Select-String "model Pipeline"

# 6. RUN DATABASE MIGRATION
cd backend
railway ssh npx prisma db push

# 7. TEST API ENDPOINTS
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/tackle/dashboard"
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/tackle/companies"
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/tackle/deals"

# 8. PUSH TO GIT
cd ..
git add app/dashboard/tackle
git status
git commit -m "feat: Integrate Tackle.IO enterprise CRM frontend

- Added 5 dashboard pages (deals, contacts, companies, activities, analytics)
- Integrated with existing backend API
- Deployed database schema updates
- Tier 5 ($599/mo) platform now operational"
git push origin main

# 9. VERIFY VERCEL DEPLOYMENT (wait 2-3 minutes)
Start-Sleep -Seconds 180
Invoke-WebRequest -Uri "https://leadsite.ai/dashboard/tackle/deals"
```

---

## ✅ YOUR DELIVERABLES

- [ ] All 5 Tackle.IO pages copied to `app/dashboard/tackle/`
- [ ] Navigation updated with Tackle.IO links
- [ ] Backend routes verified (10 API endpoints)
- [ ] Database migration complete (13 models)
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] End-to-end test passed (can create company, contact, deal)

---

## 🎯 SUCCESS CRITERIA

- [ ] All Tackle.IO pages render without errors
- [ ] Can access `/dashboard/tackle/deals`
- [ ] Can access `/dashboard/tackle/contacts`
- [ ] Can access `/dashboard/tackle/companies`
- [ ] Database tables created successfully
- [ ] API endpoints return 200 OK
- [ ] Can create test company
- [ ] Can create test contact
- [ ] Can create test deal
- [ ] Kanban board displays correctly

---

## ⚠️ POTENTIAL BLOCKERS

**If you encounter these issues:**

1. **"Model already exists" error during migration:**
   - Solution: Run `railway ssh npx prisma db push --force-reset` (WARNING: deletes data)
   - Or: Skip migration if models already exist

2. **API endpoints return 404:**
   - Check: `backend/src/index.js` has `app.use('/api/v1/tackle', tackleRoutes);`
   - Check: Railway deployment successful
   - Check: Backend restarted after code push

3. **Frontend pages show import errors:**
   - Check: API client exists at `lib/api.js`
   - Check: All dependencies installed
   - Run: `npm install` in root directory

4. **Vercel deployment fails:**
   - Check: Build logs for errors
   - Check: Environment variables set
   - Trigger manual redeploy if needed

---

## 📊 PROGRESS TRACKING

Update this section hourly:

**Hour 1:**
- [ ] Directories created
- [ ] Files copied
- [ ] Copy verified

**Hour 2:**
- [ ] Backend routes verified
- [ ] Database schema checked
- [ ] Migration executed

**Hour 3:**
- [ ] Code pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] API endpoints tested

**Hour 4:**
- [ ] End-to-end testing complete
- [ ] Documentation updated
- [ ] Handoff to Agent 4 (Testing)

---

## 🚀 START NOW!

**Your first command:**

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"
Write-Host "AGENT 1 STARTING TACKLE.IO INTEGRATION..." -ForegroundColor Green
```

**Report status every hour to project lead.**

**Expected completion:** 3-4 hours from now.
