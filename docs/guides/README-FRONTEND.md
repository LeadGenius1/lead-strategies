# AI Lead Strategies - Unified Platform Frontend

Next.js 14 frontend for the AI Lead Strategies unified SaaS platform.

## 🚀 5 Platforms, 1 Dashboard

This frontend powers all 5 platforms with feature-gated access:

| Platform | Tier | Price | Features |
|----------|------|-------|----------|
| **LeadSite.AI** | Tier 1 | $49/mo | Email campaigns, prospect discovery, AI content |
| **LeadSite.IO** | Special | $29/mo | AI website builder, lead capture forms |
| **ClientContact.IO** | Tier 2 | $149/mo | 22+ channel integration, unified inbox |
| **ClientContact.IO** | Tier 3/5 | $99–$299/mo | Unified inbox, CRM, 7 AI agents |
| **VideoSite.IO** | Coming | TBD | Video marketing platform |

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Aether dark theme)
- **State:** React Query
- **Auth:** JWT tokens with cookies
- **API:** REST to Railway backend

## 📁 Project Structure

```
app/
├── page.js                 # Landing page (all 5 platforms)
├── (auth)/
│   ├── login/              # Login page
│   └── signup/             # Signup with tier selection
├── (dashboard)/
│   └── dashboard/
│       ├── page.js         # Overview
│       ├── websites/       # Website analysis
│       ├── campaigns/      # Email campaigns
│       ├── prospects/      # Prospect management
│       ├── inbox/          # Unified inbox (Tier 2+)
│       ├── calls/          # Voice calls (Tier 3)
│       ├── crm/            # CRM pipeline (Tier 3)
│       └── settings/       # Account settings
components/
├── Sidebar.js              # Feature-gated navigation
lib/
├── api.js                  # API client with auth
└── auth.js                 # Auth utilities
```

## 🔧 Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment file:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | https://backend-production-2987.up.railway.app |

## 🚀 Deployment

### Railway (only)

1. Connect GitHub repository to Railway
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://backend-production-2987.up.railway.app`
3. Deploy

### Backend

Backend deployed on Railway: `https://backend-production-2987.up.railway.app`

## 📊 Features by Tier

### All Tiers
- Dashboard overview
- Website analysis
- Campaign management
- Prospect tracking
- Settings

### Tier 2+ (ClientContact.IO)
- Unified inbox
- 22+ channel integration
- AI auto-responder

### Tier 3 / 5 (ClientContact.IO)
- Voice calling with Twilio
- Full CRM with pipeline
- 7 AI agents dashboard
- Team collaboration

## 🎨 Design System (Aether)

```css
--dark-bg: #0a0a0f
--dark-surface: #151520
--dark-border: #252538
--dark-text: #e4e4e7
--dark-primary: #6366f1
```

## 📧 Contact

AI Lead Strategies LLC
Wyomissing, PA 19610
hello@aileadstrategies.com

---

© 2026 AI Lead Strategies LLC
