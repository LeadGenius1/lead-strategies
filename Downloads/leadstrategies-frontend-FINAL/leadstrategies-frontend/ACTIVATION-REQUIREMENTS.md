# Feature Activation Requirements

## What's Needed to Activate Each Feature

---

## 🔴 HIGH PRIORITY - Core Functionality

### 1. Campaign Creation (`/dashboard/campaigns`)

#### Frontend Changes Needed:
```javascript
// Add to campaigns/page.js:
- Create Campaign Modal Component
- Form fields: name, subject, email template, prospect list, schedule
- Handler for "+ New Campaign" button
- Handler for "View" button (show campaign details)
```

**Files to Create/Modify:**
- `components/CreateCampaignModal.js` - New modal component
- `app/(dashboard)/dashboard/campaigns/page.js` - Add handlers

#### Backend API Endpoints Needed:
```javascript
POST /api/campaigns
Request: {
  name: string,
  subject: string,
  body: string,
  prospectIds: string[],
  scheduledFor: ISO date string
}
Response: { campaign: {...}, id: string }

GET /api/campaigns/:id
Response: { campaign: {...}, stats: {...} }

PUT /api/campaigns/:id
Request: { name?, subject?, body?, status? }
Response: { campaign: {...} }

POST /api/campaigns/:id/pause
Response: { campaign: {...}, status: 'paused' }

POST /api/campaigns/:id/resume
Response: { campaign: {...}, status: 'active' }
```

#### Database Schema Needed:
```sql
campaigns table:
- id (UUID)
- user_id (UUID, FK)
- name (string)
- subject (string)
- body (text)
- status (enum: draft, active, paused, completed)
- sent_count (int)
- open_count (int)
- reply_count (int)
- created_at (timestamp)
- updated_at (timestamp)
- scheduled_for (timestamp)
```

---

### 2. Prospect Management (`/dashboard/prospects`)

#### Frontend Changes Needed:
```javascript
// Add to prospects/page.js:
- Create Add Prospect Modal Component
- Form fields: name, email, company, title, phone
- Handler for "+ Add Prospect" button
- Handler for "Send Email" button
- Handler for "View Profile" button (show prospect details modal)
```

**Files to Create/Modify:**
- `components/AddProspectModal.js` - New modal component
- `components/ProspectProfileModal.js` - New modal component
- `components/SendEmailModal.js` - New modal component
- `app/(dashboard)/dashboard/prospects/page.js` - Add handlers

#### Backend API Endpoints Needed:
```javascript
POST /api/prospects
Request: {
  name: string,
  email: string,
  company?: string,
  title?: string,
  phone?: string,
  website?: string
}
Response: { prospect: {...}, id: string }

GET /api/prospects/:id
Response: {
  prospect: {...},
  emails: [...],
  notes: [...],
  activities: [...]
}

PUT /api/prospects/:id
Request: { name?, email?, company?, status?, notes? }
Response: { prospect: {...} }

POST /api/prospects/:id/send-email
Request: {
  subject: string,
  body: string,
  campaignId?: string
}
Response: { email: {...}, sent: true }
```

#### Database Schema Needed:
```sql
prospects table:
- id (UUID)
- user_id (UUID, FK)
- name (string)
- email (string)
- company (string, nullable)
- title (string, nullable)
- phone (string, nullable)
- website (string, nullable)
- status (enum: new, contacted, qualified, converted)
- emails_sent (int)
- opens (int)
- replies (int)
- created_at (timestamp)
- updated_at (timestamp)

prospect_emails table:
- id (UUID)
- prospect_id (UUID, FK)
- campaign_id (UUID, FK, nullable)
- subject (string)
- body (text)
- sent_at (timestamp)
- opened_at (timestamp, nullable)
- replied_at (timestamp, nullable)
```

---

### 3. Settings - Profile Update (`/dashboard/settings`)

#### Frontend Changes Needed:
```javascript
// Add to settings/page.js:
- Handler for "Save Changes" button
- Form state management
- Validation
- Success/error handling
```

**Files to Modify:**
- `app/(dashboard)/dashboard/settings/page.js` - Add save handler

#### Backend API Endpoints Needed:
```javascript
PUT /api/users/profile
Request: {
  name?: string,
  company?: string,
  role?: string
}
Response: { user: {...} }

PUT /api/users/password
Request: {
  currentPassword: string,
  newPassword: string
}
Response: { success: true }

PUT /api/users/subscription
Request: {
  tier: string
}
Response: { subscription: {...} }

POST /api/integrations/:service/connect
Request: {
  service: 'gmail' | 'linkedin' | 'slack' | 'calendly',
  authCode: string  // OAuth code
}
Response: { integration: {...}, connected: true }

DELETE /api/integrations/:service/disconnect
Response: { success: true }

DELETE /api/users/account
Request: { password: string }  // Confirmation
Response: { success: true }
```

