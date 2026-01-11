# API Documentation - AI Lead Strategies

**Version:** 1.0  
**Base URL:** `https://backend-production-2987.up.railway.app/api/v1`  
**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication

### Register User

**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "tier": 1
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": 1,
    "subscription": {...}
  }
}
```

---

## 📊 LeadSite.AI APIs (Tier 1+)

### Campaigns

**GET** `/campaigns` - List campaigns  
**POST** `/campaigns` - Create campaign  
**GET** `/campaigns/:id` - Get campaign  
**PUT** `/campaigns/:id` - Update campaign  
**DELETE** `/campaigns/:id` - Delete campaign

**Example - Create Campaign:**

**POST** `/campaigns`

```json
{
  "name": "Tech Startups SF",
  "industry": "Technology",
  "location": "San Francisco, CA",
  "companySize": "10-50",
  "jobTitles": ["CEO", "CTO", "VP Engineering"]
}
```

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "camp_123",
    "name": "Tech Startups SF",
    "status": "active",
    "leadsGenerated": 0,
    "createdAt": "2026-01-10T23:00:00Z"
  }
}
```

### Leads

**GET** `/leads?campaignId={id}` - List leads  
**POST** `/leads/generate` - Generate leads  
**GET** `/leads/:id` - Get lead  
**PUT** `/leads/:id` - Update lead  
**DELETE** `/leads/:id` - Delete lead  
**POST** `/leads/export` - Export leads (CSV/Excel)

---

## 🌐 LeadSite.IO APIs (Tier 2+)

### Websites

**GET** `/websites` - List websites  
**POST** `/websites` - Create website  
**GET** `/websites/:id` - Get website  
**PUT** `/websites/:id` - Update website  
**DELETE** `/websites/:id` - Delete website  
**POST** `/websites/:id/publish` - Publish website

**Example - Create Website:**

**POST** `/websites`

```json
{
  "name": "My Business Site",
  "template": "business",
  "domain": "mybusiness.leadsite.io"
}
```

**Response:**
```json
{
  "success": true,
  "website": {
    "id": "site_123",
    "name": "My Business Site",
    "domain": "mybusiness.leadsite.io",
    "status": "draft",
    "pages": []
  }
}
```

### Pages

**POST** `/websites/:id/pages` - Add page  
**PUT** `/websites/:websiteId/pages/:pageId` - Update page  
**DELETE** `/websites/:websiteId/pages/:pageId` - Delete page

---

## 💬 ClientContact.IO APIs (Tier 4+)

### Conversations

**GET** `/conversations` - List conversations  
**GET** `/conversations/:id` - Get conversation  
**POST** `/conversations/:id/messages` - Send message  
**PUT** `/conversations/:id` - Update conversation status

### Canned Responses

**GET** `/canned-responses` - List templates  
**POST** `/canned-responses` - Create template  
**PUT** `/canned-responses/:id` - Update template  
**DELETE** `/canned-responses/:id` - Delete template

### Auto-Responses

**GET** `/auto-responses` - List automation rules  
**POST** `/auto-responses` - Create rule  
**PUT** `/auto-responses/:id` - Update rule  
**DELETE** `/auto-responses/:id` - Delete rule

### Conversation Notes

**GET** `/conversations/:id/notes` - List notes  
**POST** `/conversations/:id/notes` - Add note  
**DELETE** `/conversations/:conversationId/notes/:id` - Delete note

---

## 🎯 Tackle.IO APIs (Tier 5 Only)

### Companies

**GET** `/tackle/companies` - List companies (pagination, search, filters)  
**GET** `/tackle/companies/:id` - Get company details  
**POST** `/tackle/companies` - Create company  
**PUT** `/tackle/companies/:id` - Update company  
**DELETE** `/tackle/companies/:id` - Delete company

**Example - Create Company:**

**POST** `/tackle/companies`

```json
{
  "name": "Acme Corp",
  "domain": "acme.com",
  "industry": "Technology",
  "companySize": "100-500",
  "accountTier": "enterprise",
  "annualRevenue": 5000000,
  "address": "123 Main St, San Francisco, CA 94105"
}
```

