# Railway Environment Variables Setup

## 🔧 Required Environment Variables

To fix the "backend not deployed" error, you need to set the correct environment variables in Railway.

### Frontend Service Environment Variables

Go to your **Frontend service** in Railway dashboard → **Variables** tab and add:

```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
```

**OR** if your backend is at a different URL:

```env
NEXT_PUBLIC_API_URL=https://api.aileadstrategies.com
```

### How to Set Environment Variables in Railway:

1. Go to Railway dashboard
2. Select your **Frontend service** (the one with `aileadstrategies.com`)
3. Click on the **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://api.leadsite.ai` (or your actual backend URL)
6. Click **"Add"**
7. Railway will automatically redeploy with the new variable

### Verify Backend URL

Check your **Backend service** in Railway to confirm the correct URL:
- Look for the domain/URL shown in the backend service details
- It should be something like `api.leadsite.ai` or `api.aileadstrategies.com`

### After Setting Variables:

1. Railway will automatically trigger a new deployment
2. Wait for the deployment to complete (check the Deployments tab)
3. The frontend will now connect to the correct backend URL

---

## 🐛 Troubleshooting

### If you still see errors:

1. **Check Backend Status:**
   - Go to Backend service in Railway
   - Verify it shows "Online" and "Active"
   - Check the logs for any errors

2. **Verify Environment Variable:**
   - In Railway Frontend service → Variables tab
   - Confirm `NEXT_PUBLIC_API_URL` is set correctly
   - Make sure there are no typos or extra spaces

3. **Check Frontend Logs:**
   - In Railway Frontend service → Logs tab
   - Look for API connection errors
   - Verify it's trying to connect to the correct URL

4. **CORS Issues:**
   - If you see CORS errors, make sure your backend allows requests from your frontend domain
   - Backend needs to allow: `https://aileadstrategies.com` (or your frontend domain)

---

## 📝 Current Configuration

Based on Railway dashboard:
- **Frontend:** `aileadstrategies.com` (or `superb-possibility` service)
- **Backend:** `api.leadsite.ai` (shown as online and active)

**Required Variable:**
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
```