#### Database Schema Needed:
```sql
users table (update):
- Add: role (string)
- Add: updated_at (timestamp)

integrations table:
- id (UUID)
- user_id (UUID, FK)
- service (string)
- access_token (encrypted text)
- refresh_token (encrypted text, nullable)
- expires_at (timestamp, nullable)
- connected_at (timestamp)
```

---

## 🟡 MEDIUM PRIORITY - Feature Completion

### 4. Inbox API Integration (`/dashboard/inbox`)

#### Frontend Changes Needed:
```javascript
// Replace MOCK_MESSAGES with API calls:
- useEffect to load messages from API
- Handler for "Send Reply" button
- Handler for "AI Suggest Reply" button
- Handler for search input
- Handler for channel filter
- Real-time updates (polling or WebSocket)
```

**Files to Modify:**
- `app/(dashboard)/dashboard/inbox/page.js` - Replace mock data with API

#### Backend API Endpoints Needed:
```javascript
GET /api/inbox/messages
Query params: ?channel=email&search=query&unread=true
Response: {
  messages: [...],
  total: number,
  unread: number
}

GET /api/inbox/messages/:id
Response: {
  message: {...},
  thread: [...],  // Conversation history
  contact: {...}
}

POST /api/inbox/messages/:id/reply
Request: {
  body: string,
  channel: string
}
Response: { message: {...}, sent: true }

POST /api/inbox/ai-suggest
Request: {
  messageId: string,
  context?: string
}
Response: {
  suggestion: string,
  tone: string
}

PUT /api/inbox/messages/:id/read
Response: { message: {...}, read: true }

PUT /api/inbox/messages/:id/unread
Response: { message: {...}, unread: true }

DELETE /api/inbox/messages/:id
Response: { success: true }
```

#### Database Schema Needed:
```sql
messages table:
- id (UUID)
- user_id (UUID, FK)
- channel (enum: email, linkedin, twitter, instagram, sms)
- from_name (string)
- from_email (string)
- subject (string)
- body (text)
- thread_id (UUID, nullable)
- parent_message_id (UUID, nullable)
- is_read (boolean)
- is_replied (boolean)
- received_at (timestamp)
- created_at (timestamp)
```

#### Third-Party Integrations Needed:
- **Gmail API** - OAuth 2.0, Gmail API access
- **LinkedIn API** - OAuth 2.0, LinkedIn Messaging API
- **Twitter API** - OAuth 2.0, Twitter API v2
- **Instagram API** - OAuth 2.0, Instagram Graph API
- **SMS Provider** (Twilio) - For SMS messages

---

### 5. CRM API Integration (`/dashboard/crm`)

#### Frontend Changes Needed:
```javascript
// Replace PIPELINE_STAGES with API calls:
- useEffect to load deals from API
- Handler for "+ New Deal" button
- Handler for "Edit" button
- Drag-and-drop handler for pipeline stages
- Handler for "+ Add Deal" in each stage
```

**Files to Create/Modify:**
- `components/CreateDealModal.js` - New modal component
- `components/EditDealModal.js` - New modal component
- `app/(dashboard)/dashboard/crm/page.js` - Replace mock data, add handlers
- Install drag-and-drop library: `react-beautiful-dnd` or `@dnd-kit/core`

#### Backend API Endpoints Needed:
```javascript
GET /api/crm/deals
Query params: ?stage=lead&view=pipeline|list
Response: {
  deals: [...],
  stages: [...],
  stats: {...}
}

POST /api/crm/deals
Request: {
  company: string,
  contact: string,
  value: number,
  stage: string,
  expectedCloseDate?: ISO date string,
  notes?: string
}
Response: { deal: {...}, id: string }

GET /api/crm/deals/:id
Response: {
  deal: {...},
  activities: [...],
  notes: [...],
  history: [...]
}

PUT /api/crm/deals/:id
Request: {
  company?, contact?, value?, stage?, expectedCloseDate?, notes?
}
Response: { deal: {...} }

PUT /api/crm/deals/:id/stage
Request: {
  stage: string,
  previousStage: string
}
Response: { deal: {...}, moved: true }

DELETE /api/crm/deals/:id
Response: { success: true }
```

#### Database Schema Needed:
```sql
deals table:
- id (UUID)
- user_id (UUID, FK)
- company (string)
- contact (string)
- contact_email (string, nullable)
- value (decimal)
- stage (enum: lead, qualified, proposal, negotiation, closed_won, closed_lost)
- expected_close_date (date, nullable)
- actual_close_date (date, nullable)
- probability (int, 0-100)
- created_at (timestamp)
- updated_at (timestamp)

deal_activities table:
- id (UUID)
- deal_id (UUID, FK)
- type (enum: call, email, meeting, note)
- description (text)
- created_at (timestamp)

deal_notes table:
- id (UUID)
- deal_id (UUID, FK)
- note (text)
- created_by (UUID, FK)
- created_at (timestamp)
```

