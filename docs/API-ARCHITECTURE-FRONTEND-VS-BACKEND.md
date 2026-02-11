# API Architecture: api.aileadstrategies.com = Frontend

## STEP 1: What the signup form actually calls

- **Signup form** (app/(auth)/signup/page.js) calls `signup()` from **lib/auth.js**.
- **lib/auth.js** does: `api.post('/api/v1/auth/signup', userData)`.
- **api** (lib/api.js) has `baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com'`.
- So the **URL** the browser POSTs to is: **`https://api.aileadstrategies.com/api/v1/auth/signup`**.

The app does **not** call `/api/auth/register`; it calls **`/api/v1/auth/signup`**.

---

## STEP 2: What routes exist on the frontend

| Path | Exists? | Purpose |
|------|--------|--------|
| **POST /api/v1/auth/signup** | ✅ Yes | Email signup – issues JWT (app/api/v1/auth/signup/route.js) |
| **GET /api/v1/auth/me** | ✅ Yes | Return user from JWT (app/api/v1/auth/me/route.js) |
| **GET /api/auth/oauth/google** | ✅ Yes | Redirect to Google OAuth |
| **GET /api/auth/oauth/callback** | ✅ Yes | Handle Google callback, issue JWT |
| **POST /api/auth/login** | ❌ No | Login uses api.post('/api/v1/auth/login') → same host; no Next.js route |
| **POST /api/auth/register** | ❌ No | App uses /api/v1/auth/signup, not /register |

If you still see "Network Error" on signup after deploy, check that the **frontend** deploy includes **app/api/v1/auth/signup/route.js** and that **JWT_SECRET** (or NEXTAUTH_SECRET) is set so the route can issue a token.

---

## STEP 3: Option A vs B

- **Option A (current):** All auth that hits api.aileadstrategies.com is handled by **Next.js API routes** (OAuth callback, signup, auth/me). No backend call for those.
- **Option B:** Set **NEXT_PUBLIC_API_URL** to the **Express backend** (e.g. https://api.leadsite.ai) so signup/login/me go to the backend. That only works if the backend is reachable from the browser (CORS, DNS) and has those routes.

Right now we're using **Option A** for auth because api.aileadstrategies.com is the frontend.

---

## CRITICAL QUESTION: All API via frontend vs fix URL to backend?

**Current setup:** api.aileadstrategies.com serves the **frontend** (Next.js). So:

- **If you keep this:** Every API endpoint the app calls (auth, dashboard, prospects, etc.) that uses `NEXT_PUBLIC_API_URL` will hit the **frontend**. So you need a **Next.js handler** for each (e.g. /api/v1/auth/signup, /api/v1/auth/me, /api/auth/oauth/callback). We’ve added these for **auth** (signup, me, OAuth). Other endpoints (e.g. /api/v1/prospects, /api/v1/dashboard) would also need Next.js routes or a **proxy** to a real backend.
- **If you change it:** Set **NEXT_PUBLIC_API_URL** to the **real backend** (e.g. https://api.leadsite.ai). Then signup/login/me/prospects etc. all go to Express. You’d need to **remove or not rely on** the Next.js auth routes we added (or use them only as fallback). The backend must be reachable from the browser and CORS must allow the frontend origin.

So:

- **All API through frontend:** Intentional if you want one public host (api.aileadstrategies.com) and you implement or proxy every endpoint in Next.js.
- **Fix URL to backend:** Use one backend URL (e.g. api.leadsite.ai) for all API calls and implement everything on the backend; frontend only does UI and calls that URL.

We’ve been fixing the “Network Error” by **adding frontend handlers** (signup, me, OAuth) so that with api.aileadstrategies.com = frontend, auth works without changing the API URL.
