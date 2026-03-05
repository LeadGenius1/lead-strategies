# CLAUDE.md — AI Lead Strategies LLC
# This file is read by Claude Code at the start of every session.
# Last Updated: February 22, 2026

## IDENTITY

You are the sole developer for AI Lead Strategies LLC, a multi-platform SaaS company.
Owner: Michael. You report to him. Follow his instructions precisely.
You have full context of this codebase — use it. Never guess.

---

## THE 12 RULES (Non-Negotiable — Violation = Immediate Revert)

### RULE 1: ONE FILE AT A TIME
Every change targets ONE file or ONE route. Never "fix all auth" or "update all platforms."

### RULE 2: BRANCH FIRST, NEVER MAIN
```bash
git checkout -b fix/descriptive-name   # BEFORE any work
# ... make changes, test ...
git checkout main && git merge fix/descriptive-name && git push origin main  # AFTER verified
```
Never commit directly to `main`. If you break something, delete the branch and start over.

### RULE 3: READ THE DIFF BEFORE COMMITTING
After ANY change, run `git diff` and check for:
- Files you weren't asked to change
- Deleted code that was working
- Changed import paths or middleware order
- Altered response formats
If unexpected changes exist → `git checkout .` and retry with narrower scope.

### RULE 4: TEST AUTH AFTER EVERY CHANGE
After ANY backend change — even unrelated to auth — run:
```bash
curl https://api.aileadstrategies.com/health                    # Must return 200
curl -X POST https://api.aileadstrategies.com/api/auth/signup \
  -H "Content-Type: application/json" -d '{}'                    # Must return 400, NOT 404/500
curl https://api.aileadstrategies.com/api/v1/leads               # Must return 401, NOT 404/500
```
If any test fails → DO NOT push. Fix first.

### RULE 5: LOCKED FILES (READ-ONLY unless specifically asked)
| File | Contains | Only Touch When |
|------|----------|-----------------|
| `backend/src/routes/auth.js` | All auth routes | Fixing auth specifically |
| `backend/src/middleware/auth.js` | JWT validation | Fixing auth middleware |
| `backend/src/index.js` | Route mounting | Adding new route files |
| `backend/prisma/schema.prisma` | Database schema | Schema migration needed |
| `prisma/schema.prisma` | Frontend Prisma (synced with backend) | Schema migration needed |
| `lib/auth.js` (frontend) | Auth API calls | Fixing frontend auth |
| `lib/prisma.ts` (frontend) | Prisma client singleton | Never — it works |

### RULE 6: COMMIT MESSAGE FORMAT
```
fix(auth): correct signup password hashing
feat(videos): add view count endpoint
fix(frontend): update signup form error handling
chore(deps): update prisma to 5.x
```
Always include the scope in parentheses.

### RULE 7: DEPLOYMENT GATE
Before ANY `git push origin main`:
1. Verify you're on a branch (NOT main): `git branch --show-current`
2. Run local tests: `npm run dev` starts without errors
3. Review the diff: `git diff main` — read every line
4. Merge and push: `git checkout main && git merge [branch] && git push origin main`
5. Wait 90 seconds for Railway auto-deploy
6. Verify production: run the 3 curl tests from Rule 4

### RULE 8: FEATURE FLAGS (MANDATORY)
Every platform feature MUST be wrapped in a feature flag. New features default OFF.
```javascript
// backend/src/config/feature-flags.js — Single source of truth
// Core platforms: process.env.ENABLE_X !== 'false' (ON by default)
// New features:   process.env.ENABLE_X === 'true'  (OFF by default)
```
- Route mounting in `index.js` MUST check `featureFlags.ENABLE_X` before `app.use()`
- Never mount routes for disabled features
- Toggle features via Railway environment variables — zero code changes needed

### RULE 9: COMPREHENSIVE HEALTH CHECK
The `/health` endpoint MUST verify all active platform models:
```bash
curl https://api.aileadstrategies.com/health
# Must return: { status: "ok", checks: { database: "ok", prisma_user: "ok", ... }, features: { ... } }
```
- Database connectivity check
- `prisma.user.count()` (core — always checked)
- Platform model checks gated by feature flags (only checks enabled platforms)
- Returns 503 if ANY check fails — do NOT deploy if health returns 503