---

### 6. Calls API Integration (`/dashboard/calls`)

#### Frontend Changes Needed:
```javascript
// Replace MOCK_CALLS with API calls:
- useEffect to load calls from API
- Handler for "Call" button (Twilio integration)
- Handler for "View Recording" button
- Real-time call status updates
- Call stats from API
```

**Files to Modify:**
- `app/(dashboard)/dashboard/calls/page.js` - Replace mock data, add handlers

#### Backend API Endpoints Needed:
```javascript
GET /api/calls
Query params: ?date=today&outcome=meeting_booked
Response: {
  calls: [...],
  stats: {
    callsToday: number,
    avgDuration: string,
    meetingsBooked: number,
    talkTime: string
  }
}

POST /api/calls/make
Request: {
  phoneNumber: string,
  prospectId?: string
}
Response: {
  call: {...},
  callSid: string,  // Twilio SID
  status: 'ringing' | 'in-progress' | 'completed'
}

GET /api/calls/:id
Response: {
  call: {...},
  recording: {...},
  transcript: {...},
  aiInsights: {...}
}

GET /api/calls/:id/recording
Response: {
  recordingUrl: string,
  duration: number
}

POST /api/calls/:id/notes
Request: {
  notes: string,
  outcome: string
}
Response: { call: {...}, updated: true }

POST /api/calls/:id/transcript
Request: {
  transcript: string  // From Twilio
}
Response: { call: {...}, transcriptSaved: true }
```

#### Database Schema Needed:
```sql
calls table:
- id (UUID)
- user_id (UUID, FK)
- prospect_id (UUID, FK, nullable)
- phone_number (string)
- call_sid (string)  // Twilio SID
- duration (int, seconds)
- status (enum: ringing, in-progress, completed, failed)
- outcome (enum: meeting_booked, follow_up, not_interested, voicemail)
- recording_url (string, nullable)
- transcript (text, nullable)
- notes (text, nullable)
- started_at (timestamp)
- ended_at (timestamp, nullable)
- created_at (timestamp)
```

#### Third-Party Integration Needed:
- **Twilio Account** - Phone number, API credentials
- **Twilio SDK** - For making calls
- **Twilio Webhooks** - For call status updates
- **Speech-to-Text Service** - For call transcription (Twilio or Google)

---

## 🟢 LOW PRIORITY - Enhancements

### 7. Website Action Buttons (`/dashboard/websites`)

#### Frontend Changes Needed:
```javascript
// Add handlers:
- Handler for "View Prospects" button
  → Navigate to /dashboard/prospects?websiteId=xxx
- Handler for "Create Campaign" button
  → Open CreateCampaignModal with website prospects pre-selected
```

**Files to Modify:**
- `app/(dashboard)/dashboard/websites/page.js` - Add handlers

#### Backend API Endpoints Needed:
```javascript
GET /api/websites/:id/prospects
Response: {
  prospects: [...],
  total: number
}
```

---

## 🆕 AI Agent Email Process

### 8. Daily Email Processing (Already Created, Needs Backend)

#### Frontend Status:
✅ **Complete** - All frontend code ready

#### Backend API Endpoints Needed:
```javascript
GET /api/users/active
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Response: {
  users: [
    {
      id: string,
      email: string,
      businessInfo: {
        industry: string,
        services: string,
        location: string,
        targetMarket: string
      }
    }
  ]
}

GET /api/users/:userId
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Response: {
  id: string,
  email: string,
  name: string,
  businessInfo: {...}
}

POST /api/prospects/search
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Request: {
  industry: string,
  services: string,
  location: string,
  targetMarket: string,
  limit: 50
}
Response: {
  prospects: [
    {
      id: string,
      name: string,
      email: string,
      company: string,
      industry: string,
      location: string,
      companyType: string,
      companySize: number
    }
  ]
}

POST /api/ai/generate-email
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Request: {
  prospect: {...},
  businessInfo: {...},
  context: {...}
}
Response: {
  to: string,
  subject: string,
  body: string
}

POST /api/campaigns/schedule
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Request: {
  userId: string,
  email: {
    to: string,
    subject: string,
    body: string
  },
  scheduledFor: ISO date string
}
Response: {
  scheduledEmail: {...},
  id: string
}

POST /api/campaigns/status
Headers: Authorization: Bearer {INTERNAL_API_KEY}
Request: {
  userId: string,
  date: string (YYYY-MM-DD),
  totalProspects: number,
  emailsScheduled: number,
  status: string
}
Response: { success: true }

GET /api/campaigns/daily-status
Query params: ?date=YYYY-MM-DD
Headers: Authorization: Bearer {user_token}
Response: {
  date: string,
  status: string,
  prospectsFound: number,
  emailsScheduled: number,
  emailsSent: number,
  scheduledFor: string,
  lastRun: ISO timestamp
}
```

