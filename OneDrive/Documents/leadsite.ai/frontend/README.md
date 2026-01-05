# AI Lead Strategies - Production Frontend

## 🚀 Complete Next.js 14 Application with Aether UI Style

### What's Included

**Pages:**
- ✅ Homepage - Platform showcase with all 5 tiers
- ✅ Signup - Tier selection with beautiful pricing cards
- ✅ Login - OAuth (Google, Microsoft, Twitter) + Email/Password
- ✅ LeadSite.AI Dashboard - Email lead generation interface
- ✅ LeadSite.IO Dashboard - Website builder management
- ✅ ClientContact.IO Dashboard - 22+ channel omnichannel marketing
- ✅ VideoSite.IO Dashboard - Video platform with creator payments
- ✅ Tackle.IO Dashboard - Full suite enterprise dashboard
- ✅ Settings - Account management

**Features:**
- ✅ Exact Aether UI style (space background, animated stars, glassmorphic design)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme throughout
- ✅ Gradient animated buttons
- ✅ Float animations
- ✅ Inter font
- ✅ Lucide icons
- ✅ Railway API integration ready
- ✅ Stripe integration ready

---

## 📦 Installation

### 1. Install Dependencies

```bash
cd ai-lead-strategies-frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_STRIPE_KEY=your_stripe_publishable_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Connect repository in Vercel dashboard
3. Deploy automatically

### Option 3: Manual Deployment

```bash
# Build
npm run build

# Deploy build folder
vercel deploy --prod
```

---

## 🔧 Environment Variables in Vercel

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Railway backend API | `https://api.leadsite.ai` |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe publishable key | `pk_live_...` |

**Add these in:** Vercel Project → Settings → Environment Variables

---

## 🎨 UI Style Details

**Design System:**
- Space background with animated stars
- Glassmorphic cards
- Gradient text animations
- Float animations
- Pulse glow effects
- Responsive grid system
- Dark theme (#000 black)
- Inter font family
- Lucide React icons

**Color Palette:**
- Indigo: `#6366f1` (Primary)
- Purple: `#a855f7` (Secondary)
- Cyan: `#06b6d4` (Accent)
- Pink: `#ec4899` (Highlight)
- Emerald: `#10b981` (Success)

---

## 🗂️ Project Structure

```
ai-lead-strategies-frontend/
├── app/
│   ├── layout.js                          # Root layout with Aether background
│   ├── page.js                            # Homepage
│   ├── globals.css                        # Aether animations & styles
│   ├── signup/
│   │   └── page.js                        # Signup with tier selection
│   ├── login/
│   │   └── page.js                        # Login with OAuth
│   ├── dashboard/
│   │   ├── leadsite-ai/page.js           # LeadSite.AI Dashboard
│   │   ├── leadsite-io/page.js           # LeadSite.IO Dashboard
│   │   ├── clientcontact-io/page.js      # ClientContact.IO Dashboard
│   │   ├── videosite-io/page.js          # VideoSite.IO Dashboard
│   │   └── tackle-io/page.js             # Tackle.IO Dashboard
│   └── settings/
│       └── page.js                        # Settings page
├── components/
│   └── Navigation.js                      # Shared navigation component
├── lib/                                    # Utility functions (add auth, API calls)
├── public/                                 # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🔗 Railway API Integration

### Next Steps:

1. **Add API Client** (`lib/api.js`):

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
```

2. **Add Authentication** (`lib/auth.js`):

```javascript
// Implement JWT token management
// Session handling
// OAuth callback handlers
```

3. **Connect Dashboards**:
- Replace static data with API calls
- Implement real-time updates
- Add loading states

---

## 💳 Stripe Integration

### Setup:

1. Install Stripe SDK (already in package.json)
2. Create Stripe products for each tier
3. Implement checkout flow
4. Add webhook handlers

**Pricing Tiers:**
- LeadSite.AI: $59/month
- LeadSite.IO: $79/month
- ClientContact.IO: $149/month
- VideoSite.IO: $99/month
- Tackle.IO: $499/month

---

## 🚀 Production Checklist

### Before Launch:

- [ ] Update environment variables with production keys
- [ ] Configure custom domain (www.leadsite.ai)
- [ ] Set up Stripe webhooks
- [ ] Test all OAuth flows (Google, Microsoft, Twitter)
- [ ] Verify Railway API connection
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Test payment flows end-to-end
- [ ] Set up monitoring & alerts

---

## 📱 Responsive Breakpoints

```
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

All pages are fully responsive with tailored experiences for each device size.

---

## 🎯 Platform Features

### LeadSite.AI ($59/mo)
- Email lead generation
- AI-powered targeting
- Up to 10,000 contacts
- Basic analytics

### LeadSite.IO ($79/mo)
- All LeadSite.AI features
- AI website builder
- Custom domain
- SEO optimization

### ClientContact.IO ($149/mo)
- All previous features
- 22+ social platforms
- Unified inbox
- Advanced automation

### VideoSite.IO ($99/mo)
- Video hosting
- Creator payments
- Live streaming
- Monetization tools

### Tackle.IO ($499/mo) ⭐ MOST POPULAR
- All platform features
- AI voice calls
- Advanced CRM
- Priority support
- Custom integrations
- Dedicated account manager

---

## 🔐 Security

- HTTPS enforced
- Environment variables for secrets
- OAuth 2.0 implementation
- JWT token authentication
- CORS configuration
- Rate limiting ready

---

## 📊 Performance

- Next.js 14 App Router
- Static generation where possible
- Image optimization
- Code splitting
- Lazy loading components
- Edge caching via Vercel

---

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## 📞 Support

- Documentation: https://docs.leadsite.ai
- Support Email: support@aileadstrategies.com
- Status Page: status.leadsite.ai

---

## 🎨 Design Credits

UI Design: Aether Template Style
Fonts: Inter (Google Fonts)
Icons: Lucide React
Animations: Custom CSS + Tailwind

---

## 📄 License

© 2024 AI Lead Strategies LLC. All rights reserved.

---

**Built with:** Next.js 14, React 18, Tailwind CSS, Lucide Icons
**Deployed on:** Vercel
**Backend:** Railway (PostgreSQL + Node.js)
**Payments:** Stripe
