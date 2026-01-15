# Railway Deployment Fix - Environment Variable Issue

## 🔴 Problem Identified

From Railway logs, the frontend is connecting to:
- **Current:** `https://api.aileadstrategies.com`
- **Should be:** `https://api.leadsite.ai` (based on Railway dashboard showing backend at `api.leadsite.ai`)

## ✅ Solution

### Step 1: Set Environment Variable in Railway

1. Go to Railway Dashboard
2. Select your **Frontend service** (`aileadstrategies.com` or `superb-possibility`)
3. Click **"Variables"** tab
4. Look for `NEXT_PUBLIC_API_URL` - if it exists, edit it. If not, click **"+ New Variable"**
5. Set:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.leadsite.ai`
6. Click **"Add"** or **"Update"**
7. Railway will automatically redeploy

### Step 2: Verify Backend URL

Check your **Backend service** in Railway:
- The domain should show `api.leadsite.ai`
- Status should be "Online" and "Active"

### Step 3: Check Deployment Logs

After Railway redeploys, check the logs:
- Look for: `Signup request to backend: https://api.leadsite.ai`
- Should NOT see: `https://api.aileadstrategies.com`

---

## 📝 Additional Notes

The backend IS deployed and responding (you got a 400 "User already exists" response), so the backend is working. The issue is just that the frontend is pointing to the wrong URL.

Once you set `NEXT_PUBLIC_API_URL=https://api.leadsite.ai` in Railway, the frontend will connect to the correct backend.

---

## ⚠️ Next.js Standalone Warning

The logs also show:
```
⚠ "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.
```

If you're using `output: standalone` in `next.config.js`, update Railway's start command to:
```
node .next/standalone/server.js
```

However, if you're NOT using standalone output, you can ignore this warning - it's just Next.js being cautious.
