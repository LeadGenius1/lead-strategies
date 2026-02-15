# Platform Dashboard Audit Chart

**Source:** `lib/platform-navigation.js` + `app/(dashboard)/layout.js`  
**Purpose:** Verify each platform has the correct sidebar functions for its product focus.

---

## Quick Reference Table

| Platform | Tier | Primary Domain | Login Redirect | Unique Functions (Pro) |
|----------|------|----------------|----------------|------------------------|
| **LeadSite.AI** | 1 | leadsite.ai | `/prospects` | Proactive Hunter (24/7 lead machine) |
| **LeadSite.IO** | 2 | leadsite.io | `/dashboard` | Websites (AI builder) |
| **ClientContact.IO** | 3 | clientcontact.io | `/inbox` | Channels (22+ channel inbox) |
| **VideoSite.AI** | 4 | videosite.ai | `/videos` | Videos, Upload, Analytics, Earnings |
| **UltraLead** | 5 | ultralead.ai | `/crm` | CRM, Deals |
| **AI Lead Strategies** | — | aileadstrategies.com | — | Platforms, Admin |

---

## Full Sidebar Functions by Platform

### 1. LeadSite.AI (Tier 1) — AI Lead Scoring & Email Outreach
*Product: Email lead generation, AI prospect discovery, lead scoring*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | AI-powered lead discovery & scoring |
| 2 | **Proactive Hunter** | `/proactive-hunter` | 24/7 automated lead machine (unique) |
| 3 | Websites | `/websites` | View built websites |
| 4 | Prospects | `/prospects` | Lead database & management |
| 5 | Campaigns | `/campaigns` | Email campaigns |
| 6 | Replies | `/replies` | Inbound reply tracking |
| 7 | Analytics | `/analytics` | Performance analytics |
| 8 | Profile | `/settings` | Account settings |

---

### 2. LeadSite.IO (Tier 2) — AI Website Builder + Lead Gen
*Product: AI website builder, 1 free site, lead capture, custom domains*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | Lead discovery |
| 2 | Proactive Hunter | `/proactive-hunter` | Automated prospecting |
| 3 | **Websites** | `/websites` | AI website builder & management (unique) |
| 4 | Prospects | `/prospects` | Lead database |
| 5 | Campaigns | `/campaigns` | Email outreach |
| 6 | Replies | `/replies` | Reply inbox |
| 7 | Analytics | `/analytics` | Site + campaign analytics |
| 8 | Profile | `/settings` | Account settings |

---

### 3. ClientContact.IO (Tier 3) — 22+ Channel Unified Inbox
*Product: Unified inbox, 22+ channels, 7 AI agents, CRM*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | Lead discovery |
| 2 | Proactive Hunter | `/proactive-hunter` | Automated prospecting |
| 3 | **Channels** | `/inbox/channels` | Channel setup (22+ channels) (unique) |
| 4 | Campaigns | `/campaigns` | Email campaigns |
| 5 | Analytics | `/analytics` | Analytics dashboard |
| 6 | Profile | `/settings` | Account settings |

**Note:** Main Inbox at `/inbox` — login redirect goes here. Channels = settings for inbox channels.

---

### 4. VideoSite.AI (Tier 4) — Free Video Monetization
*Product: Video hosting, earn $1/view, upload, analytics, earnings*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | Lead discovery |
| 2 | Proactive Hunter | `/proactive-hunter` | Prospecting |
| 3 | **Videos** | `/videos` | Video library (unique) |
| 4 | **Upload** | `/videos/upload` | Upload new video (unique) |
| 5 | **Analytics** | `/videos/analytics` | Video performance (unique) |
| 6 | **Earnings** | `/earnings` | Creator earnings & payouts (unique) |
| 7 | Replies | `/replies` | Inbound messages |
| 8 | Profile | `/settings` | Account settings |
| 9 | Settings | `/settings` | Settings (duplicate?) |

---

### 5. UltraLead (Tier 5) — Full CRM + 7 AI Agents
*Product: Full CRM, 7 self-healing AI agents, deals, pipeline, voice, unified inbox*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | Lead discovery |
| 2 | Proactive Hunter | `/proactive-hunter` | Automated prospecting |
| 3 | **CRM** | `/crm` | CRM contacts & companies (unique) |
| 4 | **Deals** | `/crm/deals` | Deal pipeline (unique) |
| 5 | Prospects | `/prospects` | Prospect database |
| 6 | Campaigns | `/campaigns` | Email campaigns |
| 7 | Replies | `/replies` | Reply inbox |
| 8 | Analytics | `/analytics` | Analytics |
| 9 | Profile | `/settings` | Account settings |

---