### RULE 10: AUTOMATED TESTING REQUIRED
Before deploying, run the comprehensive test suite:
```bash
bash tests/comprehensive-platform-tests.sh
```
- Layer 1: Health endpoint + feature flags verification
- Layer 2: API endpoint tests (auth 400, protected routes 401)
- Layer 3: Frontend page tests (homepage, login, signup return 200)
- Layer 4: Database model tests via /health checks
- ALL tests must pass (exit code 0) before deploying. NO EXCEPTIONS.

### RULE 11: GRADUAL FEATURE ROLLOUT
New features follow this deployment sequence:
1. **Code with flag OFF** — Merge feature code with `ENABLE_X === 'true'` (defaults OFF)
2. **Deploy** — Push to main, Railway deploys, existing features unaffected
3. **Run tests** — `bash tests/comprehensive-platform-tests.sh` — all must pass
4. **Enable flag** — Set `ENABLE_X=true` in Railway environment variables
5. **Verify** — Run tests again after flag is enabled
6. **If broken** — Set `ENABLE_X=false` in Railway — instant rollback, no code change needed

### RULE 12: DEPENDENCY VERIFICATION (MANDATORY)
Any time a file is copied between repos, modified with new `require()` statements, or created with imports — ALWAYS cross-check every `require()` against `backend/package.json` BEFORE committing.
```bash
grep "require('" [file] | grep -v "\.\/"
```
Then verify each against `package.json`. Missing packages must be `npm install --save` FIRST. Never commit code with unverified dependencies.

---

## ARCHITECTURE

### Repository
- **Repo:** `LeadGenius1/lead-strategies` on GitHub
- **Branch:** `main` (NO master branch — never reference one)
- **Type:** Monorepo
  - `/` — Frontend (Next.js 14, deployed on Railway as `superb-possibility`)
  - `/backend` — Backend API (Express.js, deployed on Railway as `backend`)

### Infrastructure (Railway)
| Service | Domain | Purpose |
|---------|--------|---------|
| Backend API | `api.aileadstrategies.com` | Express REST API, auth, business logic |
| Frontend | `aileadstrategies.com` | Next.js application |
| PostgreSQL | Railway internal | Primary database via Prisma ORM |
| Redis | Railway internal | Session cache, rate limiting |
| Worker | Background | Async job processing |

### Database
- **Type:** PostgreSQL on Railway
- **ORM:** Prisma
- **Connection:** Railway public URL (`switchyard.proxy.rlwy.net:32069`)
- **⚠️ CRITICAL:** NEVER use `postgres.railway.internal` — it does NOT work
- **Schema location:** `backend/prisma/schema.prisma` (source of truth)
- **Frontend schema:** `prisma/schema.prisma` (must stay synced with backend)

### Storage & Services
| Service | Purpose | Config |
|---------|---------|--------|
| Cloudflare R2 | Video/file storage | Bucket: `videosite`, CORS enabled |
| R2 Public URL | Public video access | `https://pub-00746658f70a4185a900f207b96d9e3b.r2.dev` |
| Mailgun | Email delivery | DNS verified (SPF, DKIM, DMARC) |
| Stripe | Payments | API keys in Railway env vars |

### Authentication
- **Method:** Email/Password signup + Google OAuth 2.0
- **Tokens:** JWT (signed with JWT_SECRET env var)
- **Sessions:** Cookie-based with Redis cache
- **Flow:** Signup → JWT issued → Cookie set → Protected routes check token

### Frontend Dependencies
- Root `package.json` ONLY — never put frontend deps in backend/
- Prisma client generated from root `prisma/schema.prisma`
- Build script: `"prisma generate && next build"`

### Backend Dependencies
- `backend/package.json` ONLY — never put backend deps in root
- Never mix frontend and backend dependencies

---

## THE 5 PLATFORMS

This is a multi-platform SaaS. Each platform has its own domain, pricing, and features.
The backend serves all platforms. The frontend uses domain-based feature flags.

### 1. LeadSite.IO (AI Website Builder)
- **Domain:** leadsiteio.com
- **Pricing:** $49 / $149 / $349 per month
- **Status:** AI builder working (6 questions → template → generated site)
- **Key files:** `app/api/websites/generate/route.js`, `app/(dashboard)/websites/`
- **TODO:** Website editing, subdomain publishing, custom domains, lead capture forms, build limits per plan

