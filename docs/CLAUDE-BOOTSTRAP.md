# 🚀 CLAUDE BOOTSTRAP - AI LEAD STRATEGIES PLATFORM
**Version:** 2.0 (Future-Proof)
**Purpose:** Instant context loading for any Claude conversation  
**Last Updated:** 2026-02-15

---

## ⚡ QUICK FACTS

| Attribute | Value |
|-----------|-------|
| **Project** | AI Lead Strategies Platform |
| **Owner** | AI Lead Strategies LLC |
| **Type** | Multi-platform SaaS ecosystem |
| **Target** | 1M+ concurrent users |
| **Status** | See PROJECT-MANIFEST.json for current completion |
| **Deployment** | Production active on Railway |

> **📊 CURRENT STATUS:** Always check `PROJECT-MANIFEST.json` → `completionStatus` for latest percentages

---

## 🎯 SOURCE OF TRUTH (ABSOLUTE)

### ✅ CORRECT LOCATION (NEVER CHANGES)
```
Repository: LeadGenius1/lead-strategies
Branch: main
Local Path: C:\Users\ailea\OneDrive\Documents\lead-strategies-repo
```

### ❌ FORBIDDEN LOCATIONS (PERMANENT)
```
❌ C:\Users\ailea\Documents\lead-strategies
❌ C:\Users\ailea\lead-strategies-build
❌ C:\Users\ailea\.cursor\worktrees\*
```

> **⚠️ CRITICAL:** Always verify location before making changes. These paths never change.

---

## 🏗️ PLATFORM ARCHITECTURE (PERMANENT)

### 5 Integrated Platforms

#### 1. **LeadSite.AI** (Email Lead Generation)
- **Features:** Lead Hunter, Proactive Hunter, Prospects, Campaigns, Replies
- **Pricing:** $49 / $149 / $349 per month
- **Tech:** Mailgun integration, two-tier email delivery

#### 2. **LeadSite.IO** (AI Website Builder)
- **Features:** AI website generation, templates, custom domains
- **Pricing:** $49 / $149 / $349 per month
- **Tech:** Next.js website generation

#### 3. **VideoSite.AI** (Video Monetization)
- **Features:** Upload, Videos, Creator Earnings
- **Pricing:** FREE for all users
- **Tech:** Cloudflare R2 storage, creator payout system

#### 4. **ClientContact.IO** (Unified Inbox)
- **Features:** 22+ channel inbox, SMS, social media integration
- **Pricing:** $99 / $149 / $399 per month
- **Tech:** Multi-channel aggregation

#### 5. **UltraLead.AI** (All-in-One Dashboard)
- **Features:** CRM, Deals, Analytics, AI Copywriter, Admin
- **Pricing:** $499 per month (all-in-one)
- **Tech:** Cross-platform analytics

> **📊 FEATURE STATUS:** Check `PROJECT-MANIFEST.json` → `features` for F01-F20 completion details

---

## 💻 TECH STACK (PERMANENT)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS + AETHER Design System
- **State:** React Context API
- **Auth:** JWT tokens

### Backend
- **Server:** Express.js
- **Runtime:** Node.js
- **API:** RESTful endpoints
- **Middleware:** CORS, rate limiting, authentication

### Database
- **Primary:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Cache:** Redis
- **Connection:** Railway public URL (NOT internal hostname)

### Storage & Services
- **File Storage:** Cloudflare R2 (bucket: videosite)
- **Email:** Mailgun (DNS configured: SPF, DKIM, DMARC)
- **Payments:** Stripe
- **Deployment:** Railway (auto-deploy on push)

### Infrastructure
- **Hosting:** Railway
- **Project:** ai-lead-strategies
- **Environment:** production
- **Auto-Deploy:** Enabled on main branch
- **Health Check Timeout:** 90 seconds

> **⚙️ DEPLOYMENT CONFIG:** See `PROJECT-MANIFEST.json` → `deployment` for current service URLs

---

## 🚀 DEPLOYMENT WORKFLOW (PERMANENT)

### Railway Services

| Service | URL | Health Check |
|---------|-----|--------------|
| **Backend API** | api.aileadstrategies.com | /health |
| **Frontend** | aileadstrategies.com | / |
| **Database** | Railway PostgreSQL | N/A |
| **Cache** | Railway Redis | N/A |

### Deployment Process (NEVER CHANGES)
1. Make code changes locally
2. Test locally: `npm run dev`
3. Git commit with descriptive message
4. Git push to main branch
5. **Wait 90 seconds** for Railway auto-deploy
6. Verify health: `npm run verify` or `npm run verify:deploy`
7. Check Railway logs if issues