### Contacts

**GET** `/tackle/contacts` - List contacts  
**POST** `/tackle/contacts` - Create contact  
**POST** `/tackle/contacts/bulk-import` - Bulk import from CSV  
**GET** `/tackle/contacts/:id` - Get contact  
**PUT** `/tackle/contacts/:id` - Update contact  
**DELETE** `/tackle/contacts/:id` - Delete contact

### Deals

**GET** `/tackle/deals` - List deals  
**GET** `/tackle/deals/pipeline/:pipelineId` - Kanban view  
**POST** `/tackle/deals` - Create deal  
**PUT** `/tackle/deals/:id` - Update deal  
**PUT** `/tackle/deals/:id/stage` - Move deal stage  
**DELETE** `/tackle/deals/:id` - Delete deal

### Activities

**GET** `/tackle/activities` - List activities  
**POST** `/tackle/activities` - Create activity  
**PUT** `/tackle/activities/:id/complete` - Mark complete  

### Analytics

**GET** `/tackle/analytics/revenue` - Revenue metrics  
**GET** `/tackle/analytics/forecast` - Sales forecast  
**GET** `/tackle/analytics/conversion` - Conversion rates  
**GET** `/tackle/analytics/pipeline` - Pipeline metrics

---

## 🔧 System APIs

### Health Check

**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T23:00:00Z",
  "version": "1.0.0",
  "service": "leadsite-backend",
  "platforms": [
    "leadsite.ai",
    "leadsite.io", 
    "clientcontact.io",
    "videosite.io",
    "tackle.io"
  ],
  "selfHealing": {
    "enabled": true,
    "agents": 7
  }
}
```

### System Dashboard (Admin Only)

**GET** `/admin/system/dashboard`

**Response:**
```json
{
  "success": true,
  "system": {
    "agents": [
      {"name": "MonitorAgent", "status": "active", "lastCheck": "..."},
      {"name": "DiagnosticAgent", "status": "active", "lastCheck": "..."},
      ...
    ],
    "metrics": {...},
    "alerts": [...]
  }
}
```

---

## 📝 Rate Limits

| Tier | Requests/min | Requests/day |
|------|--------------|--------------|
| Tier 1 | 60 | 5,000 |
| Tier 2 | 120 | 10,000 |
| Tier 3 | 180 | 15,000 |
| Tier 4 | 300 | 25,000 |
| Tier 5 | 2000 | 100,000 |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1673395200
```

---

## ⚠️ Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Add valid auth token |
| 403 | Forbidden | Upgrade tier or check permissions |
| 404 | Not Found | Verify resource exists |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Contact support |

---

## 🔗 Webhooks

### Configure Webhooks

**POST** `/webhooks`

```json
{
  "url": "https://yourapp.com/webhook",
  "events": ["lead.created", "conversation.new", "deal.won"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events

**LeadSite.AI:**
- `campaign.created`
- `lead.created`
- `email.sent`
- `email.opened`

**ClientContact.IO:**
- `conversation.new`
- `message.received`
- `conversation.resolved`

**Tackle.IO:**
- `company.created`
- `deal.created`
- `deal.stage_changed`
- `deal.won`
- `deal.lost`

---

## 📚 SDK & Libraries

**Official SDKs:**
- JavaScript/TypeScript (npm: @leadsite/sdk)
- Python (pip: leadsite-sdk)
- PHP (composer: leadsite/sdk)
- Ruby (gem: leadsite)

**Example (JavaScript):**
```javascript
import LeadSite from '@leadsite/sdk';

const client = new LeadSite({ apiKey: 'your_api_key' });

// Create campaign
const campaign = await client.campaigns.create({
  name: 'My Campaign',
  industry: 'Technology'
});

// Generate leads
const leads = await client.leads.generate(campaign.id);
```

---

## 🧪 Testing

**Test Environment:** `https://api-test.leadsite.ai`

**Test Cards (Stripe):**
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

**Test Mode:**
- Add `X-Test-Mode: true` header
- No charges, no real data
- Reset daily

---

*Last updated: January 10, 2026*  
*Version: 1.0*
