# User Journey by Platform

**Current status – itemised breakdown**

---

## 1. LeadSite.AI (Tier 1)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on marketing page | `/leadsite-ai` |
| 2 | Sign up or Login | `/signup` or `/login` |
| 3 | Post-login redirect | `/prospects` |
| 4 | Complete Profile | `/settings` (Profile section) |
| 5 | Use Lead Hunter | `/lead-hunter` – AI chat, find leads, write/send emails |
| 6 | Manage Prospects | `/prospects` – view, filter, add leads |
| 7 | Run Campaigns | `/campaigns` – create & execute email campaigns |
| 8 | Review Replies | `/replies` – inbox for responses |
| 9 | View Analytics | `/analytics` |
| 10 | Platform-specific | `/websites` – website builder |

**Sidebar nav:** Lead Hunter, Websites, Prospects, Campaigns, Replies, Analytics, Profile

---

## 2. LeadSite.IO (Tier 2)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on marketing page | `/leadsite-io` |
| 2 | Sign up or Login | `/signup` or `/login` |
| 3 | Post-login redirect | `/dashboard` |
| 4 | Complete Profile | `/settings` |
| 5 | Use Lead Hunter | `/lead-hunter` |
| 6 | Manage Prospects | `/prospects` |
| 7 | Run Campaigns | `/campaigns` |
| 8 | Review Replies | `/replies` |
| 9 | View Analytics | `/analytics` |
| 10 | Platform-specific | Lead gen + website (same as LeadSite.AI) |

**Sidebar nav:** Lead Hunter, Prospects, Campaigns, Replies, Analytics, Profile

---

## 3. ClientContact.IO (Tier 3)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on marketing page | `/clientcontact-io` |
| 2 | Sign up or Login | `/signup` or `/login` |
| 3 | Post-login redirect | `/inbox` |
| 4 | Complete Profile | `/settings` |
| 5 | Use Lead Hunter | `/lead-hunter` |
| 6 | Platform-specific | `/inbox/channels` – 22-channel unified inbox |
| 7 | Run Campaigns | `/campaigns` |
| 8 | View Analytics | `/analytics` |

**Sidebar nav:** Lead Hunter, Channels, Campaigns, Analytics, Profile

---

## 4. VideoSite.AI (Tier 4)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on marketing page | `/videosite-ai` |
| 2 | Sign up or Login | `/signup` or `/login` |
| 3 | Post-login redirect | `/videos` |
| 4 | Complete Profile | `/settings` |
| 5 | Use Lead Hunter | `/lead-hunter` |
| 6 | Platform-specific | `/videos` – library, `/videos/upload`, `/videos/analytics`, `/earnings` |
| 7 | Review Replies | `/replies` |

**Sidebar nav:** Lead Hunter, Videos, Upload, Analytics, Earnings, Replies, Profile, Settings

---

## 5. UltraLead (Tier 5)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on marketing page | `/ultralead` |
| 2 | Sign up or Login | `/signup` or `/login` |
| 3 | Post-login redirect | `/crm` |
| 4 | Complete Profile | `/settings` |
| 5 | Use Lead Hunter | `/lead-hunter` |
| 6 | Platform-specific | `/crm` – 7 AI agents, `/crm/deals` – pipeline |
| 7 | Manage Prospects | `/prospects` |
| 8 | Run Campaigns | `/campaigns` |
| 9 | Review Replies | `/replies` |
| 10 | View Analytics | `/analytics` |

**Sidebar nav:** Lead Hunter, CRM, Deals, Prospects, Campaigns, Replies, Analytics, Profile

---

## 6. AI Lead Strategies (Main / aileadstrategies.com)

| Step | Action | Destination |
|------|--------|-------------|
| 1 | Land on homepage | `/` |
| 2 | Browse platforms | `/leadsite-ai`, `/leadsite-io`, etc. |
| 3 | Sign up or Login | `/signup` or `/login` |
| 4 | Post-login redirect | Depends on tier (see above) |
| 5 | Platform-specific nav | Shown by user tier (Tier 1–5) |
| 6 | Admin access | `/admin` (admins only) |
| 7 | Platform overview | `/platforms` |

**Sidebar nav:** Lead Hunter, Platforms, Admin, Inbox, Analytics, Profile, Settings

---

## Shared steps for all platforms

- **Profile (`/settings`):** Products/Services, Target Audience, ICP, UVP, Benefits, Pain Points, Tone, CTA, etc. (powers Lead Hunter personalization)
- **Lead Hunter (`/lead-hunter`):** AI chat, find leads, write emails, send emails (via SendGrid), Redis-backed conversation memory
