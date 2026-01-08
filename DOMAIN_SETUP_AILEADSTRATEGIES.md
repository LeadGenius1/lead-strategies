# Domain Setup: aileadstrategies.com

## Quick Setup Instructions

### Step 1: Add Domain to Railway

1. Go to your Railway project dashboard
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `aileadstrategies.com`
5. Railway will provide you with a CNAME target (e.g., `q8hj95mm.up.railway.app`)

### Step 2: Configure DNS at Your Domain Registrar

1. Log into your domain registrar (where you purchased `aileadstrategies.com`)
2. Navigate to DNS Management
3. Add/Update the following records:

#### For Root Domain (aileadstrategies.com):
```
Type: CNAME
Name: @ (or leave blank, or use root domain)
Value: q8hj95mm.up.railway.app
TTL: 3600 (or Auto)
```

#### For WWW Subdomain (www.aileadstrategies.com):
```
Type: CNAME
Name: www
Value: q8hj95mm.up.railway.app
TTL: 3600 (or Auto)
```

**Note**: Some registrars don't support CNAME for root domain. If that's the case:
- Use an A record pointing to Railway's IP (check Railway dashboard for IP)
- Or use a URL redirect from root to www

### Step 3: Verify DNS Propagation

Wait 5-60 minutes for DNS propagation, then verify:

```bash
# Check DNS resolution
nslookup aileadstrategies.com
dig aileadstrategies.com

# Should resolve to Railway's CNAME target
```

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

### Step 4: SSL Certificate

Railway automatically provisions SSL certificates via Let's Encrypt once DNS is configured correctly. This usually takes 5-10 minutes after DNS propagation.

### Step 5: Update Environment Variables

In Railway, set:
```
NEXT_PUBLIC_URL=https://aileadstrategies.com
```

### Step 6: Test

1. Visit `https://aileadstrategies.com`
2. Should load the main landing page
3. Test signup/login flows
4. Verify all routes work correctly

## Troubleshooting

### Domain Not Resolving
- Check DNS records are correct
- Wait longer for propagation (can take up to 48 hours)
- Verify CNAME target matches Railway's provided value

### SSL Certificate Issues
- Ensure DNS is fully propagated
- Check Railway logs for SSL errors
- Railway will retry automatically

### 404 Errors
- Verify Railway service is running
- Check domain is correctly linked to the service
- Verify NEXT_PUBLIC_URL environment variable

## Current Railway Domain Mapping

Based on previous configuration:
- **aileadstrategies.com** → `q8hj95mm.up.railway.app`

## Verification Commands

```bash
# Check Railway status
railway status

# Check domain configuration
railway domains

# View logs
railway logs

# Test health endpoint
curl https://aileadstrategies.com/api/health
```
