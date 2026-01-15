# Backend Deployment Checklist

## 🔍 Current Status Check

Based on Railway dashboard:
- ✅ Backend service shows as "Online" at `api.leadsite.ai`
- ✅ Last deployment: "4 hours ago via CLI" - "Deployment successful"
- ⚠️ However, backend code may not have latest changes or endpoints

## 📋 Backend Endpoints That Need to Be Implemented

### Critical Endpoints (Required for Frontend to Work):

#### 1. Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/me` - Get current user

#### 2. Campaign Endpoints
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `GET /api/campaigns/daily-status` - Get daily campaign status

#### 3. Prospect Endpoints
- `GET /api/prospects` - List prospects
- `POST /api/prospects` - Create prospect
- `GET /api/prospects/:id` - Get prospect details
- `PUT /api/prospects/:id` - Update prospect
- `POST /api/prospects/:id/send-email` - Send email to prospect
- `POST /api/prospects/search` - Search prospects (for AI agent)

#### 4. User Management Endpoints
- `GET /api/users/active` - Get all active users (for AI agent)
- `GET /api/users/:userId` - Get user with business info
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

#### 5. Inbox Endpoints
- `GET /api/inbox/messages` - List messages
- `GET /api/inbox/messages/:id` - Get message details
- `POST /api/inbox/messages/:id/reply` - Reply to message
- `POST /api/inbox/ai-suggest` - Get AI reply suggestion
- `PUT /api/inbox/messages/:id/read` - Mark as read

#### 6. CRM Endpoints
- `GET /api/crm/deals` - List deals
- `POST /api/crm/deals` - Create deal
- `GET /api/crm/deals/:id` - Get deal details
- `PUT /api/crm/deals/:id` - Update deal
- `DELETE /api/crm/deals/:id` - Delete deal

#### 7. Calls Endpoints
- `GET /api/calls` - List calls
- `POST /api/calls/make` - Make a call
- `GET /api/calls/:id` - Get call details
- `GET /api/calls/:id/recording` - Get recording URL

#### 8. Website Endpoints
- `GET /api/websites` - List websites
- `POST /api/websites/analyze` - Analyze website
- `GET /api/websites/:id/prospects` - Get website prospects

#### 9. AI Agent Endpoints (Internal)
- `POST /api/ai/generate-email` - Generate personalized email
- `POST /api/campaigns/schedule` - Schedule email for 8am
- `POST /api/campaigns/status` - Store campaign status

---

## 🚀 Steps to Deploy Backend

### Step 1: Verify Backend Repository
1. Check if backend code is in a separate repository
2. Verify backend code has all required endpoints implemented
3. Ensure backend is connected to Railway

### Step 2: Check Railway Backend Service
1. Go to Railway Dashboard
2. Select **Backend service** (`api.leadsite.ai`)
3. Check **"Deployments"** tab:
   - Verify latest commit/deployment
   - Check if it matches your latest backend code
4. Check **"Variables"** tab:
   - Ensure all required environment variables are set:
     - Database connection strings
     - API keys
     - JWT secrets
     - Email service keys
     - Twilio credentials (if using)
     - OpenAI API key (if using)

### Step 3: Deploy Backend Code
If backend code needs to be deployed:

**Option A: Via Railway CLI**
```bash
cd backend-directory
railway up
```

**Option B: Via GitHub (if connected)**
1. Push backend code to GitHub
2. Railway will auto-deploy if connected to repo

**Option C: Manual Deploy**
1. Go to Railway Dashboard → Backend service
2. Click "Deploy" or trigger redeployment

### Step 4: Verify Deployment
1. Check Railway logs for backend service
2. Look for startup messages
3. Verify no errors in logs
4. Test a simple endpoint: `GET https://api.leadsite.ai/api/health` (if exists)

### Step 5: Test Backend Endpoints
Test critical endpoints:
```bash
# Test health endpoint (if exists)
curl https://api.leadsite.ai/api/health

# Test signup endpoint
curl -X POST https://api.leadsite.ai/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🔧 Backend Requirements

### Database Schema Needed:
- Users table (with businessInfo field)
- Campaigns table
- Prospects table
- Messages table
- Deals table
- Calls table
- Websites table
- Scheduled emails table
- Daily campaign status table

### Third-Party Services Needed:
- Email service (SendGrid/Mailgun/AWS SES)
- Twilio (for calls)
- OpenAI or AI service (for email generation)
- Prospect search service (if using external)

### Environment Variables Needed:
```env
# Database
DATABASE_URL=postgresql://...

# Redis (if using)
REDIS_URL=redis://...

# JWT
JWT_SECRET=your-secret-key

# Email Service
SENDGRID_API_KEY=...
# OR
MAILGUN_API_KEY=...
MAILGUN_DOMAIN=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# AI Service
OPENAI_API_KEY=...

# Internal API Key (for AI agent)
INTERNAL_API_KEY=secure-random-key
```

---

## ✅ Verification Checklist

- [ ] Backend repository exists and has latest code
- [ ] Backend is connected to Railway
- [ ] All required endpoints are implemented
- [ ] Database schema is created
- [ ] Environment variables are set in Railway
- [ ] Backend deploys successfully
- [ ] Backend logs show no errors
- [ ] Test endpoints respond correctly
- [ ] Frontend can connect to backend
- [ ] Authentication works
- [ ] API calls succeed

---

## 🐛 Troubleshooting

### If Backend Shows "Online" but Endpoints Don't Work:
1. Check Railway logs for errors
2. Verify environment variables are set
3. Check database connection
4. Verify endpoint routes are correct
5. Test endpoints directly with curl/Postman

### If Backend Code Needs Updates:
1. Update backend code locally
2. Commit and push to GitHub (if connected)
3. Or use `railway up` to deploy
4. Wait for deployment to complete
5. Check logs for any errors

---

**Next Steps:**
1. Identify backend repository location
2. Verify backend code has all endpoints
3. Deploy backend to Railway
4. Test endpoints
5. Verify frontend can connect
