# AI Lead Strategies Platform - Verification Prompt

**Last Updated:** February 12, 2026  
**Purpose:** Post-deployment verification checklist for all platform fixes

---

## Prerequisites

- All code changes committed and pushed
- Backend dependencies installed (`cd backend && npm install`)
- DATABASE_URL environment variable set (Railway public URL)
- Frontend running on http://localhost:3000
- Backend running on http://localhost:3001

---

## Step 1: Run Prisma Migration

### First time (creates migration files):
```bash
cd backend
npx prisma migrate dev --name add_videosite_and_channel_models
npx prisma generate
```

### Production / subsequent runs:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

> **Note:** If schema already matches DB, `migrate deploy` reports "No pending migrations" — this is expected.

---

## Step 2: Start Backend & Check Logs

```bash
cd backend
npm start
```

### ✅ Success indicators:
- "Server running on port 3001"
- "Database connected"
- "Redis connected" OR "Using memory store for rate limiting"

### ❌ Should NOT see:
- "RedisStore is not a constructor"
- "Unknown arg" or Prisma errors
- "Cannot find module"

---

## Step 3: Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected: `{ "status": "ok" }` or similar JSON response.

---

## Step 4: Test Authentication

### A. Without token (expect 401):
```bash
curl -s -w "\nStatus: %{http_code}" http://localhost:3001/api/auth/me
```

**Expected response:**
```json
{ "success": false, "error": "Not authenticated", "data": { "user": null } }
Status: 401
```

### B. Login via Google OAuth:
1. Open http://localhost:3000
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Copy token from cookies/localStorage

### C. With token:
```bash
TOKEN="your_jwt_token_here"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
```

**Expected response:**
```json
{ "success": true, "data": { "user": { "id": "...", "email": "...", "name": "..." } } }
```

### D. Verify session persists:
- Refresh the page in browser
- User should remain logged in

---

## Step 5: Test VideoSite View Tracking

### A. Upload a video via UI and note the VIDEO_ID

### B. Track a view (requires auth):
```bash
VIDEO_ID="your_video_id"
TOKEN="your_jwt_token"

curl -X POST http://localhost:3001/api/v1/videosite/videos/$VIDEO_ID/view \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"watchTime": 60, "sessionId": "test-session-123"}'
```

### C. Verify in database:
```bash
cd backend
npx prisma studio
# Check VideoView table for new record with videoId, watchTime, sessionId
```

---

## Step 6: Test Channel Creation

> **Note:** Requires user to have `inbox` feature enabled.

### Create channel:
```bash
TOKEN="your_jwt_token"

curl -X POST http://localhost:3001/api/v1/channels/connect \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email",
    "name": "Test Email Channel",
    "credentials": {},
    "settings": { "enabled": true }
  }'
```

### List channels:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/channels
```

---

## Step 7: Test Rate Limiting

```bash
# Hit endpoint 150 times to trigger rate limit (default: 100 requests/15 min)
for i in {1..150}; do 
  curl -s -o /dev/null -w "%{http_code} " http://localhost:3001/api/auth/me
done
```

After ~100 requests, should start seeing `429` responses.

---

## Quick Verification Scripts

### Bash (Linux/macOS/WSL):

Save as `scripts/verify.sh` and run:

```bash
#!/bin/bash
BACKEND="http://localhost:3001"

echo "=========================================="
echo "AI Lead Strategies - Verification Script"
echo "=========================================="

echo -e "\n1. Health check..."
curl -s $BACKEND/health

echo -e "\n\n2. Auth /me (no token - expect 401)..."
curl -s -w "\nStatus: %{http_code}" $BACKEND/api/auth/me

echo -e "\n\n3. Auth /me (with token)..."
if [ -n "$TOKEN" ]; then
  curl -s -H "Authorization: Bearer $TOKEN" $BACKEND/api/auth/me
else
  echo "⚠️  Set TOKEN env var first: export TOKEN=your_jwt"
fi

echo -e "\n\n4. Rate limit test (150 requests)..."
echo -n "Response codes: "
for i in {1..150}; do 
  curl -s -o /dev/null -w "%{http_code} " $BACKEND/api/auth/me
  if [ $((i % 50)) -eq 0 ]; then echo ""; fi
