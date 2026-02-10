# Critical Architecture & Incident Report

## Immediate fix (Railway – 30 seconds)

**In Railway:**

1. Go to: **Railway → ai-lead-strategies → backend → Settings → Deploy**
2. Find: **Custom Start Command** (currently shows `node start.js`)
3. Change to: **`npm start`**
4. Click: **Save**
5. Go to: **Deployments → Click "Redeploy"**

---

## Why this fixes the OAuth 405

The OAuth 405 (and “backend” returning frontend) was **not a code bug**. It was an infrastructure misconfiguration.

- **Wrong:** Backend service was using start command `node start.js` → runs **Next.js** (repo root).
- **Correct:** Backend service must use **`npm start`** → runs **Express** from `backend/` (when Root Directory is `backend`) or from the standalone backend repo.

So `api.aileadstrategies.com` was serving the frontend app instead of the Express API. Changing the start command to `npm start` (and ensuring Root Directory is `backend` if using the monorepo) fixes it.

**No code changes are required for this fix.**

---

## Architecture guardrails (do not violate)

- **Never** add OAuth handlers to the frontend (`app/api/auth/*` for login/OAuth callback).
- **Never** add `/api/v1/*` routes to the frontend to “replace” the backend.
- The frontend **calls** the backend; it does **not** replace it.
- **api.aileadstrategies.com** = **Express backend only**, not the Next.js frontend.

---

## Repos

| Repo | Purpose |
|------|--------|
| **lead-strategies-backend** (LeadGenius1) | Standalone Express API. No Next.js. |
| **lead-strategies-build** | Monorepo: Next.js at root, Express in `backend/`. |

---

## Backend service configuration (Railway)

For the service that serves **api.aileadstrategies.com**:

- **If using monorepo (lead-strategies-build):**
  - **Root Directory:** `backend`
  - **Start Command:** `npm start` (or `node src/index.js`)
- **If using standalone backend repo (lead-strategies-backend):**
  - **Root Directory:** (empty)
  - **Start Command:** `npm start` (uses that repo’s `package.json` start script)

Never use `node start.js` for the backend service—that is the Next.js entry point at the monorepo root.

---

*Last updated: Feb 2025 – Post OAuth 405 infrastructure fix.*
