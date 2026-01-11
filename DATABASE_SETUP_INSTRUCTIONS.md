# DATABASE SETUP - REQUIRED ACTION

**Status:** Railway backend deployed, but DATABASE_URL not configured  
**Action Required:** Add PostgreSQL database via Railway Dashboard

---

## 🚨 IMMEDIATE ACTION NEEDED

### Step 1: Add PostgreSQL Database (2 minutes)

1. Go to Railway Dashboard: https://railway.app/project/strong-communication
2. Click on your project "strong-communication"
3. Click "+ New" button
4. Select "Database" → "Add PostgreSQL"
5. Wait for database to provision (~30 seconds)

### Step 2: Link Database to Backend Service (automatic)

Railway will automatically:
- Create `DATABASE_URL` environment variable
- Link it to the `superb-possibility` backend service
- Restart the backend service

### Step 3: Run Database Migration (via CLI)

Once database is added, run:

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website\backend"
railway ssh --service superb-possibility "npx prisma db push --accept-data-loss"
```

This will create all tables for:
- ✅ LeadSite.AI (User, Campaign, Lead, etc.)
- ✅ ClientContact.IO (Conversation, Message, CannedResponse, etc.)
- ✅ Tackle.IO (Company, Contact, Deal, Activity, Pipeline, etc.)

---

## 📊 DATABASE SCHEMA SUMMARY

**Total Models:** 30+ models across all platforms

### LeadSite.AI Models:
- User, Campaign, Lead, EmailCampaign, WebsiteTemplate

### ClientContact.IO Models:
- Conversation, Message, CannedResponse, AutoResponse, ConversationNote

### Tackle.IO Models (New):
- Company
- TackleContact (renamed from Contact to avoid conflicts)
- Deal
- Activity
- Call
- Document
- Team, TeamMember
- Pipeline, PipelineStage
- Sequence, SequenceStep, SequenceEnrollment

### System Tables:
- Session, Subscription, StripeCustomer

---

## ✅ VERIFICATION STEPS

After migration completes, verify:

1. **Check tables created:**
```powershell
railway ssh --service superb-possibility "npx prisma db pull"
```

2. **Test API endpoints:**
```powershell
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health"
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/api/v1/tackle/dashboard"
```

3. **Verify self-healing system:**
```powershell
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health" | ConvertFrom-Json | Select-Object selfHealing
```

Expected output:
```json
{
  "selfHealing": {
    "enabled": true,
    "agents": 7
  }
}
```

---

## 🔄 ALTERNATIVE: Use Supabase or External PostgreSQL

If Railway database is unavailable, you can use an external PostgreSQL:

### Option 1: Supabase (Recommended)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Add to Railway: `railway variables --set DATABASE_URL="postgresql://..."`

### Option 2: ElephantSQL (Free Tier)
1. Go to https://www.elephantsql.com
2. Create free "Tiny Turtle" instance
3. Get URL
4. Add to Railway

### Option 3: Neon (Serverless Postgres)
1. Go to https://neon.tech
2. Create project
3. Get connection string
4. Add to Railway

---

## ⚡ QUICK COMMAND REFERENCE

```powershell
# After database is added, run these in order:

# 1. Verify DATABASE_URL is set
railway variables --service superb-possibility | Select-String "DATABASE"

# 2. Run migration
railway ssh --service superb-possibility "npx prisma db push --accept-data-loss"

# 3. Generate Prisma client
railway ssh --service superb-possibility "npx prisma generate"

# 4. Restart service
railway restart --service superb-possibility

# 5. Check health
Invoke-WebRequest -Uri "https://backend-production-2987.up.railway.app/health"
```

---

**Next Step:** Add PostgreSQL database in Railway Dashboard NOW, then proceed with migration.

**Time Required:** 5 minutes total
