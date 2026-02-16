# Prisma Schema Push — Database Migration

The User Email Delivery System adds `UserEmailAccount` and `EmailPoolSubscription` tables. The schema must be pushed to the production database.

## Why `railway run npx prisma db push` Failed

Railway's `DATABASE_URL` uses `postgres-b5y3.railway.internal` — a private hostname only reachable from within Railway's network. Running `railway run` locally injects env vars but the database is not reachable from your machine.

## Option A: Add Migration to Deploy (Recommended)

Add a build/deploy step that runs `prisma db push` when the app deploys. The app runs inside Railway's network and can reach the database.

**Example** (in `package.json` or `railway.toml`):
```json
"scripts": {
  "postinstall": "prisma generate --schema=backend/prisma/schema.prisma",
  "prebuild": "prisma db push --schema=backend/prisma/schema.prisma"
}
```

Or add to your deploy script/Procfile if you use one.

## Option B: Use Public Database URL

1. In Railway Dashboard → Postgres-B5Y3 service → Variables
2. Check if there's a `DATABASE_PUBLIC_URL` or `POSTGRES_PUBLIC_URL`
3. If not, Railway Postgres may expose a public URL in Connect → Connection
4. Temporarily set `DATABASE_URL` to the public URL
5. Run: `cd backend && npx prisma db push`
6. Restore the internal `DATABASE_URL`

## Option C: Supabase (if using Supabase)

1. Go to Supabase Dashboard → Settings → Database → Network
2. Add your current IP (or `0.0.0.0/0` temporarily for testing)
3. Get the connection string from Supabase
4. Run: `DATABASE_URL="<supabase-url>" npx prisma db push --schema=backend/prisma/schema.prisma`
5. Remove `0.0.0.0/0` after

## Verify Tables Exist

After a successful push, you should see:
- `UserEmailAccount`
- `EmailPoolSubscription`
- Enums: `EmailProvider`, `AccountStatus`, `EmailTier`, `PoolSubscriptionStatus`