### 2. LeadSite.AI (Email Lead Generation)
- **Domain:** leadsiteai.com
- **Pricing:** $49 / $149 / $349 per month
- **Features:** Lead Hunter (F01), Proactive Hunter (F02), Prospects (F03), Campaigns (F04), Replies (F05)
- **Status:** Sidebar navigation works. Core features need end-to-end verification.
- **Email:** Mailgun configured with verified DNS

### 3. ClientContact.IO (Unified Inbox)
- **Domain:** clientcontactio.com
- **Pricing:** $99 / $149 / $399 per month
- **Features:** Unified Inbox (F07), Channel Manager (F08), SMS Outreach (F17), 22+ channels
- **Status:** Sidebar navigation works. Channel connections and inbox flow need verification.

### 4. VideoSite.AI (Video Monetization)
- **Domain:** videositeai.com
- **Pricing:** FREE
- **Features:** Video upload (F10), listing (F09), view tracking, creator earnings (F11), payouts
- **Status:** Upload and listing working. Playback, earnings, and payouts need verification.
- **Storage:** Cloudflare R2 with presigned URL upload flow

### 5. UltraLead.AI (All-in-One Dashboard)
- **Domain:** ultraleadai.com
- **Pricing:** $499 per month
- **Features:** All features from all platforms + CRM (F12), Deals (F13), AI Copywriter (F18)
- **Status:** Dashboard, Profile, Settings, Platforms overview working. CRM, Deals, Analytics, AI Copywriter need verification.

---

## DESIGN SYSTEM

- **Name:** AETHER UI
- **Scope:** All admin/dashboard interfaces use AETHER
- **Customer-facing websites:** Use their chosen template style (NOT AETHER)
- **Consistency:** When modifying any dashboard page, match existing AETHER patterns

---

## COMMON TASKS

### Adding a new API route
1. Create file in `backend/src/routes/[feature].js`
2. Mount it in `backend/src/index.js` (ONLY file to touch for mounting)
3. Test locally with `npm run dev` in `/backend`
4. Test auth still works (Rule 4)

### Modifying database schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name` in `/backend`
3. Copy changes to root `prisma/schema.prisma` (keep them synced!)
4. Run `npx prisma generate` in root for frontend
5. Test both backend and frontend

### Adding a frontend page
1. Create in `app/(dashboard)/[section]/page.js` or appropriate route
2. Follow existing patterns — check similar pages first
3. Use AETHER UI components for dashboard pages
4. Test that auth redirects work for protected routes

### Deploying (STANDARD_EXECUTION_POLICY v2.0)
```bash
# 1. Branch and make changes (Rule 2)
git checkout -b feat/descriptive-name

# 2. Make changes, commit
git add [files] && git commit -m "feat(scope): description"

# 3. Merge to main and push
git checkout main && git merge feat/descriptive-name && git push origin main

# 4. Wait for Railway auto-deploy
sleep 90

# 5. Run comprehensive tests (Rule 10)
bash tests/comprehensive-platform-tests.sh

# 6. Verify: ALL tests must pass. If any fail → git revert HEAD && git push origin main
```

### Emergency Rollback
```bash
# Option 1: Revert last commit
git revert HEAD && git push origin main
# Wait 90 seconds

# Option 2: Railway dashboard
# railway.app → Backend → Deployments → Click previous → Rollback

# ALWAYS verify after rollback:
curl https://api.aileadstrategies.com/health
curl -X POST https://api.aileadstrategies.com/api/auth/signup -H "Content-Type: application/json" -d '{}'
```

---

## KNOWN WORKING (Verified Feb 22, 2026)
- ✅ Email/password signup → 201 with JWT token
- ✅ Plan tier selection (Starter/Pro/Enterprise per platform)
- ✅ 14-day trial with countdown in sidebar
- ✅ JWT authentication on protected routes
- ✅ Backend health check (200 OK) with comprehensive model verification
- ✅ Feature flags system (7 flags, all core platforms enabled)
- ✅ Automated test suite (18/18 tests passing)
- ✅ Frontend builds and deploys successfully
- ✅ Database queries via Prisma
- ✅ Cloudflare R2 video upload via presigned URLs
- ✅ Video listing in dashboard
- ✅ AI Website Builder (6 questions → template → generated site)
- ✅ Website preview
- ✅ Admin dashboard, Profile, Settings, Platforms overview

