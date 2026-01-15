# AI Agent Email Process Implementation

## Overview
The AI Agent runs every night on schedule, fetches 50 prospects, sorts them by a scale of 6, creates personalized email copy, and sends them daily at 8am. This shows up in a status window on the user dashboard.

## Components Created

### 1. Signup Form Enhancement (`app/(auth)/signup/page.js`)
- Added business information fields:
  - Industry (required)
  - Services/Products (required)
  - Location/Service Area (required)
  - Target Market (required)
- This data is sent to the backend during signup and stored for AI agent context

### 2. Daily Email Processing API (`app/api/ai-agent/daily-email/route.js`)
- **Endpoint:** `POST /api/ai-agent/daily-email`
- **Schedule:** Runs nightly (configured via Vercel Cron)
- **Process:**
  1. Fetches user's business info from backend
  2. Searches for 50 prospects based on business criteria
  3. Scores prospects on a scale of 1-6 based on:
     - Industry match (+2)
     - Location match (+2)
     - Target market match (+1)
     - Company size/relevance (+1)
  4. Sorts prospects by score (highest first)
  5. Generates personalized email for each prospect using AI
  6. Schedules emails for 8am send
  7. Stores campaign status for dashboard display

### 3. Dashboard Status Component (`components/DailyEmailStatus.js`)
- Displays daily AI agent activity
- Shows:
  - Current status (scheduled/processing/completed/failed)
  - Prospects found
  - Emails scheduled
  - Emails sent
  - Scheduled send time (8:00 AM)
  - Last run timestamp
- Auto-refreshes every 5 minutes

### 4. Daily Status API (`app/api/campaigns/daily-status/route.js`)
- **Endpoint:** `GET /api/campaigns/daily-status`
- Returns today's campaign status for the logged-in user
- Falls back to mock data if backend is unavailable

### 5. Railway Cron Configuration (`scripts/cron-daily-email.js`)
- Script for Railway Cron service to run daily at 2:00 AM UTC
- Calls `/api/ai-agent/daily-email` endpoint
- Can also be used with external cron services
- See `RAILWAY-DEPLOYMENT.md` for setup instructions

## Backend API Requirements

The following backend endpoints need to be implemented:

### 1. User Endpoints
- `GET /api/users/:userId` - Get user with business info
- Requires: Internal API key authentication

### 2. Prospect Search
- `POST /api/prospects/search` - Search for prospects
- Request body:
  ```json
  {
    "industry": "Commercial Cleaning",
    "services": "Office cleaning, carpet cleaning",
    "location": "Berks County, PA",
    "targetMarket": "Offices, Medical Facilities",
    "limit": 50
  }
  ```
- Returns: Array of prospect objects

### 3. AI Email Generation
- `POST /api/ai/generate-email` - Generate personalized email
- Request body:
  ```json
  {
    "prospect": { /* prospect object */ },
    "businessInfo": { /* user's business info */ },
    "context": { /* additional context */ }
  }
  ```
- Returns: Email object with `to`, `subject`, `body`

### 4. Email Scheduling
- `POST /api/campaigns/schedule` - Schedule email for specific time
- Request body:
  ```json
  {
    "userId": "user-id",
    "email": { "to": "...", "subject": "...", "body": "..." },
    "scheduledFor": "2024-01-01T08:00:00Z"
  }
  ```

### 5. Campaign Status
- `POST /api/campaigns/status` - Store campaign status
- `GET /api/campaigns/daily-status?date=YYYY-MM-DD` - Get daily status

## Environment Variables Required

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://backend-production-2987.up.railway.app
INTERNAL_API_KEY=your-internal-api-key-here
CRON_SECRET=your-cron-secret-here
```

## Scoring Algorithm

Prospects are scored on a scale of 1-6:
- **Base score:** 1
- **Industry match:** +2 (if prospect industry matches user's industry)
- **Location match:** +2 (if prospect location matches user's service area)
- **Target market match:** +1 (if prospect company type matches target market)
- **Company size:** +1 (if company has 10+ employees)
- **Maximum score:** 6

## Email Personalization

The AI agent uses:
- User's business information (industry, services, location, target market)
- Prospect information (company, location, industry, company type)
- Contextual matching to create highly personalized emails

## Scheduling

- **Cron Schedule:** Runs daily at 2:00 AM UTC (configured in `vercel.json`)
- **Email Send Time:** 8:00 AM (user's local time or UTC, configurable)
- **Processing:** Happens overnight, emails scheduled for next morning

## Dashboard Display

The `DailyEmailStatus` component shows:
- ✅ Status indicator (scheduled/processing/completed/failed)
- 📊 Metrics (prospects found, emails scheduled, emails sent)
- ⏰ Scheduled send time
- 🔄 Auto-refresh every 5 minutes

## Testing

To test the daily email process manually:
```bash
curl -X POST http://localhost:3000/api/ai-agent/daily-email \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "cronSecret": "your-cron-secret"}'
```

## Next Steps

1. ✅ Frontend components created
2. ⏳ Backend API endpoints need to be implemented
3. ⏳ Email sending service integration (SendGrid, Mailgun, etc.)
4. ⏳ Prospect database/search service integration
5. ⏳ AI email generation service integration
6. ⏳ Testing and deployment

## Notes

- The cron job runs at 2 AM UTC to allow time for processing before 8 AM send
- All emails are scheduled, not sent immediately
- Status is stored for dashboard display
- The system falls back gracefully if backend services are unavailable
