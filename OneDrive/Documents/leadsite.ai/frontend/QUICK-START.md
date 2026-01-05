# ⚡ QUICK START GUIDE

## 🚀 Get Your Frontend Live in 5 Minutes!

### Step 1: Extract & Navigate

```bash
# Extract the ZIP file
# Navigate to the folder
cd ai-lead-strategies-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Wait ~1 minute for installation**

### Step 3: Deploy to Vercel

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy!
vercel --prod
```

### Step 4: Configure Domain

When prompted:
- Set up and deploy: **YES**
- Which scope: **aileadstrategies-projects** (or your account)
- Link to existing project: **YES** → Select `lead-strategies`
- Override settings: **NO**

**Done!** Your site is live! 🎉

---

## 🌐 Access Your Site

- **Production URL:** https://www.leadsite.ai
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## ⚙️ Add Environment Variables

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:

```
NEXT_PUBLIC_API_URL = https://api.leadsite.ai
NEXT_PUBLIC_STRIPE_KEY = pk_live_your_key_here
```

3. **Redeploy** after adding variables:

```bash
vercel --prod
```

---

## ✅ Verify Everything Works

Visit these pages:

- ✅ Homepage: https://www.leadsite.ai
- ✅ Signup: https://www.leadsite.ai/signup
- ✅ Login: https://www.leadsite.ai/login
- ✅ Dashboard (after login): https://www.leadsite.ai/dashboard/tackle-io

---

## 🎨 What You Got

**Pages:** 9 complete pages
**Style:** Exact Aether UI (space background, animations, glassmorphic design)
**Responsive:** Mobile, tablet, desktop
**Ready for:** Railway API integration + Stripe payments

---

## 🔗 Next Steps

### 1. Connect Railway Backend

Create `lib/api.js` and add API calls to your Railway backend.

### 2. Set Up Stripe

1. Create 5 products in Stripe Dashboard
2. Add Stripe publishable key to Vercel
3. Implement checkout flow

### 3. OAuth Setup

Configure Google, Microsoft, and Twitter OAuth in your project.

---

## 📚 Full Documentation

- **README.md** - Complete project documentation
- **DEPLOYMENT.md** - Detailed deployment guide
- **.env.example** - Environment variable template

---

## 🆘 Need Help?

**Common Issues:**

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Styles not showing?**
- Check if Tailwind CSS built correctly
- Clear browser cache
- Hard refresh (Ctrl + Shift + R)

**Environment variables not working?**
- Ensure they start with `NEXT_PUBLIC_`
- Redeploy after adding variables

---

**Your production-ready frontend is complete!** 🚀

All 5 platforms, all dashboards, all with the exact Aether UI style!
