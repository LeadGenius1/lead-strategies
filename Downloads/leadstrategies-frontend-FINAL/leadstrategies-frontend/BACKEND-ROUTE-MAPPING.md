# Backend Route Mapping - Frontend to Backend

## ✅ Backend IS Deployed!

**Repository:** `LeadGenius1/lead-strategies-backend`  
**Status:** Online at `api.leadsite.ai`  
**Latest Commit:** 2026-01-14

---

## 🔄 Route Mapping Required

The backend routes exist but use different paths than the frontend expects. Here's the mapping:

### Frontend → Backend Route Mapping

| Frontend Expects | Backend Provides | Status |
|------------------|-------------------|--------|
| `/api/prospects` | `/api/leads` | ❌ Mismatch |
| `/api/prospects/:id` | `/api/leads/:id` | ❌ Mismatch |
| `/api/prospects/:id/send-email` | ❌ Not implemented | ❌ Missing |
| `/api/prospects/search` | ❌ Not implemented | ❌ Missing |
| `/api/crm/deals` | `/api/ultralead/deals` | ❌ Mismatch |
| `/api/crm/deals/:id` | `/api/ultralead/deals/:id` | ❌ Mismatch |
| `/api/calls` | `/api/ultralead/calls` | ❌ Mismatch |
| `/api/calls/make` | `/api/ultralead/calls/initiate` | ❌ Mismatch |
| `/api/inbox/messages` | `/api/conversations` | ❌ Mismatch |
| `/api/inbox/messages/:id/reply` | `/api/conversations/:id/messages` | ❌ Mismatch |
| `/api/users/active` | ❌ Not implemented | ❌ Missing |
| `/api/users/:userId` | ❌ Not implemented | ❌ Missing |
| `/api/users/profile` | ❌ Not implemented | ❌ Missing |
| `/api/users/password` | ❌ Not implemented | ❌ Missing |
| `/api/campaigns/daily-status` | ❌ Not implemented | ❌ Missing |
| `/api/ai/generate-email` | ❌ Not implemented | ❌ Missing |
| `/api/campaigns/schedule` | ❌ Not implemented | ❌ Missing |
| `/api/campaigns/status` | ❌ Not implemented | ❌ Missing |
| `/api/websites/:id/prospects` | ❌ Not implemented | ❌ Missing |

---

## ✅ Working Routes (No Changes Needed)

- ✅ `/api/auth/signup` → `/api/auth/signup` ✓
- ✅ `/api/auth/login` → `/api/auth/login` ✓
- ✅ `/api/auth/me` → `/api/auth/me` ✓
- ✅ `/api/campaigns` → `/api/campaigns` ✓
- ✅ `/api/campaigns/:id` → `/api/campaigns/:id` ✓
- ✅ `/api/websites` → `/api/websites` ✓

---

## 🔧 Solution Options

### Option 1: Update Frontend Routes (Quick Fix)
Update frontend to use backend routes:
- `/api/prospects` → `/api/leads`
- `/api/crm/deals` → `/api/ultralead/deals`
- `/api/calls` → `/api/ultralead/calls`
- `/api/inbox/messages` → `/api/conversations`

### Option 2: Add Backend Route Aliases (Better UX)
Add route aliases in backend `src/index.js`:
```javascript
// Add after existing routes
app.use('/api/prospects', leadRoutes);  // Alias for /api/leads
app.use('/api/crm', ultraleadRoutes);     // Alias for /api/ultralead
app.use('/api/calls', ultraleadCallsRoutes); // Alias for /api/ultralead/calls
app.use('/api/inbox', conversationRoutes); // Alias for /api/conversations
```

### Option 3: Implement Missing Endpoints
Add the missing endpoints to backend:
- User management endpoints
- Prospect search
- AI email generation
- Campaign scheduling
- Daily status

---

## 🚀 Recommended Action Plan

1. **Immediate Fix:** Update frontend to use existing backend routes
2. **Short-term:** Add route aliases in backend for better compatibility
3. **Long-term:** Implement missing endpoints

---

## 📝 Detailed Route Comparison

### Prospects vs Leads
**Frontend:** `/api/prospects`  
**Backend:** `/api/leads`  
**Action:** Update frontend OR add alias in backend

### CRM Deals
**Frontend:** `/api/crm/deals`  
**Backend:** `/api/ultralead/deals`  
**Note:** Backend requires Tier 5 (UltraLead) subscription  
**Action:** Update frontend OR add alias, check tier access

### Calls
**Frontend:** `/api/calls`  
**Backend:** `/api/ultralead/calls`  
**Note:** Backend requires Tier 5 (UltraLead) subscription  
**Action:** Update frontend OR add alias, check tier access

### Inbox
**Frontend:** `/api/inbox/messages`  
**Backend:** `/api/conversations`  
**Note:** Backend structure is different (conversations vs messages)  
**Action:** Update frontend to use conversations API

---

## ⚠️ Important Notes

1. **Tier Restrictions:**
   - `/api/ultralead/*` routes require Tier 5 (UltraLead)
   - Frontend should check user tier before calling these routes

2. **Authentication:**
   - All routes require authentication
   - Backend uses `authenticate` middleware
   - Frontend sends token in `Authorization: Bearer {token}` header

3. **Response Format:**
   - Backend returns: `{ success: true, data: {...} }`
   - Frontend expects: `{ ... }` or `{ data: {...} }`
   - May need to adjust frontend response handling

---

## ✅ Next Steps

1. Update frontend routes to match backend
2. Test authentication flow
3. Verify tier restrictions work
4. Implement missing endpoints OR update frontend to work without them