### Health Endpoints (PERMANENT)
- Backend: `https://api.aileadstrategies.com/health`
- Frontend: `https://aileadstrategies.com`

---

## 📋 MASTER DEVELOPER RULES (PERMANENT)

### 🚨 CORE PRINCIPLES (NEVER CHANGE)

1. **NEVER GUESS IMPLEMENTATIONS**
   - Research existing patterns first
   - Check official documentation
   - Examine current codebase structure

2. **VERIFY DEPENDENCIES**
   - Check all imports and requires
   - Validate package versions
   - Test before committing

3. **THINK THOROUGHLY**
   - Analyze impact before changes
   - Identify potential breaking points
   - Plan rollback strategy

4. **PRESERVE STRUCTURE**
   - Maintain existing architecture
   - Follow established patterns
   - Don't break working functionality

5. **INCREMENTAL CHANGES**
   - One feature at a time
   - Test at each step
   - Commit frequently

### 📚 RESEARCH-FIRST METHODOLOGY (PERMANENT)

**Before ANY Code Change:**
1. **SEARCH** relevant documentation
2. **EXAMINE** existing codebase
3. **UNDERSTAND** current functionality
4. **PLAN** minimal changes
5. **IMPLEMENT** incrementally
6. **VERIFY** functionality preserved

### ❌ NEVER DO (PERMANENT RULES)
- Guess at solutions without research
- Make multiple changes simultaneously
- Ignore warning messages
- Deploy without testing
- Break working functionality to add features
- Use forbidden directory paths
- Commit without verifying location

### ✅ ALWAYS DO (PERMANENT RULES)
- Verify source of truth location first
- Research existing patterns before coding
- Test locally before committing
- Check health after deployment
- Follow Railway deployment workflow
- Preserve existing functionality
- Make incremental, tested changes

---

## 🛠️ VERIFICATION SCRIPTS (PERMANENT)

### Available Commands
```bash
npm run verify           # Verify source of truth and deployment health
npm run cleanup:check    # Find duplicate codebases
```

### Manual Verification
```bash
# Check current directory
pwd  # Must contain: lead-strategies-repo

# Check git remote
git remote get-url origin
# Must be: https://github.com/LeadGenius1/lead-strategies.git

# Check branch
git branch --show-current  # Must be: main
```

---

## 📊 WHERE TO FIND CURRENT STATUS

### 🔍 ALWAYS CHECK THESE FOR LATEST INFO:

| What You Need | Where to Find It |
|---------------|------------------|
| **Completion %** | `PROJECT-MANIFEST.json` → `completionStatus` |
| **Feature Status (F01-F20)** | `PROJECT-MANIFEST.json` → `features` |
| **Platform Details** | `PROJECT-MANIFEST.json` → `platforms` |
| **Deployment Status** | `PROJECT-MANIFEST.json` → `deployment.services` |
| **Current Priorities** | `AI-Lead-Strategies-Platform-Status.md` |
| **Recent Changes** | Git commit history |
| **Active Issues** | `AI-Lead-Strategies-Platform-Status.md` → Known Issues |

> **🎯 KEY PRINCIPLE:** This bootstrap file contains PERMANENT facts. For CURRENT status, always reference living documents.

---

## 🔧 KEY FILES REFERENCE (PERMANENT)

### Living Documents (Check for Current Status)
- `PROJECT-MANIFEST.json` - **CURRENT** completion percentages, service status
- `AI-Lead-Strategies-Platform-Status.md` - **CURRENT** priorities, blockers, next steps
- `package.json` - **CURRENT** dependencies, versions

### Permanent Documents (Never Change)
- `.ai-tools-config.json` - Tool coordination rules
- `Claude-Master-Developer-Rules.md` - Development methodology
- `docs/CLAUDE-BOOTSTRAP.md` - This file
- `docs/FILING-SYSTEM.md` - Master database system
- `docs/QUICK-REFERENCE.md` - Common commands

### Cursor Rules (Permanent Enforcement)
- `.cursor/rules/source-of-truth.mdc` - Directory enforcement
- `.cursor/rules/tool-capabilities-reference.mdc` - Claude/Cursor coordination

### Verification Scripts (PERMANENT)
- `scripts/verify-source-of-truth.js` - Location verification
- `scripts/verify-deployment.js` - Health checks
- `scripts/cleanup-duplicates.js` - Duplicate finder

---

## 🤖 CLAUDE & CURSOR COORDINATION (PERMANENT)

