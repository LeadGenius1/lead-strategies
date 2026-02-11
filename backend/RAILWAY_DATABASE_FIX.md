# Railway Database Connection Fix

If the backend fails with "Can't reach database server at postgres-*.railway.internal", add the **public** database URL:

## Steps

1. **Railway Dashboard** → **Postgres-B5Y3** service → **Variables** (or **Connect**)
2. Copy **`DATABASE_PUBLIC_URL`** (or the public connection string shown)
3. **Backend** service → **Variables** → Add:
   - **Name:** `DATABASE_PUBLIC_URL`
   - **Value:** *(paste the public URL from step 2)*
4. **Redeploy** the backend service

The startup script (`start-railway.sh`) prefers `DATABASE_PUBLIC_URL` when set, fixing internal network connectivity issues.