### 6. AI Lead Strategies (Main Domain) — Admin / Multi-Platform
*Product: Overview of all platforms, admin, platform management*

| # | Sidebar Item | Route | Purpose |
|---|--------------|-------|---------|
| 1 | Lead Hunter | `/lead-hunter` | Lead discovery |
| 2 | Proactive Hunter | `/proactive-hunter` | Prospecting |
| 3 | **Platforms** | `/platforms` | Platform switcher (unique) |
| 4 | **Admin** | `/admin` | Admin dashboard (unique) |
| 5 | Inbox | `/inbox` | Unified inbox |
| 6 | Analytics | `/analytics` | Analytics |
| 7 | Profile | `/settings` | Profile |
| 8 | Settings | `/settings` | Settings |

---

## Diagnosis: Correctness Check

| Platform | Expected Focus | Sidebar Match? | Notes |
|----------|----------------|----------------|-------|
| **LeadSite.AI** | Lead scoring, email, prospect discovery | ✅ | Proactive Hunter unique fits 24/7 automation |
| **LeadSite.IO** | AI websites, lead capture | ✅ | Websites unique correctly highlighted |
| **ClientContact.IO** | 22+ channel inbox, unified comms | ⚠️ | Has Channels; **missing main Inbox** in nav—login goes to `/inbox` but nav shows Channels. Consider adding "Inbox" before Channels. |
| **VideoSite.AI** | Videos, upload, earnings | ✅ | Videos, Upload, Analytics, Earnings all unique—correct |
| **UltraLead** | Full CRM, deals, AI agents | ✅ | CRM + Deals unique—correct |
| **Main domain** | Admin, platform management | ✅ | Platforms + Admin unique—correct |

---

## Potential Fixes

1. **ClientContact.IO:** Add "Inbox" (`/inbox`) to nav—users land there on login; Channels is for setup.
2. **VideoSite.AI:** Profile and Settings both point to `/settings`—consider merging or renaming one.
3. **Lead Hunter on VideoSite:** VideoSite creators may not need Lead Hunter—could be optional/low-priority.
4. **Inbox/Settings (localhost):** Localhost config has both Inbox and full nav—used for dev testing.

---

## Route → Page Mapping (Dashboard Routes That Exist)

| Route | Page Exists | Platform(s) |
|-------|-------------|-------------|
| `/lead-hunter` | ✅ | All |
| `/proactive-hunter` | ✅ | All |
| `/websites` | ✅ | LeadSite.IO, LeadSite.AI |
| `/prospects` | ✅ | LeadSite, UltraLead |
| `/campaigns` | ✅ | LeadSite, ClientContact, UltraLead |
| `/replies` | ✅ | LeadSite, VideoSite, UltraLead |
| `/analytics` | ✅ | All |
| `/videos` | ✅ | VideoSite |
| `/videos/upload` | ✅ | VideoSite |
| `/videos/analytics` | ✅ | VideoSite |
| `/earnings` | ✅ | VideoSite |
| `/inbox` | ✅ | ClientContact, Main |
| `/inbox/settings/channels` | ✅ | ClientContact (nav fixed: was /inbox/channels) |
| `/crm` | ✅ | UltraLead |
| `/crm/deals` | ✅ | UltraLead |
| `/settings` | ✅ | All |
| `/platforms` | ✅ | Main domain—platform switcher page added |
| `/admin` | ✅ | Main—redirects to /admin/dashboard |

---

## Tier → Hostname Mapping (for aileadstrategies.com)

When logged in on aileadstrategies.com, sidebar uses user tier to show platform-specific nav:

| Tier | Hostname Used | Platform |
|------|---------------|----------|
| 1 | leadsite.ai | LeadSite.AI |
| 2 | leadsite.io | LeadSite.IO |
| 3 | clientcontact.io | ClientContact.IO |
| 4 | videosite.ai | VideoSite.AI |
| 5 | ultralead.ai | UltraLead |

---

## Route Tests (Feb 2025)

**Script:** `node scripts/test-dashboard-routes.js`  
**Base URL:** `BASE_URL` env var or `http://localhost:3000` (use `BASE_URL=https://aileadstrategies.com` for production).

**Fixes applied:**
1. **`/inbox/channels` → `/inbox/settings/channels`** — Nav updated in `lib/platform-navigation.js`; actual page lives at `inbox/settings/channels`.
2. **`/platforms`** — Created `app/(dashboard)/platforms/page.js` (platform switcher overview).
3. **`/admin`** — Created `app/admin/page.js` to redirect to `/admin/dashboard`.

After deployment, all 21 routes should pass. For local testing, run `npm run dev` then `node scripts/test-dashboard-routes.js`.
