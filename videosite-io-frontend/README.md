# VideoSite.IO Frontend

Video-first lead generation platform with AI-powered insights and interactive video funnels.

## 🎬 Features

- **Video Campaigns**: Upload, manage, and track video performance
- **Video Analytics**: Real-time watch time, engagement, and conversion tracking
- **Interactive Video Funnels**: Create engaging video experiences
- **AI Video Generation**: Automated video creation tools
- **Video Landing Pages**: Convert viewers into leads

## 🎨 Design System

**Theme**: Mission Control (Cinematic)
- **Colors**: Gold (#D4AF37), Beige (#F5F5DC), Void (#050505)
- **Fonts**: Cinzel (serif), Manrope (sans-serif)
- **Style**: Cinematic, luxury, dark theme

## 🚀 Quick Start

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
videosite-io-frontend/
├── app/
│   ├── layout.js          # Root layout
│   ├── globals.css        # Global styles
│   ├── page.js            # Landing page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── dashboard/         # Dashboard pages
├── components/
│   ├── Navigation.js      # Navigation component
│   ├── WebGLBackground.js # Three.js background
│   └── GridCanvas.js      # Grid animation
├── lib/
│   ├── api.js            # API client
│   └── auth.js           # Auth helpers
└── public/               # Static assets
```

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
```

## 🎯 API Integration

All API calls go through `lib/api.js`:
- Authentication endpoints
- Video management endpoints
- Campaign endpoints
- Analytics endpoints

## 📦 Dependencies

- Next.js 14.2.35
- React 18.3.1
- Three.js 0.160.0 (WebGL background)
- GSAP 3.12.4 (Animations)
- Tailwind CSS 3.4.1
- Lucide React (Icons)

## 🌐 Deployment

Deploy to Vercel:

```bash
npm i -g vercel
vercel login
vercel --prod
```

## 📝 License

Private - VideoSite.IO Platform