#### Database Schema Needed:
```sql
scheduled_emails table:
- id (UUID)
- user_id (UUID, FK)
- prospect_id (UUID, FK, nullable)
- to (string)
- subject (string)
- body (text)
- scheduled_for (timestamp)
- sent_at (timestamp, nullable)
- status (enum: scheduled, sent, failed)
- created_at (timestamp)

daily_campaign_status table:
- id (UUID)
- user_id (UUID, FK)
- date (date)
- status (enum: scheduled, processing, completed, failed)
- prospects_found (int)
- emails_scheduled (int)
- emails_sent (int)
- scheduled_for (time)
- last_run (timestamp)
- error (text, nullable)
- created_at (timestamp)
```

#### Email Service Integration Needed:
- **SendGrid** or **Mailgun** or **AWS SES**
- API key configuration
- Email template support
- Scheduled sending capability

---

## 📋 Implementation Checklist

### Phase 1: Core Functionality (High Priority)
- [ ] Create Campaign Modal + Handler
- [ ] Add Prospect Modal + Handler
- [ ] Send Email Handler
- [ ] Settings Save Profile Handler
- [ ] Backend: Campaign CRUD endpoints
- [ ] Backend: Prospect CRUD endpoints
- [ ] Backend: User profile update endpoint

### Phase 2: Feature Completion (Medium Priority)
- [ ] Inbox API Integration
- [ ] CRM API Integration
- [ ] Calls API Integration
- [ ] Backend: Inbox endpoints
- [ ] Backend: CRM endpoints
- [ ] Backend: Calls endpoints
- [ ] Third-party: Gmail/LinkedIn OAuth
- [ ] Third-party: Twilio integration

### Phase 3: AI Agent Backend (New Feature)
- [ ] Backend: Active users endpoint
- [ ] Backend: Prospect search endpoint
- [ ] Backend: AI email generation endpoint
- [ ] Backend: Email scheduling endpoint
- [ ] Backend: Campaign status endpoint
- [ ] Email service: SendGrid/Mailgun setup
- [ ] Railway Cron: Configure scheduled job

### Phase 4: Enhancements (Low Priority)
- [ ] Website action button handlers
- [ ] Form validation enhancements
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Real-time updates (WebSocket)

---

## 🔧 Technical Requirements

### Frontend Dependencies to Add:
```json
{
  "react-beautiful-dnd": "^13.1.1",  // For CRM drag-and-drop
  "@dnd-kit/core": "^6.0.8",  // Alternative drag-and-drop
  "react-modal": "^3.16.1",  // For modals
  "date-fns": "^2.30.0",  // For date formatting
  "socket.io-client": "^4.5.4"  // For real-time updates (optional)
}
```

### Backend Dependencies Needed:
```json
{
  "twilio": "^4.19.0",  // For calls
  "@sendgrid/mail": "^7.7.0",  // For emails
  "node-cron": "^3.0.3",  // For scheduled tasks
  "openai": "^4.20.0",  // For AI email generation
  "axios": "^1.6.5"  // For external API calls
}
```

### Environment Variables Needed:
```env
# Email Service
SENDGRID_API_KEY=your-sendgrid-key
# OR
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AI Service
OPENAI_API_KEY=your-openai-key
# OR use your own AI service

# OAuth (for integrations)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Internal
INTERNAL_API_KEY=your-secure-random-key
CRON_SECRET=your-secure-random-secret
```

---

## 🎯 Quick Start Guide

### To Activate Campaign Creation:
1. Create `components/CreateCampaignModal.js`
2. Add handler to campaigns page
3. Implement `POST /api/campaigns` in backend
4. Add campaigns table to database

### To Activate Prospect Management:
1. Create `components/AddProspectModal.js`
2. Add handlers to prospects page
3. Implement `POST /api/prospects` in backend
4. Add prospects table to database

### To Activate Settings Save:
1. Add form state to settings page
2. Add save handler
3. Implement `PUT /api/users/profile` in backend
4. Update users table schema

---

**Estimated Development Time:**
- Phase 1 (Core): 2-3 days
- Phase 2 (Features): 5-7 days
- Phase 3 (AI Agent): 3-4 days
- Phase 4 (Enhancements): 2-3 days

**Total: ~12-17 days for full implementation**
