# /profile → /settings Redirect Fix — Exact Changes

## 1. Files with /profile references (email OAuth / Stripe pool)

| File | Line | Current | Change |
|------|------|---------|--------|
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 18 | `/profile?error=oauth_${error}` | `/settings?error=oauth_${error}` |
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 23 | `/profile?error=oauth_missing` | `/settings?error=oauth_missing` |
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 31 | `/profile?error=oauth_invalid_state` | `/settings?error=oauth_invalid_state` |
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 39 | `/profile?error=oauth_no_email` | `/settings?error=oauth_no_email` |
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 74 | `/profile?email=connected` | `/settings?email=connected` |
| `app/api/user/email-accounts/oauth/google/callback/route.ts` | 80 | `/profile?error=oauth_failed` | `/settings?error=oauth_failed` |
| `app/api/user/email-accounts/oauth/google/route.ts` | 12 | `callbackUrl=/profile` | `callbackUrl=/settings` |
| `app/api/user/email-accounts/oauth/google/route.ts` | 40 | `/profile?error=oauth_failed` | `/settings?error=oauth_failed` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 17 | `/profile?error=oauth_${error}` | `/settings?error=oauth_${error}` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 22 | `/profile?error=oauth_missing` | `/settings?error=oauth_missing` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 30 | `/profile?error=oauth_invalid_state` | `/settings?error=oauth_invalid_state` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 37 | `/profile?error=oauth_no_email` | `/settings?error=oauth_no_email` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 71 | `/profile?email=connected` | `/settings?email=connected` |
| `app/api/user/email-accounts/oauth/microsoft/callback/route.ts` | 77 | `/profile?error=oauth_failed` | `/settings?error=oauth_failed` |
| `app/api/user/email-accounts/oauth/microsoft/route.ts` | 12 | `callbackUrl=/profile` | `callbackUrl=/settings` |
| `app/api/user/email-accounts/oauth/microsoft/route.ts` | 39 | `/profile?error=oauth_failed` | `/settings?error=oauth_failed` |
| `app/api/user/email-pool/subscribe/route.ts` | 65 | `${appUrl}/profile?pool=success` | `${appUrl}/settings?pool=success` |
| `app/api/user/email-pool/subscribe/route.ts` | 66 | `${appUrl}/profile?pool=canceled` | `${appUrl}/settings?pool=canceled` |

**Total: 5 files, 18 changes**

---

## 2. Exact diffs (before saving)

### File 1: `app/api/user/email-accounts/oauth/google/callback/route.ts`

```diff
-        new URL(`/profile?error=oauth_${error}`, req.url)
+        new URL(`/settings?error=oauth_${error}`, req.url)
-      return NextResponse.redirect(new URL('/profile?error=oauth_missing', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_missing', req.url));
-      return NextResponse.redirect(new URL('/profile?error=oauth_invalid_state', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_invalid_state', req.url));
-      return NextResponse.redirect(new URL('/profile?error=oauth_no_email', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_no_email', req.url));
-    const res = NextResponse.redirect(new URL('/profile?email=connected', req.url));
+    const res = NextResponse.redirect(new URL('/settings?email=connected', req.url));
-    return NextResponse.redirect(new URL('/profile?error=oauth_failed', req.url));
+    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
```

### File 2: `app/api/user/email-accounts/oauth/google/route.ts`

```diff
-        new URL('/login?error=Unauthorized&callbackUrl=/profile', req.url)
+        new URL('/login?error=Unauthorized&callbackUrl=/settings', req.url)
-      new URL('/profile?error=oauth_failed', req.url)
+      new URL('/settings?error=oauth_failed', req.url)
```

### File 3: `app/api/user/email-accounts/oauth/microsoft/callback/route.ts`

```diff
-        new URL(`/profile?error=oauth_${error}`, req.url)
+        new URL(`/settings?error=oauth_${error}`, req.url)
-      return NextResponse.redirect(new URL('/profile?error=oauth_missing', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_missing', req.url));
-      return NextResponse.redirect(new URL('/profile?error=oauth_invalid_state', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_invalid_state', req.url));
-      return NextResponse.redirect(new URL('/profile?error=oauth_no_email', req.url));
+      return NextResponse.redirect(new URL('/settings?error=oauth_no_email', req.url));
-    const res = NextResponse.redirect(new URL('/profile?email=connected', req.url));
+    const res = NextResponse.redirect(new URL('/settings?email=connected', req.url));
-    return NextResponse.redirect(new URL('/profile?error=oauth_failed', req.url));
+    return NextResponse.redirect(new URL('/settings?error=oauth_failed', req.url));
```

### File 4: `app/api/user/email-accounts/oauth/microsoft/route.ts`

```diff
-        new URL('/login?error=Unauthorized&callbackUrl=/profile', req.url)
+        new URL('/login?error=Unauthorized&callbackUrl=/settings', req.url)
-      new URL('/profile?error=oauth_failed', req.url)
+      new URL('/settings?error=oauth_failed', req.url)
```

### File 5: `app/api/user/email-pool/subscribe/route.ts`

```diff
-      success_url: `${appUrl}/profile?pool=success`,
-      cancel_url: `${appUrl}/profile?pool=canceled`,
+      success_url: `${appUrl}/settings?pool=success`,
+      cancel_url: `${appUrl}/settings?pool=canceled`,
```

---

## 3. Note on init routes

The init routes (`google/route.ts`, `microsoft/route.ts`) redirect to `/profile` when:
- User is unauthorized → `callbackUrl=/profile` (where to go after login)
- OAuth init fails → `/profile?error=oauth_failed`

These are email-OAuth-specific and should redirect to `/settings` so users land on the email account UI.