### Use Claude For:
- 🧠 Complex problem analysis
- 🧠 Architecture decisions
- 🧠 Multi-step planning
- 🧠 Documentation generation
- 🧠 Error diagnosis from logs
- 🧠 Research and investigation

### Use Cursor For:
- ⚡ Multi-file refactoring (Composer: Cmd+I)
- ⚡ Quick inline edits (Cmd+K)
- ⚡ Git operations
- ⚡ Local testing
- ⚡ Code implementation

### Workflow Patterns (PERMANENT)

#### New Feature Development
1. **CLAUDE:** Analyze requirements, create plan
2. **CURSOR:** Implement with Composer (Cmd+I)
3. **CURSOR:** Test locally (npm run dev)
4. **CURSOR:** Git commit and push
5. **CLAUDE:** Verify deployment health

#### Bug Fix
1. **CLAUDE:** Analyze error and propose solution
2. **CURSOR:** Implement fix
3. **CURSOR:** Deploy
4. **CLAUDE:** Verify fix

#### Refactoring
1. **CLAUDE:** Plan refactoring approach
2. **CURSOR:** Execute multi-file changes
3. **CURSOR:** Test thoroughly
4. **CLAUDE:** Review changes

---

## 🆘 EMERGENCY PROCEDURES (PERMANENT)

### If Something Breaks
1. **IMMEDIATELY** check Railway logs
2. **IDENTIFY** exact error message
3. **RESEARCH** specific error pattern
4. **REVERT** to last known working state if critical
5. **FIX** incrementally with research-based solution

### Revert Last Deployment
```bash
git revert HEAD
git push origin main
# Wait 90 seconds for re-deployment
npm run verify
```

### Check Railway Logs
1. Go to Railway dashboard
2. Select ai-lead-strategies project
3. Click Backend API or Frontend service
4. View Deployments tab
5. Check logs for errors

---

## ✅ CONTEXT LOADING CHECKLIST

When loading this file in a new Claude conversation, verify:

### Permanent Facts Loaded ✅
- ✅ Source of truth location understood
- ✅ Forbidden paths acknowledged
- ✅ Platform architecture (5 platforms) known
- ✅ Tech stack understood
- ✅ Deployment workflow memorized
- ✅ Master Developer Rules acknowledged
- ✅ Research-first methodology internalized
- ✅ Claude/Cursor coordination understood
- ✅ Verification commands known
- ✅ Emergency procedures understood

### Dynamic Facts to Check 🔍
- 🔍 Check `PROJECT-MANIFEST.json` for current completion %
- 🔍 Check `AI-Lead-Strategies-Platform-Status.md` for current priorities
- 🔍 Check git log for recent changes
- 🔍 Ask user about immediate goals/blockers

---

## 🎯 INITIALIZATION PROMPT

When starting a new conversation, use this prompt:
```markdown
Load context from CLAUDE-BOOTSTRAP.md (permanent facts).

Then check current status:
1. What's the current completion % in PROJECT-MANIFEST.json?
2. What are the current priorities in AI-Lead-Strategies-Platform-Status.md?
3. What are you working on right now?

Confirm you understand:
- ✅ Source of truth location (permanent)
- ✅ Deployment workflow (permanent)
- ✅ Master Developer Rules (permanent)
- 🔍 Current project status (from living docs)

Ready to proceed.
```

---

## 📝 MAINTENANCE NOTES

### This File Should Be Updated When:
- ❌ **NEVER** for completion percentages (use PROJECT-MANIFEST.json)
- ❌ **NEVER** for feature status (use PROJECT-MANIFEST.json)
- ❌ **NEVER** for current priorities (use AI-Lead-Strategies-Platform-Status.md)
- ✅ **YES** if source of truth path changes (unlikely)
- ✅ **YES** if deployment workflow fundamentally changes (unlikely)
- ✅ **YES** if a platform is added/removed (unlikely)
- ✅ **YES** if tech stack fundamentally changes (unlikely)
- ✅ **YES** if Master Developer Rules change (unlikely)

### Versioning
- **Current Version:** 2.0 (Future-Proof)
- **Last Breaking Change:** 2026-02-15
- **Next Review:** When platform architecture changes

---

**YOU ARE NOW FULLY CONTEXTUALIZED!**

This bootstrap file contains **PERMANENT facts** about the AI Lead Strategies Platform. For **CURRENT status**, always check `PROJECT-MANIFEST.json` and `AI-Lead-Strategies-Platform-Status.md`.

**Always verify source of truth location before making changes!**

---

*End of Bootstrap File - Version 2.0 (Future-Proof)*
