# 3-Click Seamless Onboarding Experience

## Overview

A simple, intuitive 3-click journey that takes users from signup to AI-powered lead generation in under 2 minutes.

## The 3-Click Journey

### Click 1: Sign Up on Landing Page
**Page:** Landing page → Signup page

**User Action:**
- User clicks "Start Free Trial" or "Sign Up" on landing page
- Fills out basic signup form (name, email, password, tier selection)
- Clicks "Create Account" button

**What Happens:**
- Account created with JWT token
- User redirected to onboarding page
- Progress: Step 1/3 complete ✓

### Click 2: Complete Onboarding Form
**Page:** `/onboarding`

**User Action:**
- Fills out business profile:
  - Company name
  - Industry
  - Services/Products offered
  - Service area/location
  - Target market
  - Optional: Website, phone, lead goals, budget
- Clicks "Complete Setup & Go to Dashboard" button

**What Happens:**
- Business profile saved to user account
- AI agent receives context for prospect targeting
- User redirected to dashboard
- Progress: Step 2/3 complete ✓

### Click 3: Start AI Agent
**Page:** `/dashboard`

**User Action:**
- Sees personalized welcome: "Welcome back, [FirstName]! 👋"
- Sees pulsating "START AI AGENT" button with glow effect
- Clicks the START button

**What Happens:**
- AI agent activated
- Begins analyzing user's business profile
- Starts fetching ideal prospects based on:
  - Industry
  - Services offered
  - Target market
  - Location
- Button changes to "AI Agent Active" with green indicator
- Welcome message appears confirming activation
- Progress: Step 3/3 complete ✓

## User Experience Flow

```
Landing Page
    ↓ (Click: Sign Up)
Signup Form
    ↓ (Click: Create Account)
Onboarding Form
    ↓ (Click: Complete Setup)
Dashboard
    ↓ (Click: START AI AGENT)
AI Agent Active → Finding Prospects
```

## Visual Elements

### Onboarding Page
- **Progress indicator**: 3 steps with current step highlighted
- **Step 1**: ✓ Sign Up (green checkmark)
- **Step 2**: 2 (purple, pulsating - current)
- **Step 3**: 3 (gray - upcoming)

### Dashboard - Before Start
- **Welcome message**: "Welcome back, [FirstName]! 👋"
- **Start button**: 
  - Large, prominent button
  - Gradient: purple to pink
  - Pulsating glow effect
  - Text: "🚀 START AI AGENT"
- **Info card**: Explains what AI agent will do
  - 🎯 Finds ideal prospects
  - ✍️ Writes personalized emails
  - 📤 Sends daily at 8 AM

### Dashboard - After Start
- **Welcome message**: Same personalized greeting
- **Status indicator**: "AI Agent Active" (green with pulse)
- **Daily Email Status**: Shows prospect discovery progress
- **Stats**: Begin populating with real data

## Technical Implementation

### Files Created/Modified

1. **`app/onboarding/page.js`** (NEW)
   - Onboarding form component
   - Business profile collection
   - Progress indicator

2. **`app/(auth)/signup/page.js`** (MODIFIED)
   - Redirects to `/onboarding` instead of `/dashboard`

3. **`app/(dashboard)/dashboard/page.js`** (MODIFIED)
   - Added welcome message with user first name
   - Added pulsating START AI AGENT button
   - Added AI agent activation handler
   - Shows different UI based on agent status

4. **`app/api/users/onboarding/route.js`** (NEW)
   - Saves onboarding data to user profile
   - Proxies to backend or provides fallback

5. **`app/api/ai-agent/start/route.js`** (NEW)
   - Activates AI agent
   - Triggers prospect discovery
   - Returns activation status

6. **`app/globals.css`** (MODIFIED)
   - Added pulsating glow animation

## Platform-Specific Behavior

### LeadSite.AI
- Focus: Email lead generation
- AI Agent finds prospects via email discovery
- Generates email campaigns

### LeadSite.IO
- Focus: Website builder + leads
- AI Agent finds prospects needing websites
- Generates website leads

### ClientContact.IO
- Focus: Multi-channel outreach
- AI Agent finds prospects across 22+ channels
- Generates omnichannel campaigns

## AI Agent Functionality

When user clicks START:

1. **Immediate:**
   - Button changes to "Starting..."
   - Toast notification: "AI Agent activated!"

2. **Background Processing:**
   - AI analyzes user's business profile
   - Searches for ideal prospects matching:
     - Industry
     - Services
     - Location
     - Target market
   - Scores prospects (1-10 scale)
   - Selects top 50 prospects

3. **Daily Schedule:**
   - Runs every night at midnight
   - Finds 50 new prospects
   - Generates personalized emails
   - Schedules for 8 AM delivery

4. **User Dashboard:**
   - Shows daily status
   - Displays prospect count
   - Shows email statistics
   - Provides campaign insights

## Success Metrics

- ✅ **3 clicks** from landing to AI activation
- ✅ **Under 2 minutes** total time
- ✅ **Zero confusion** - clear progress indicators
- ✅ **Immediate value** - AI starts working immediately
- ✅ **Personalized** - uses user's first name
- ✅ **Visual feedback** - pulsating button, animations

## User Benefits

1. **Simple**: Just 3 clicks to get started
2. **Fast**: Complete setup in under 2 minutes
3. **Clear**: Progress indicators show where they are
4. **Engaging**: Pulsating button creates urgency
5. **Personalized**: Greeted by first name
6. **Immediate**: AI starts working right away

## Next Steps After Activation

1. User sees "AI Agent Active" status
2. Daily email status widget shows progress
3. Prospects start appearing in dashboard
4. User receives email notifications
5. Can manage campaigns, prospects, and settings

## Testing Checklist

- [ ] Sign up flow redirects to onboarding
- [ ] Onboarding form saves data correctly
- [ ] Dashboard shows user first name
- [ ] START button has pulsating glow
- [ ] Clicking START activates AI agent
- [ ] Button changes to "AI Agent Active"
- [ ] Toast notifications appear
- [ ] Works for LeadSite.AI tier
- [ ] Works for LeadSite.IO tier
- [ ] Works for ClientContact.IO tier
