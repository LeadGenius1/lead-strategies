# 🚀 QUICK START - LeadSite.AI (Tier 1)

## ⚡ 5-Minute Setup Guide

This guide will get you up and running with LeadSite.AI frontend in under 5 minutes.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for version control)

---

## 🎯 Step 1: Initialize Project

```bash
# Create Next.js project
npx create-next-app@latest leadsite-ai-frontend

# When prompted, choose:
# ✅ TypeScript? No
# ✅ ESLint? Yes
# ✅ Tailwind CSS? Yes
# ✅ `src/` directory? No
# ✅ App Router? Yes
# ✅ Import alias? No

# Navigate to project
cd leadsite-ai-frontend
```

---

## 📦 Step 2: Install Dependencies

```bash
# Install required packages
npm install axios lucide-react

# Verify installation
npm list axios lucide-react
```

---

## ⚙️ Step 3: Configure Environment

Create `.env.local` file in the root:

```bash
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
```

---

## 🏗️ Step 4: Project Structure

Create the folder structure:

```bash
# Create directories
mkdir -p components/Dashboard components/Campaign
mkdir -p lib
mkdir -p app/dashboard/campaigns/new
mkdir -p app/dashboard/campaigns/[id]/edit
mkdir -p app/dashboard/leads/import
mkdir -p app/dashboard/leads/[id]
mkdir -p app/dashboard/analytics
mkdir -p app/dashboard/settings
mkdir -p app/login
mkdir -p app/signup
```

---

## 📝 Step 5: Copy Implementation Files

Follow the complete implementation guide in `LEADSITE-AI-TIER1-IMPLEMENTATION.md`:

1. **Core Files** (copy in order):
   - `package.json` - Update dependencies
   - `tailwind.config.js` - Tailwind configuration
   - `app/globals.css` - Global styles
   - `lib/api.js` - API client
   - `lib/auth.js` - Auth helpers
   - `lib/hooks.js` - Custom hooks

2. **Components**:
   - `components/Navigation.js`
   - `components/Dashboard/StatsCard.js`
   - `components/Dashboard/CampaignList.js`
   - `components/Dashboard/LeadTable.js`
   - `components/Dashboard/QuickActions.js`

3. **Pages**:
   - `app/layout.js`
   - `app/page.js` (landing page)
   - `app/login/page.js`
   - `app/signup/page.js`
   - `app/dashboard/page.js`

---

## 🚀 Step 6: Run Development Server

```bash
# Start dev server
npm run dev

# Open browser
# http://localhost:3000
```

---

## ✅ Step 7: Verify Setup

Check these URLs work:
- ✅ `http://localhost:3000` - Landing page
- ✅ `http://localhost:3000/login` - Login page
- ✅ `http://localhost:3000/signup` - Signup page
- ✅ `http://localhost:3000/dashboard` - Dashboard (requires auth)

---

## 🔧 Step 8: Connect to Backend

Ensure your backend API is running at:
- **API URL:** `https://api.leadsite.ai`
- **API Version:** `v1`

Test connection:
```bash
curl https://api.leadsite.ai/api/v1/health
```

---

## 📦 Step 9: Build for Production

```bash
# Build the project
npm run build

# Test production build locally
npm start
```

---

## 🌐 Step 10: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.leadsite.ai
# NEXT_PUBLIC_API_VERSION=v1
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### API Connection Errors
- Check `.env.local` has correct API URL
- Verify backend is running
- Check CORS settings on backend

---

## 📚 Next Steps

1. ✅ Complete setup (you are here)
2. 📖 Read `LEADSITE-AI-TIER1-IMPLEMENTATION.md` for full details
3. 🎨 Customize styling and branding
4. 🔌 Connect to backend API
5. 🧪 Test all features
6. 🚀 Deploy to production

---

## 🆘 Need Help?

- Check `LEADSITE-AI-TIER1-IMPLEMENTATION.md` for detailed implementation
- Review Next.js docs: https://nextjs.org/docs
- Check Tailwind CSS docs: https://tailwindcss.com/docs

---

**Ready to build?** Follow `LEADSITE-AI-TIER1-IMPLEMENTATION.md` for complete code! 🚀



