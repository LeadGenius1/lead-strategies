# Platform Verification & Dashboard Access Guide

## Dashboard URL Structure (Path-Based)

**All 5 platforms use the same dashboard routes.** The sidebar and home screen change based on your **subscription tier** (from signup) or **hostname** when on platform-specific domains.

| Platform        | Primary Dashboard Routes |
|-----------------|--------------------------|
| LeadSite.AI     | `/dashboard`, `/lead-hunter`, `/prospects`, `/campaigns` |
| LeadSite.IO     | Same + `/websites` |
| ClientContact.IO| Same + `/inbox`, `/inbox/settings/channels` |
| VideoSite.AI    | `/videos`, `/videos/upload`, `/videos/analytics`, `/earnings` |
| UltraLead       | `/crm`, `/crm/deals` + shared routes |

### Correct URLs (no 404)
- ✅ `/dashboard` – Main dashboard (redirects to `/login` if not authenticated)
- ✅ `/lead-hunter` – AI chat & campaign wizard
- ✅ `/prospects` – Lead list
- ✅ `/campaigns` – Email campaigns
- ✅ `/videos` – Video library (VideoSite)
- ✅ `/earnings` – Earnings (VideoSite)
- ✅ `/crm` – CRM pipeline (UltraLead)
- ✅ `/inbox` – Unified inbox (ClientContact)

### Not Used
- ❌ `/dashboard/leadsite-ai` – Does not exist (use `/dashboard` + tier-based nav)

---

## Authentication

### Login 401 – Common Causes
1. **No account** – Use [Sign Up](https://aileadstrategies.com/signup) first. `testuser@example.com` is not a built-in test account.
2. **Wrong password** – Reset via [Forgot Password](https://aileadstrategies.com/forgot-password).
3. **Google-only account** – If you signed up with Google, use "Continue with Google" instead of email/password.
4. **Email casing** – Login now normalizes email to lowercase; any casing should work.

### Recommended Test Flow
1. Go to https://aileadstrategies.com/signup
2. Choose a platform (e.g. LeadSite.AI) via the tier selector
3. Create account with email + password
4. After signup, you’re redirected to the correct dashboard for that tier

---

## Subdomain Architecture

**Current design:** Path-based routing on `aileadstrategies.com`.

- `app.aileadstrategies.com` – Not configured (optional future use)
- `leadsite-ai.aileadstrategies.com` – Not configured

Dashboards are accessed at:
- `https://aileadstrategies.com/dashboard`
- `https://aileadstrategies.com/lead-hunter`
- etc.

---

## Healthcheck Endpoints

| Service  | URL                                      | Expected Response  |
|----------|-------------------------------------------|--------------------|
| Frontend | https://aileadstrategies.com/api/health   | `{"status":"ok"}`  |
| Backend  | https://api.aileadstrategies.com/api/v1/health | `{"status":"healthy"}` |

---

## Lead Hunter Email Sending

When you ask Lead Hunter to "send" an email, it uses the **send_email** tool to actually deliver via SendGrid.

**Requirement:** Set `SENDGRID_API_KEY` in Railway backend environment variables. Without it, Lead Hunter will respond that email sending is not configured and suggest using the Campaign flow instead.

**Optional:** `FROM_EMAIL` (default: noreply@aileadstrategies.com), `FROM_NAME` (default: AI Lead Strategies).

---

## Platform Summary

| Platform        | Marketing Page            | Dashboard Entry      | Status |
|-----------------|---------------------------|----------------------|--------|
| LeadSite.AI     | ✅ /leadsite-ai           | /dashboard, /prospects | Tier 1 |
| LeadSite.IO     | ✅ /leadsite-io           | /dashboard, /websites  | Tier 2 |
| ClientContact.IO| ✅ /clientcontact-io      | /inbox, /dashboard     | Tier 3 |
| VideoSite.AI    | ✅ /videosite-ai          | /videos, /earnings     | Tier 4 |
| UltraLead       | ✅ /ultralead             | /crm, /dashboard       | Tier 5 |
