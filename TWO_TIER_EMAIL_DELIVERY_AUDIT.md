# Two-Tier Email Delivery System — Completion Audit

**Date:** 2026-02-10

---

## 1. Prisma Models

| Model | File | Status |
|-------|------|--------|
| **UserEmailAccount** | `backend/prisma/schema.prisma`, `prisma/schema.prisma` (lines 1349–1392) | ✅ Complete |
| **EmailPoolSubscription** | Same (lines 1395–1412) | ✅ Complete |
| **EmailProvider** enum | GMAIL, OUTLOOK, SMTP, MANAGED_POOL | ✅ Complete |
| **AccountStatus** enum | ACTIVE, WARMING, PAUSED, DISCONNECTED, ERROR | ✅ Complete |
| **EmailTier** enum | FREE, PRO | ✅ Complete |
| **PoolSubscriptionStatus** enum | PENDING, ACTIVE, PAST_DUE, CANCELED, EXPIRED | ✅ Complete |

**User relation fields:** `User.emailAccounts`, `User.emailPoolSubscription`

---

## 2. API Routes — `app/api/user/email-accounts/`

| File | Method | Status |
|------|--------|--------|
| `route.ts` | GET | ✅ List accounts + pool subscription |
| `connect/route.ts` | POST | ✅ Connect custom SMTP (test + create) |
| `[id]/route.ts` | GET, DELETE | ✅ Fetch account, delete (blocks pool accounts) |
| `[id]/disconnect/route.ts` | POST | ✅ Disconnect (clear tokens, set DISCONNECTED) |
| `oauth/google/route.ts` | GET | ✅ Initiate Google OAuth redirect |
| `oauth/google/callback/route.ts` | GET | ✅ Exchange code, create/update UserEmailAccount |
| `oauth/microsoft/route.ts` | GET | ✅ Initiate Microsoft OAuth redirect |
| `oauth/microsoft/callback/route.ts` | GET | ✅ Exchange code, create/update UserEmailAccount |
| `test-connection/route.ts` | POST | ✅ Test SMTP connection |

---

## 3. API Routes — `app/api/user/email-pool/`

| File | Method | Status |
|------|--------|--------|
| `subscribe/route.ts` | POST | ✅ Create Stripe checkout for $49/mo pool |
| `cancel/route.ts` | POST | ✅ Cancel at period end via Stripe API |
| `status/route.ts` | GET | ✅ Return pool status via pool-manager |
| `webhook/route.ts` | POST | ✅ Stripe webhook (see §6) |

---

## 4. Backend Routes / Services (Express)

| Area | Status |
|------|--------|
| **Email sending** | ❌ No backend route that sends via `UserEmailAccount` |
| **backend/src/routes/emails.js** | ✅ Exists — templates/database (Lead Hunter), not user pool |
| **Campaign send** | Uses separate flow; does not use `UserEmailAccount` for sending |

**Conclusion:** No backend service has been added that actually sends email through connected accounts or pool accounts.

---

## 5. Frontend Pages / Components

| File | Status |
|------|--------|
| `components/profile/EmailAccountsSection.tsx` | ✅ Main UI — fetch accounts, pool subscribe/cancel, connect modal |
| `components/profile/EmailTierSelector.tsx` | ✅ Tier choice (own email vs $49 pool) |
| `components/profile/ConnectEmailModal.tsx` | ✅ OAuth + custom SMTP tabs |
| `components/profile/EmailAccountCard.tsx` | ✅ Single account display, disconnect/delete |
| `components/profile/PoolStatusCard.tsx` | ✅ Pool status display |

**Placement:** `app/(dashboard)/settings/page.js` — renders `<EmailAccountsSection />`.

**Issue:** OAuth callbacks and Stripe success redirect to `/profile`, but there is no `/profile` route. Email management lives on `/settings`. Result: OAuth/stripe redirects likely 404 unless a redirect exists.

---

## 6. Stripe Webhook for $49/mo Email Pool

