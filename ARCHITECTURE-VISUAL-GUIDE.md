# 🎯 5-Platform Architecture - Visual Guide

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RAILWAY BACKEND (Single API)                      │
│                    https://api.leadsite.ai                          │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (Shared Across All Platforms)            │  │
│  │                                                                │  │
│  │  users table:                                                  │  │
│  │    - id, email, password_hash                                 │  │
│  │    - tier: 1, 2, 3, 4, or 5  ← KEY FIELD                     │  │
│  │                                                                │  │
│  │  leads table:                                                  │  │
│  │    - user_id, email, name, ...                                │  │
│  │    - Backend enforces limits:                                 │  │
│  │      Tier 1: 50 leads                                         │  │
│  │      Tier 2: 100 leads                                        │  │
│  │      Tier 3: 500 leads                                        │  │
│  │      Tier 4: 1000 leads                                       │  │
│  │      Tier 5: 10000 leads                                      │  │
│  │                                                                │  │
│  │  campaigns table:                                              │  │
│  │    - user_id, name, type, ...                                 │  │
│  │    - Backend allows types based on tier                       │  │
│  │                                                                │  │
│  │  websites table: (Tier 2+)                                    │  │
│  │  videos table: (Tier 4+)                                      │  │
│  │  api_keys table: (Tier 5)                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tier Middleware (Feature Access Control)                      │  │
│  │                                                                │  │
│  │  Every API request:                                            │  │
│  │  1. Decode JWT token → get user.tier                          │  │
│  │  2. Check if tier >= required tier for feature                 │  │
│  │  3. Allow or deny request                                      │  │
│  │                                                                │  │
│  │  Example:                                                       │  │
│  │  POST /api/v1/videos/upload                                    │  │
│  │  → Requires tier >= 4                                         │  │
│  │  → Tier 1,2,3: 403 Forbidden                                  │  │
│  │  → Tier 4,5: 200 OK                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JWT Auth)
                              │ Same endpoint for all platforms
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  TIER 1         │  │  TIER 2         │  │  TIER 3         │
│  LeadSite.AI    │  │  LeadSite.IO    │  │  ClientContact  │
│                 │  │                 │  │  .IO            │
│  Frontend:      │  │  Frontend:      │  │  Frontend:      │
│  leadsite-ai-   │  │  leadsite-io-   │  │  clientcontact- │
│  frontend/      │  │  frontend/      │  │  io-frontend/   │
│                 │  │                 │  │                 │
│  URL:           │  │  URL:           │  │  URL:           │
│  leadsite.ai    │  │  leadsite.io    │  │  clientcontact  │
│                 │  │                 │  │  .io            │
│  Dashboard:     │  │  Dashboard:     │  │  Dashboard:    │
│  Email only     │  │  Website +      │  │  Multi-channel  │
│  50 leads       │  │  Email          │  │  + Website      │
│                 │  │  100 leads      │  │  + Email        │
│  Theme:         │  │                 │  │  500 leads      │
│  VoiceID        │  │  Theme:         │  │                 │
│  (Dark/Purple)  │  │  AETHER        │  │  Theme:         │
│                 │  │  (Black/Indigo)│  │  Hybrid Prof    │
│  Deploy:        │  │                 │  │  (White/Blue)  │
│  Vercel         │  │  Deploy:        │  │                 │
│                 │  │  Vercel        │  │  Deploy:        │
│                 │  │                 │  │  Vercel        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐
│  TIER 4         │  │  TIER 5         │
│  VideoSite.IO   │  │  Tackle.IO      │
│                 │  │                 │
│  Frontend:      │  │  Frontend:      │
│  videosite-io-  │  │  tackle-io-     │
│  frontend/      │  │  frontend/      │
│                 │  │                 │
│  URL:           │  │  URL:           │
│  videosite.io   │  │  tackle.io      │
│                 │  │                 │
│  Dashboard:     │  │  Dashboard:     │
│  Video +        │  │  API +          │
│  Multi-channel  │  │  White-label +  │
│  + Website      │  │  Video +        │
│  + Email        │  │  Everything     │
│  1000 leads     │  │  10000 leads    │
│                 │  │                 │
│  Theme:         │  │  Theme:         │
│  Mission Ctrl   │  │  NASA Control   │
│  (Navy/Teal)    │  │  (Dark/Teal)    │
│                 │  │                 │
│  Deploy:        │  │  Deploy:        │
│  Vercel         │  │  Vercel        │
│                 │  │                 │
└─────────────────┘  └─────────────────┘
```

---

## 🔑 Key Architecture Points

### **1. Single Backend Integration**

**How it works:**
- All 5 frontends use **identical API client code**
- All point to: `https://api.leadsite.ai/api/v1`
- Backend receives requests with JWT token
- Backend checks `user.tier` from JWT
- Backend returns data/features based on tier

**Example API Client (Same for all platforms):**
```javascript
// lib/api.js (identical in all 5 frontends)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Authorization': `Bearer ${token}` // JWT contains tier
  }
})
```

