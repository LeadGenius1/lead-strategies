# LeadSite.AI - Frontend (Tier 1)

Email campaign and lead management platform frontend built with Next.js 14.

## 🚀 Quick Start

See `QUICK-START-LEADSITE-AI.md` for detailed setup instructions.

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
leadsite-ai-frontend/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.js          # Root layout
│   ├── page.js            # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Dashboard/         # Dashboard components
│   └── Navigation.js      # Navigation component
├── lib/                   # Utility libraries
│   ├── api.js             # API client
│   ├── auth.js            # Auth helpers
│   └── hooks.js           # Custom React hooks
└── public/                # Static assets
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
```

## 📚 Documentation

- **Quick Start:** `QUICK-START-LEADSITE-AI.md`
- **Full Implementation:** `LEADSITE-AI-TIER1-IMPLEMENTATION.md`

## 🎯 Features

- ✅ Landing page with pricing
- ✅ User authentication (login/signup)
- ✅ Dashboard with stats
- ✅ Campaign management
- ✅ Lead management (50 limit for Tier 1)
- ✅ Analytics dashboard
- ✅ Responsive design

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Deployment:** Vercel

## 📝 License

Private - All rights reserved



