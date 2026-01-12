# Backend Implementation Files - Email Verification

This document lists all the files you need to create/modify in your backend repository to implement email verification.

## Files to Create/Modify

### 1. Prisma Schema Migration
**File:** `prisma/schema.prisma`
**Action:** Add fields to User model and create EmailVerificationToken model

### 2. Token Utilities
**File:** `src/utils/emailVerification.js`
**Action:** Create new file with token generation/hashing functions

### 3. Email Service Update
**File:** `src/services/emailService.js`
**Action:** Add `sendVerificationEmail` function

### 4. Auth Routes Update
**File:** `src/routes/auth.js`
**Action:** Modify signup, add verify-email and resend-verification endpoints

### 5. Middleware Update (if needed)
**File:** `src/middleware/auth.js`
**Action:** Update `/me` endpoint to include emailVerified field

---

## Implementation Steps

1. **Update Prisma Schema** - Add email verification fields
2. **Run Migration** - `npx prisma migrate dev --name add_email_verification`
3. **Create Token Utilities** - Generate and hash tokens
4. **Update Email Service** - Add verification email function
5. **Update Auth Routes** - Modify signup, add verify endpoints
6. **Test** - Test the complete flow

---

## Environment Variables Needed

```env
FRONTEND_URL=https://leadsite.ai
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@leadsite.ai
```

All implementation code is provided in `BACKEND_IMPLEMENTATION_GUIDE.md`.