| File | Status |
|------|--------|
| `app/api/user/email-pool/webhook/route.ts` | ✅ Implemented |

**Handled events:**
- `checkout.session.completed` → update subscription, call `provisionPoolEmails`
- `customer.subscription.updated` → sync period, cancel_at_period_end
- `customer.subscription.deleted` → set EXPIRED, call `deprovisionPoolEmails`
- `invoice.payment_failed` → set PAST_DUE

**Env vars:** `EMAIL_POOL_STRIPE_WEBHOOK_SECRET` (or `STRIPE_WEBHOOK_SECRET`)

**Setup doc:** `STRIPE_POOL_SETUP.md` — webhook URL: `https://aileadstrategies.com/api/user/email-pool/webhook`

---

## 7. Google / Microsoft OAuth

| Provider | Status |
|----------|--------|
| **Google** | ✅ Implemented |
| **Microsoft** | ✅ Implemented |

**Files:**
- `lib/email-oauth/google.ts` — OAuth client, auth URL, code exchange, token refresh
- `lib/email-oauth/microsoft.ts` — MSAL client, auth URL, code exchange
- `lib/email-oauth/token-manager.ts` — encrypt/decrypt tokens (AES-256-GCM)

**Scopes:** Gmail send/read, Outlook Mail.Send/Mail.ReadWrite/User.Read

**Env vars:** `EMAIL_GOOGLE_CLIENT_ID`, `EMAIL_GOOGLE_CLIENT_SECRET`, `EMAIL_GOOGLE_REDIRECT_URI` (or `GOOGLE_*`); `EMAIL_MICROSOFT_CLIENT_ID`, etc. (or `MICROSOFT_*`)

---

## 8. Mailgun for Managed Pool

| Item | Status |
|------|--------|
| **Pool SMTP config** | Uses `smtp.mailgun.org` as default host |
| **Env vars** | `POOL_SMTP_HOST`, `POOL_SMTP_USERNAME`, `POOL_SMTP_PASSWORD` |
| **File** | `lib/email-pool/pool-manager.ts` — `provisionPoolEmails()` creates `UserEmailAccount` with `smtpHost: process.env.POOL_SMTP_HOST \|\| 'smtp.mailgun.org'` |
| **Actual sending** | ❌ No Mailgun/SMTP send implementation; pool accounts are only provisioned and stored |

---

## 9. Incomplete / TODO

| Item | File | Notes |
|------|------|-------|
| Send email via UserEmailAccount | N/A | No route that picks an account and sends via Gmail/Outlook/SMTP |
| `POST /api/leads/:id/send-email` | `components/SendEmailModal.js` | TODO; currently uses campaigns as workaround |
| `/profile` redirect | OAuth, Stripe | Callbacks go to `/profile` but page is `/settings` |
| `/api/users/profile` backend | `app/api/users/profile/route.js` | TODO comment: backend needs this endpoint |
| Email Infrastructure Sentinel | `agents/email-infrastructure-sentinel/` | Worker, warmup, health — requires Redis + BullMQ; may not run in production |
| Lead Hunter send_email tool | Docs | `VERIFICATION_AND_DASHBOARD_GUIDE.md` references SendGrid, not user/pool accounts |

---

## 10. Summary

| Area | Completion |
|------|------------|
| Prisma models | ✅ 100% |
| Email-accounts API | ✅ 100% |
| Email-pool API | ✅ 100% |
| Stripe webhook ($49 pool) | ✅ 100% |
| Google OAuth | ✅ 100% |
| Microsoft OAuth | ✅ 100% |
| Pool provisioning (Mailgun SMTP config) | ✅ Config only |
| Actual email sending | ❌ 0% |
| Frontend UI | ✅ 100% (modulo `/profile` vs `/settings`) |

**Missing:** A send-email service that selects from `UserEmailAccount` (free or pool) and sends via Gmail API, Graph API, or SMTP (Mailgun/nodemailer).