## KNOWN ISSUES / TODO
- ⚪ Google OAuth — not tested end-to-end
- ⚪ Stripe checkout flow — API keys configured but flow untested
- ⚪ Video playback — needs R2 public URL verification
- ⚪ LeadSite.AI features (F01-F05) — need end-to-end verification
- ⚪ ClientContact.IO features (F07-F08, F17) — need verification
- ⚪ CRM, Deals, Analytics, AI Copywriter — need verification
- 🔴 Website build limits per plan tier — not implemented (unlimited currently)

---

## CODING STANDARDS

- **Language:** JavaScript (backend), JavaScript/TypeScript (frontend)
- **Framework:** Express.js (backend), Next.js 14 (frontend)
- **ORM:** Prisma
- **Style:** Async/await over callbacks, functional React components
- **Error handling:** Try/catch on all async operations, return proper HTTP status codes
- **Validation:** Validate all input on backend routes before processing
- **Security:** Environment variables for secrets, CORS configured, rate limiting active

## THINGS TO NEVER DO
- Never use `postgres.railway.internal` for database connection
- Never commit directly to `main`
- Never modify locked files without being specifically asked
- Never make changes to multiple files in one step
- Never deploy without testing auth
- Never guess at implementations — read the existing code first
- Never reference `lead-strategies-backend` (old repo, deleted)
- Never reference a `master` branch (doesn't exist, use `main`)
- Never mix frontend and backend dependencies
- Never break existing functionality to add new features

---

## MASTER DEVELOPER RULES (Appended)

# Claude Comprehensive Master Developer Rules
## AI Lead Strategies LLC - Development Methodology v1.0
**Effective:** February 12, 2026
**Purpose:** Systematic development approach for production-ready SaaS platform serving 1M+ users

---

### CORE PRINCIPLE: NEVER BREAK EXISTING CODE

#### Critical Safety Rules (Non-Negotiable)
1. **NEVER GUESS IMPLEMENTATIONS** - Research existing patterns first
2. **VERIFY DEPENDENCIES** - Check all imports, requires, and package versions
3. **THINK THOROUGHLY** - Analyze impact before making changes
4. **PRESERVE STRUCTURE** - Maintain existing architecture and patterns
5. **INCREMENTAL CHANGES** - One feature at a time, test, then proceed

---

### RESEARCH-FIRST METHODOLOGY

#### Before ANY Code Change:
1. **SEARCH** relevant documentation and implementation patterns
2. **EXAMINE** existing codebase structure and conventions
3. **UNDERSTAND** current functionality and dependencies
4. **PLAN** minimal changes that preserve existing functionality
5. **IMPLEMENT** incrementally with verification at each step

#### Research Sources Priority:
1. **Official Documentation** (Express.js, Node.js, React, etc.)
2. **Existing Codebase** (established patterns and conventions)
3. **Production Examples** (verified implementations)
4. **Stack Overflow/GitHub** (community solutions)
5. **Never rely on assumptions or memory**

---

### ARCHITECTURE RULES

#### Repository Structure (ABSOLUTE)
- **Only Repository**: `LeadGenius1/lead-strategies` on `main` branch
- **Monorepo Structure**: `/backend` = Railway backend, `/` = frontend (Next.js)
- **NO master branch** - always use `main`
- **OLD REPO DELETED**: Never reference `lead-strategies-backend`

#### Dependency Management
- **Backend deps**: `backend/package.json` ONLY
- **Frontend deps**: Root `package.json` ONLY
- **Never mix**: Backend and frontend dependencies
- **Version locks**: Use exact versions for production stability

#### Database Connection
- **DATABASE_URL**: Must use Railway public URL (`switchyard.proxy.rlwy.net:32069`)
- **NOT internal hostname**: `postgres.railway.internal` does NOT work
- **Connection pooling**: Maintain existing Prisma configuration

---

### AUTHENTICATION & SECURITY

#### OAuth Implementation
- **Research OAuth patterns** before implementing
- **Check existing auth middleware** before modifying
- **Preserve session handling** mechanisms
- **Never break JWT validation** or user context

#### Security Protocols
- **Environment variables** for all secrets
- **CORS policies** properly configured
- **Rate limiting** implemented
- **Input validation** on all endpoints

---

### DEVELOPMENT WORKFLOW

#### Change Implementation Process:
1. **RESEARCH PHASE**
   - Search documentation for best practices
   - Examine existing code patterns
   - Identify minimum viable change

2. **PLANNING PHASE**
   - Document exact changes needed
   - Identify potential breaking points
   - Plan rollback strategy

3. **IMPLEMENTATION PHASE**
   - Make minimal changes first
   - Test at each step
   - Commit frequently with descriptive messages

4. **VERIFICATION PHASE**
   - Verify functionality works
   - Check for unintended side effects
   - Test authentication and core flows

#### Commit Standards:
- **Descriptive messages**: `fix: use R2.dev public URLs for video playback`
- **Small, focused commits**: One feature/fix per commit
- **Test before commit**: Ensure changes work locally
- **Clear commit history**: Easy to understand and revert if needed

---

### PLATFORM-SPECIFIC RULES

#### Railway Deployment
- **Auto-deploy on push** to main branch
- **Monitor logs** during deployment
- **Health checks** must pass
- **Environment variables** properly set

#### Cloudflare R2 Storage
- **Public/private access** configured correctly
- **CORS settings** for frontend domains
- **Presigned URLs** for secure uploads
- **CDN integration** for performance

#### Frontend (Next.js)
- **API routes** properly structured
- **Authentication** integrated with backend
- **Error handling** implemented
- **Production builds** optimized

#### Backend (Express.js)
- **Route organization** by feature
- **Middleware** properly ordered
- **Error handling** centralized
- **Database queries** optimized

---

### TESTING & VERIFICATION

#### Before Any Deployment:
1. **Local testing** - All functionality works locally
2. **Database operations** - Queries execute successfully
3. **Authentication flow** - Login/logout works
4. **API endpoints** - All routes return expected responses
5. **Frontend integration** - UI connects to backend properly

#### Production Readiness Checklist:
- All features functionally complete
- Authentication working across all platforms
- Database migrations successful
- File uploads/storage working
- Error handling implemented
- Performance optimized for 1M+ users
- Security protocols active
- Monitoring and logging configured

---

### ERROR HANDLING PROTOCOL

#### When Things Break:
1. **IMMEDIATELY** check deployment logs
2. **IDENTIFY** the exact error message
3. **RESEARCH** the specific error pattern
4. **REVERT** to last known working state if critical
5. **FIX** incrementally with research-based solution

#### Never Do:
- Guess at solutions without research
- Make multiple changes simultaneously
- Ignore warning messages
- Deploy without testing
- Break working functionality to add features

---

### SUCCESS METRICS

#### Platform Completion Criteria:
1. **VideoSite.AI**: 100% functional (upload, playback, analytics)
2. **LeadSite.IO**: Website creator fully operational
3. **ClientContact.IO**: Unified inbox with channel integrations
4. **UltraLead.AI**: All-in-one dashboard working
5. **LeadSite.AI**: Email lead generation active
6. **Stripe Integration**: Payment processing for all tiers
7. **1M+ User Ready**: Infrastructure scaled appropriately

#### Quality Standards:
- **Zero breaking changes** during development
- **Research-driven decisions** for all implementations
- **Incremental progress** with verification at each step
- **Production-ready code** from day one
- **Comprehensive error handling** and user experience

---

### CURSOR INTEGRATION DIRECTIVES

#### For Cursor IDE:
1. **Always examine existing code** before making changes
2. **Search documentation** for implementation patterns
3. **Make minimal changes** that preserve functionality
4. **Test incrementally** and commit frequently
5. **Follow repository structure** rules absolutely
6. **Verify dependencies** and imports before use
7. **Research error messages** before attempting fixes

#### Prompt Structure for Cursor:
```
RESEARCH FIRST: [Search relevant documentation]
EXAMINE EXISTING: [Review current code patterns]
PLAN MINIMAL: [Identify smallest viable change]
IMPLEMENT: [Make change preserving existing functionality]
VERIFY: [Test that change works and doesn't break other features]
```

---

### ACCOUNTABILITY & ENFORCEMENT

#### Rule Violations:
- **Breaking existing functionality** = Immediate revert and research
- **Guessing implementations** = Stop, research, then proceed
- **Complex untested changes** = Break into smaller, tested increments
- **Ignoring dependency checks** = Verify all imports and requirements

#### Success Measures:
- **Zero regressions** in working functionality
- **Research-backed decisions** for all implementations
- **Incremental progress** toward production readiness
- **Systematic approach** to problem-solving

---

**REMEMBER: We are building a production platform for 1M+ users. Every change must be research-driven, tested, and preserve existing functionality. No guessing. No breaking changes. Systematic progress only.**

---

*This document serves as the foundation for all AI Lead Strategies LLC development work. Adherence to these rules is critical for successful platform completion and production deployment.*
