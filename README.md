# AI Lead Strategies Website

Complete Next.js 14 website for AI Lead Strategies platform ecosystem.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
RAILWAY_API_URL=https://your-railway-app.up.railway.app
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

**Important:** Add `RAILWAY_API_URL` environment variable in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `RAILWAY_API_URL` = `https://your-railway-app.up.railway.app`

## 🔌 Backend Connection

The frontend connects to Railway backend via API routes:

- `/api/auth/signup` - User registration
- `/api/auth/login` - User authentication  
- `/api/health` - Health check

All API routes forward requests to your Railway backend configured via `RAILWAY_API_URL`.

## 📁 Project Structure

```
├── app/
│   ├── api/              # Next.js API routes (proxies to Railway)
│   │   └── auth/
│   ├── signup/           # Signup page (connected to backend)
│   ├── tackle-io/        # Enterprise platform page
│   ├── leadsite-ai/      # Lead generation page
│   ├── leadsite-io/      # Website builder page
│   ├── clientcontact-io/ # Communication hub page
│   └── videosite-io/     # Video marketing page
├── lib/
│   └── api.ts           # API client library
└── components/          # Reusable components
```

## ✅ Features

- ✅ All 5 platform pages built
- ✅ Signup form connected to backend
- ✅ API routes for backend communication
- ✅ Environment variable configuration
- ✅ Error handling and loading states
- ✅ Responsive design
- ✅ Deployed to Vercel

## 🔗 Links

- **Production:** https://ai-lead-strategies-website.vercel.app
- **Health Check:** https://ai-lead-strategies-website.vercel.app/api/health

## 📚 Documentation

- [Environment Setup](./ENV_SETUP.md) - Backend connection configuration
- [Quick Setup Guide](../QUICK-SETUP-GUIDE.md) - Initial setup instructions
