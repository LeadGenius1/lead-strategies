# Railway Postgres Connectivity Fix

**Error:** `PrismaClientInitializationError: Can't reach database server at postgres-b5y3.railway.internal:5432`

Auth routes (login/signup) read/write users → Prisma needs DB → connection fails → 500 errors.

---

## 1. Confirm Postgres is running

- **Railway Dashboard** → Postgres service
- Status must be **Healthy/Running**
- If paused, sleeping, failed, or restarting, the app will never connect

---

## 2. Backend and Postgres in same project

`*.railway.internal` only works inside Railway’s private network.

**Common problems:**

- Backend in a different Railway project than the DB
- Manually copied `DATABASE_URL` between projects
- Postgres recreated and internal host changed

**Fix:** Use **Add Variable / Reference** from the Postgres service instead of pasting a string.

1. **Backend** service → **Variables**
2. Add or edit `DATABASE_URL`:
   - Click **Reference** (or "Add Variable")
   - Choose **Postgres** → `DATABASE_URL`  
     *(Use your Postgres service name if different)*
3. This keeps the URL in sync with the current Postgres instance

---

## 3. Use `DATABASE_PUBLIC_URL` when internal fails

If internal networking still fails, use the public connection string:

### Enable public networking on Postgres

1. **Postgres** service → **Settings** → **Networking**
2. Enable **Public network TCP proxy**
3. `DATABASE_PUBLIC_URL` will appear in Variables

### Add `DATABASE_PUBLIC_URL` to Backend

1. **Backend** service → **Variables**
2. Add variable:
   - **Name:** `DATABASE_PUBLIC_URL`
   - **Value:** `${{Postgres.DATABASE_PUBLIC_URL}}`
3. Redeploy

The startup script swaps to `DATABASE_PUBLIC_URL` when `DATABASE_URL` uses `railway.internal`, so Prisma can connect.

---

## 4. Local/dev: don’t use `railway.internal`

`postgres-*.railway.internal` does not resolve outside Railway.

- Use the **public** Railway connection string in `.env` for local dev
- Or run everything inside Railway (`railway run`)

---

## Startup check

Backend logs the DB host at startup:

```
Database host: postgres-b5y3.railway.internal   (internal)
Database host: roundhouse.proxy.rlwy.net        (public)
```

If you see `railway.internal` and still get connection errors, add `DATABASE_PUBLIC_URL` (step 3).
