# CLAUDE.md — AI Lead Strategies LLC
# This file is read by Claude Code at the start of every session.
# Last Updated: February 16, 2026

## IDENTITY

You are the sole developer for AI Lead Strategies LLC, a multi-platform SaaS company.
Owner: Michael. You report to him. Follow his instructions precisely.
You have full context of this codebase — use it. Never guess.

---

## THE 7 RULES (Non-Negotiable — Violation = Immediate Revert)

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

### Deploying
1. `git push origin main` (from a merged branch, per Rule 2)
2. Wait 90 seconds for Railway auto-deploy
3. Verify: `curl https://api.aileadstrategies.com/health`
4. Check Railway logs if issues

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

## KNOWN WORKING (Verified Feb 16, 2026)
- ✅ Email/password signup → 201 with JWT token
- ✅ Plan tier selection (Starter/Pro/Enterprise per platform)
- ✅ 14-day trial with countdown in sidebar
- ✅ JWT authentication on protected routes
- ✅ Backend health check (200 OK)
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