done

echo -e "\n\n=========================================="
echo "Verification complete!"
echo "=========================================="
```

Usage:
```bash
chmod +x scripts/verify.sh
./scripts/verify.sh

# With authentication:
export TOKEN="your_jwt_token"
./scripts/verify.sh
```

### PowerShell (Windows):

Save as `scripts/verify.ps1` and run:

```powershell
$backend = "http://localhost:3001"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AI Lead Strategies - Verification Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n1. Health check..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$backend/health" | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Write-Host "`n2. Auth /me (no token - expect 401)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod "$backend/api/auth/me" | ConvertTo-Json
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Green
}

Write-Host "`n3. Auth /me (with token)..." -ForegroundColor Yellow
if ($env:TOKEN) {
    $headers = @{ "Authorization" = "Bearer $env:TOKEN" }
    try {
        Invoke-RestMethod "$backend/api/auth/me" -Headers $headers | ConvertTo-Json
    } catch {
        Write-Host "❌ Auth failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Set TOKEN env var first: `$env:TOKEN = 'your_jwt'" -ForegroundColor Yellow
}

Write-Host "`n4. Rate limit test (150 requests)..." -ForegroundColor Yellow
$codes = @()
1..150 | ForEach-Object {
    try {
        $response = Invoke-WebRequest "$backend/api/auth/me" -Method Get -UseBasicParsing
        $codes += $response.StatusCode
    } catch {
        $codes += $_.Exception.Response.StatusCode.Value__
    }
}
$grouped = $codes | Group-Object | Sort-Object Name
Write-Host "Results:" -ForegroundColor Green
$grouped | ForEach-Object { Write-Host "  $($_.Name): $($_.Count) requests" }

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Verification complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
```

Usage:
```powershell
.\scripts\verify.ps1

# With authentication:
$env:TOKEN = "your_jwt_token"
.\scripts\verify.ps1
```

---

## Verification Checklist

### Infrastructure
- [ ] Migration applied successfully
- [ ] Backend starts without errors
- [ ] Health endpoint responds
- [ ] No Prisma/Redis errors in logs

### Authentication
- [ ] `/api/auth/me` returns `{ success: false, ... }` without token (401)
- [ ] Google OAuth login completes successfully
- [ ] `/api/auth/me` returns `{ success: true, data: { user: {...} } }` with token
- [ ] Session persists across page refresh

### VideoSite
- [ ] Video upload works
- [ ] `/api/v1/videosite/videos/:id/view` creates VideoView record
- [ ] watchTime and sessionId stored correctly

### Channels
- [ ] `/api/v1/channels/connect` creates channel (requires inbox feature)
- [ ] `/api/v1/channels` lists user's channels

### Rate Limiting
- [ ] No "RedisStore is not a constructor" error in logs
- [ ] Rate limiting active (429 responses after limit exceeded)

---

## Troubleshooting

### Migration fails with shadow database error
```bash
# Use deploy instead
npx prisma migrate deploy
```

### "No pending migrations" message
This is normal if schema already matches database.

### Auth not working
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token format (should be: Bearer eyJhbG...)
```

### VideoView/Channel queries fail
```bash
# Regenerate Prisma client
npx prisma generate

# Restart server
npm start
```

### Rate limiting not working
Check logs for Redis connection status. If Redis unavailable, falls back to memory store (still works, but not distributed).

---

## Platform Status After Verification

| Platform | Expected % | Remaining |
|----------|------------|-----------|
| VideoSite.AI | 95% | Stripe Connect for payouts |
| LeadSite.IO | 90% | Publishing verification |
| LeadSite.AI | 85% | Email pool testing |
| ClientContact.IO | 75% | Social OAuth integrations |
| UltraLead.AI | 85% | AI agent completion |

---

## Next Steps

After verification passes:

1. **Deploy to Railway** - Push to main branch
2. **Run production migration** - `npx prisma migrate deploy`
3. **Verify production** - Run verification against production URLs
4. **Continue with remaining features** - See `docs/REMAINING_WORK.md`
