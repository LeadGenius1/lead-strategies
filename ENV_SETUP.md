# Environment Variables Setup

## Required Environment Variables

### For Vercel Deployment

Add these in your Vercel project settings:
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add the following:

```
RAILWAY_API_URL=https://your-railway-app.up.railway.app
```

### For Local Development

Create a `.env.local` file in the root directory:

```bash
# Railway Backend API URL
RAILWAY_API_URL=https://your-railway-app.up.railway.app

# Or for local backend testing:
# RAILWAY_API_URL=http://localhost:3001
```

## Getting Your Railway API URL

1. Go to your Railway project dashboard
2. Click on your service
3. Go to Settings → Networking
4. Copy the public domain URL (e.g., `https://your-app.up.railway.app`)
5. Use this as your `RAILWAY_API_URL`

## Backend API Endpoints Expected

The frontend expects these endpoints on your Railway backend:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/health` - Health check endpoint

## Testing the Connection

Visit `/api/health` on your frontend to check backend connectivity:
- https://your-vercel-app.vercel.app/api/health

This will show:
- Frontend status
- Backend connection status
- Backend URL configuration