**Backend Tier Check:**
```javascript
// Backend middleware (Railway)
const requireTier = (minTier) => {
  return (req, res, next) => {
    const userTier = req.user.tier; // From JWT
    
    if (userTier < minTier) {
      return res.status(403).json({
        error: 'Upgrade required',
        currentTier: userTier,
        requiredTier: minTier
      });
    }
    
    next(); // Allow request
  };
};

// Routes
router.post('/videos/upload', requireTier(4), uploadVideo);
router.post('/websites', requireTier(2), createWebsite);
router.get('/api-keys', requireTier(5), listAPIKeys);
```

---

### **2. Separate Dashboards**

**Each platform has its own dashboard UI:**

| Platform | Dashboard Features | Visual Theme |
|----------|-------------------|--------------|
| **LeadSite.AI** | Email campaigns, 50 leads, basic analytics | VoiceID (Dark/Purple) |
| **LeadSite.IO** | Website builder, email, 100 leads, SEO | AETHER (Black/Indigo) |
| **ClientContact.IO** | Multi-channel (SMS, social), website, email, 500 leads | Hybrid (White/Blue) |
| **VideoSite.IO** | Video upload, video analytics, all Tier 3 features, 1000 leads | Mission Control (Navy/Teal) |
| **Tackle.IO** | API keys, white-label, all Tier 4 features, 10000 leads | NASA Control (Dark/Teal) |

**Why separate dashboards?**
- Different features per tier
- Different UI/UX per brand
- Different user experience
- Easier to maintain and update

**Dashboard Data Flow:**
```
User on VideoSite.IO:
GET /api/v1/dashboard/stats
→ Backend checks tier=4
→ Returns: video stats, campaign stats, lead stats
→ Frontend displays: Video-focused dashboard

User on LeadSite.AI:
GET /api/v1/dashboard/stats
→ Backend checks tier=1
→ Returns: email stats, lead stats (no video data)
→ Frontend displays: Email-focused dashboard
```

---

### **3. Separate URLs**

**Each platform gets its own domain:**

| Platform | Domain | Frontend Repo | Deployment |
|----------|--------|---------------|------------|
| Tier 1 | `leadsite.ai` | `leadsite-ai-frontend` | Vercel |
| Tier 2 | `leadsite.io` | `leadsite-io-frontend` | Vercel |
| Tier 3 | `clientcontact.io` | `clientcontact-io-frontend` | Vercel |
| Tier 4 | `videosite.io` | `videosite-io-frontend` | Vercel |
| Tier 5 | `tackle.io` | `tackle-io-frontend` | Vercel |

**Deployment Process:**
```bash
# Each platform deployed separately
cd leadsite-ai-frontend
vercel --prod
# → Deploys to leadsite.ai

cd videosite-io-frontend
vercel --prod
# → Deploys to videosite.io

# Both connect to same backend!
```

**Environment Variables:**
```env
# All platforms use same backend URL
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
```

---

## 🔄 User Flow Example

### **Scenario: User Upgrades**

**Step 1: User signs up on LeadSite.AI (Tier 1)**
```
1. Visits: leadsite.ai
2. Signs up → Backend creates user with tier=1
3. Gets JWT token with tier=1
4. Sees LeadSite.AI dashboard (email only)
5. Can manage 50 leads max
```

**Step 2: User upgrades to VideoSite.IO (Tier 4)**
```
1. Backend updates subscription: tier=4
2. User visits: videosite.io
3. Logs in with same email/password
4. Gets JWT token with tier=4
5. Sees VideoSite.IO dashboard (video + all features)
6. Can manage 1000 leads
7. Can upload videos
8. Can use all Tier 3 features
```

**Step 3: User can access both platforms**
```
- Same account works on both leadsite.ai and videosite.io
- Same data (leads, campaigns) accessible from both
- Different UI/UX per platform
- Features unlocked based on highest tier
```

---

## 📋 Summary

### ✅ **1 Backend (Railway)**
- Single API: `https://api.leadsite.ai`
- Single PostgreSQL database
- Tier-based access control via JWT
- All 5 platforms connect here

### ✅ **5 Separate Dashboards**
- Each platform has unique frontend codebase
- Each has unique dashboard UI
- Each shows tier-appropriate features
- Different themes/designs per platform

### ✅ **5 Separate URLs**
- `leadsite.ai` (Tier 1)
- `leadsite.io` (Tier 2)
- `clientcontact.io` (Tier 3)
- `videosite.io` (Tier 4)
- `tackle.io` (Tier 5)
- All deployed separately on Vercel
- All point to same backend

---

**This architecture allows:**
- ✅ Cost efficiency (one backend)
- ✅ Brand separation (unique URLs/themes)
- ✅ Easy upgrades (tier change unlocks features)
- ✅ Unified data (same database)
- ✅ Scalability (add tiers without new backend)

