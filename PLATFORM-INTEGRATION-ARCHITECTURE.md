# 🏗️ 5-Platform Integration Architecture

## 📋 Overview

**One Backend, Five Frontends** - All 5 platforms share a single Railway backend while maintaining separate frontends with unique designs and features.

---

## 1️⃣ How All 5 Platforms Integrate with 1 Railway Backend

### **Single Backend API**

```
┌─────────────────────────────────────────────────────────┐
│         RAILWAY BACKEND (Single API)                     │
│         https://api.leadsite.ai                          │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Shared)                      │  │
│  │  - users table (tier field: 1, 2, 3, 4, or 5)    │  │
│  │  - subscriptions table                            │  │
│  │  - leads table (enforced limits per tier)          │  │
│  │  - campaigns table                                 │  │
│  │  - websites table (Tier 2+)                        │  │
│  │  - videos table (Tier 4+)                          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Feature Access Control (Tier Middleware)          │  │
│  │  - Checks user.tier on every request              │  │
│  │  - Grants/denies features based on tier            │  │
│  │  - Enforces lead limits per tier                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │
                    │ REST API (JWT Auth)
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Tier 1  │   │ Tier 2  │   │ Tier 3  │
│ LeadSite│   │LeadSite │   │Client   │
│ .AI     │   │.IO      │   │Contact  │
│         │   │         │   │.IO      │
└─────────┘   └─────────┘   └─────────┘
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐
│ Tier 4  │   │ Tier 5  │
│VideoSite│   │ Tackle  │
│.IO      │   │.IO      │
└─────────┘   └─────────┘
```

### **How It Works:**

1. **Same API Endpoint**: All 5 frontends point to `https://api.leadsite.ai/api/v1`

2. **JWT Token Contains Tier**: When a user logs in, the backend generates a JWT token that includes:
   ```json
   {
     "userId": "uuid",
     "email": "user@example.com",
     "tier": 4,  // ← This determines which features they can access
     "exp": 1234567890
   }
   ```

3. **Tier-Based Feature Control**: The backend middleware checks the user's tier on every request:
   ```javascript
   // Backend middleware example
   const requireTier = (minTier) => {
     return (req, res, next) => {
       const userTier = req.user.tier; // From JWT token
       
       if (userTier < minTier) {
         return res.status(403).json({
           error: 'Upgrade required',
           message: `This feature requires Tier ${minTier} or higher`,
           currentTier: userTier
         });
       }
       
       next();
     };
   };
   ```

4. **Shared Database**: All platforms use the same PostgreSQL tables:
   - **users** table: Single table for all users, differentiated by `tier` field
   - **leads** table: Same table, but backend enforces limits (50, 100, 500, 1000, 10000)
   - **campaigns** table: Same table, but features vary by tier
   - **websites** table: Tier 2+ can access
   - **videos** table: Tier 4+ can access

### **Example API Flow:**

```
User on VideoSite.IO (Tier 4) logs in:
1. Frontend: POST /api/v1/auth/login
2. Backend: Validates credentials, checks subscription tier
3. Backend: Returns JWT token with tier=4
4. Frontend: Stores token, makes requests with Authorization header
5. Backend: Decodes JWT, sees tier=4, allows video features
6. Backend: Returns data filtered by tier permissions
```

---

## 2️⃣ Dashboard Architecture: Separate Dashboards

### **Each Platform Has Its Own Dashboard**

Each platform has a **completely separate frontend** with its own dashboard:

```
Platform 1: LeadSite.AI
├── Frontend: leadsite-ai-frontend/
├── Dashboard: /dashboard (Email campaigns, 50 leads)
├── Theme: VoiceID (Dark Slate/Purple)
└── URL: leadsite.ai

Platform 2: LeadSite.IO
├── Frontend: leadsite-io-frontend/
├── Dashboard: /dashboard (Website builder, 100 leads)
├── Theme: AETHER (Black/Indigo/Purple)
└── URL: leadsite.io

Platform 3: ClientContact.IO
├── Frontend: clientcontact-io-frontend/
├── Dashboard: /dashboard (Multi-channel, 500 leads)
├── Theme: Hybrid Professional (White/Sky Blue/Navy)
└── URL: clientcontact.io

Platform 4: VideoSite.IO
├── Frontend: videosite-io-frontend/
├── Dashboard: /dashboard (Video campaigns, 1000 leads)
├── Theme: Mission Control (Navy/Teal/Gold)
└── URL: videosite.io

Platform 5: Tackle.IO
├── Frontend: tackle-io-frontend/
├── Dashboard: /dashboard (API access, 10000 leads)
├── Theme: NASA Control (Dark Navy/Teal/Gold)
└── URL: tackle.io
```

### **Why Separate Dashboards?**

1. **Different Features**: Each tier has unique features:
   - Tier 1: Basic email campaigns
   - Tier 2: Website builder + email
   - Tier 3: Multi-channel (SMS, social) + website + email
   - Tier 4: Video features + everything in Tier 3
   - Tier 5: API access + white-label + everything in Tier 4

2. **Different UI/UX**: Each platform has its own design system:
   - Different colors, fonts, animations
   - Different navigation structure
   - Different component libraries

3. **User Experience**: Users see only features relevant to their tier

### **Dashboard Data Flow:**

