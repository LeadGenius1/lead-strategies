# 🚀 DEPLOYMENT GUIDE

## Quick Deploy to Vercel (5 Minutes)

### Step 1: Prepare Files

```bash
cd ai-lead-strategies-frontend
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Deploy

```bash
npm install
vercel --prod
```

**That's it!** Your site will be live on Vercel.

---

## Configure Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: `ai-lead-strategies`
3. Go to: Settings → Environment Variables
4. Add:
   - `NEXT_PUBLIC_API_URL` = `https://api.leadsite.ai`
   - `NEXT_PUBLIC_STRIPE_KEY` = `your_stripe_key`

---

## Custom Domain Setup

### Connect www.leadsite.ai

1. In Vercel project → Settings → Domains
2. Add domain: `www.leadsite.ai`
3. Add DNS records (Vercel will provide):
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com

4. Wait 5-10 minutes for DNS propagation

---

## Post-Deployment Checklist

### 1. Verify All Pages Load

- [ ] Homepage: https://www.leadsite.ai
- [ ] Signup: https://www.leadsite.ai/signup
- [ ] Login: https://www.leadsite.ai/login
- [ ] All 5 Dashboards work
- [ ] Settings page loads

### 2. Test Features

- [ ] Navigation works on mobile
- [ ] Signup form validation
- [ ] Login form validation
- [ ] Tier selection on signup
- [ ] OAuth buttons display correctly

### 3. Performance Check

- [ ] Run Lighthouse audit
- [ ] Target scores:
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+

### 4. Connect to Railway Backend

Update these files to use real API:

**lib/api.js**
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### 5. Stripe Integration

1. Create products in Stripe Dashboard:
   - LeadSite.AI: $59/month
   - LeadSite.IO: $79/month
   - ClientContact.IO: $149/month
   - VideoSite.IO: $99/month
   - Tackle.IO: $499/month

2. Get Stripe publishable key
3. Update Vercel environment variable

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working

- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check Vercel dashboard → Settings → Environment Variables

### Tailwind Styles Not Applied

```bash
# Rebuild CSS
npm run build
```

---

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → Promote to Production

---

## Monitoring

### Set up Vercel Analytics

1. Go to project settings
2. Enable Analytics
3. View real-time traffic data

### Set up Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set
4. Test Railway API connection

---

**Your frontend is production-ready!** 🎉