```
User logs into VideoSite.IO:
1. Frontend: GET /api/v1/dashboard/stats
2. Backend: Checks JWT token (tier=4)
3. Backend: Returns stats including video metrics
4. Frontend: Displays video-specific dashboard

User logs into LeadSite.AI:
1. Frontend: GET /api/v1/dashboard/stats
2. Backend: Checks JWT token (tier=1)
3. Backend: Returns basic stats (no video data)
4. Frontend: Displays email-focused dashboard
```

---

## 3️⃣ Separate URLs When Deployed

### **Each Platform Gets Its Own Domain**

Yes, each platform gets a **completely separate URL** when deployed:

| Platform | Frontend Repo | Domain | Deployment |
|----------|--------------|--------|------------|
| **Tier 1** | `leadsite-ai-frontend` | `leadsite.ai` | Vercel |
| **Tier 2** | `leadsite-io-frontend` | `leadsite.io` | Vercel |
| **Tier 3** | `clientcontact-io-frontend` | `clientcontact.io` | Vercel |
| **Tier 4** | `videosite-io-frontend` | `videosite.io` | Vercel |
| **Tier 5** | `tackle-io-frontend` | `tackle.io` | Vercel |

### **Deployment Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│                    RAILWAY BACKEND                        │
│              https://api.leadsite.ai                     │
│                  (Single API)                            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ All frontends connect here
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌──────────┐        ┌──────────┐        ┌──────────┐
│ Vercel   │        │ Vercel   │        │ Vercel   │
│          │        │          │        │          │
│leadsite  │        │leadsite  │        │client    │
│.ai       │        │.io       │        │contact.io│
│          │        │          │        │          │
│Tier 1    │        │Tier 2    │        │Tier 3    │
└──────────┘        └──────────┘        └──────────┘
    │                     │                     │
    ▼                     ▼                     ▼
┌──────────┐        ┌──────────┐
│ Vercel   │        │ Vercel   │
│          │        │          │
│videosite │        │tackle.io │
│.io       │        │          │
│          │        │Tier 5    │
│Tier 4    │        │          │
└──────────┘        └──────────┘
```

### **Environment Variables Per Platform:**

Each frontend has its own `.env.local`:

**LeadSite.AI (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier1
```

**VideoSite.IO (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_PLATFORM=tier4
```

**All point to the same backend!**

---

## 🔄 User Journey Example

### **Scenario: User Upgrades from Tier 1 → Tier 4**

1. **Starts at LeadSite.AI (Tier 1)**
   - URL: `leadsite.ai`
   - Dashboard: Email campaigns only
   - Limit: 50 leads
   - Backend: `api.leadsite.ai` (tier=1)

2. **Upgrades to VideoSite.IO (Tier 4)**
   - Backend updates subscription: `tier=4`
   - User can now access: `videosite.io`
   - Same email/password works on both platforms
   - Dashboard: Video campaigns + all Tier 3 features
   - Limit: 1000 leads
   - Backend: `api.leadsite.ai` (tier=4)

3. **Same User, Same Data**
   - Leads are preserved (same database)
   - Campaigns are preserved
   - Just unlocks new features

---

## 📊 Database Schema (Shared)

```sql
-- Single users table for all platforms
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  tier INTEGER DEFAULT 1,  -- ← This is the key!
  created_at TIMESTAMP
);

-- Single leads table (limits enforced by tier)
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255),
  -- ... other fields
  -- Backend enforces: Tier 1=50, Tier 2=100, etc.
);

-- Single campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),  -- 'email', 'sms', 'video', etc.
  -- Backend allows types based on tier
);
```

---

## 🎯 Key Points Summary

### ✅ **1 Backend Integration:**
- All 5 platforms use **same API URL**: `https://api.leadsite.ai`
- **Same database** (PostgreSQL on Railway)
- **Tier-based access control** via JWT token
- Backend middleware checks `user.tier` on every request

### ✅ **5 Separate Dashboards:**
- Each platform has its own frontend repository
- Each has its own dashboard UI/UX
- Each shows only features for that tier
- Different themes, colors, fonts per platform

### ✅ **5 Separate URLs:**
- `leadsite.ai` (Tier 1)
- `leadsite.io` (Tier 2)
- `clientcontact.io` (Tier 3)
- `videosite.io` (Tier 4)
- `tackle.io` (Tier 5)
- All deployed separately on Vercel
- All connect to same backend

---

## 🔐 Authentication Flow

```
User logs into VideoSite.IO:
1. Frontend (videosite.io): POST /api/v1/auth/login
2. Backend (api.leadsite.ai): Validates credentials
3. Backend: Checks subscription → tier=4
4. Backend: Returns JWT token with tier=4
5. Frontend: Stores token, user sees VideoSite.IO dashboard

Same user logs into LeadSite.AI:
1. Frontend (leadsite.ai): POST /api/v1/auth/login
2. Backend (api.leadsite.ai): Same validation
3. Backend: Returns JWT token with tier=4 (still!)
4. Frontend: Shows LeadSite.AI UI, but backend allows Tier 4 features
   (User can access both platforms with same account)
```

---

## 💡 Benefits of This Architecture

1. **Cost Efficient**: One backend serves all platforms
2. **Easy Upgrades**: User tier change unlocks features across all platforms
3. **Unified Data**: All user data in one place
4. **Brand Separation**: Each platform maintains unique identity
5. **Scalable**: Add new tiers without new backend infrastructure

---

**This is the "One Backend, Five Frontends" architecture!** 🚀



