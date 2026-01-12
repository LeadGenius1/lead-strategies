# 🔒 Secure Routing Architecture with Email Verification

## Overview
This document outlines the secure routing system that connects landing pages → signup → email verification → dashboard seamlessly while maintaining the existing UI design.

## Architecture Flow

```
┌─────────────────┐
│ Landing Page    │
│ (domain-specific)│
└────────┬────────┘
         │ Click "Start Free Trial"
         ↓
┌─────────────────┐
│ Signup Flow     │
│ (Multi-step)    │
└────────┬────────┘
         │ Complete signup
         ↓
┌─────────────────┐
│ Account Created │
│ (Unverified)    │
│ + Email Sent    │
└────────┬────────┘
         │
         ├─→ User clicks email link
         │
         ↓
┌─────────────────┐
│ Verify Email    │
│ (Token check)   │
└────────┬────────┘
         │ Valid token
         ↓
┌─────────────────┐
│ Dashboard       │
│ (Verified only) │
└─────────────────┘
```

## Security Features

### 1. Email Verification
- ✅ Secure token generation (crypto.randomBytes)
- ✅ Token expiration (24 hours)
- ✅ One-time use tokens
- ✅ Rate limiting on verification attempts

### 2. Route Protection
- ✅ Middleware checks verification status
- ✅ Unverified users redirected to verification page
- ✅ Verified users access dashboard
- ✅ Protected routes require both auth + verification

### 3. Token Security
- ✅ Cryptographically secure random tokens
- ✅ Hashed tokens in database
- ✅ Expiration timestamps
- ✅ Single-use tokens (invalidated after use)

## Route Structure

### New Routes
1. **`/verify-email?token=xxx`** - Email verification endpoint
2. **`/verify-pending`** - Show verification pending page
3. **`/verify-success`** - Show verification success page

### Updated Routes
1. **`/signup`** - Creates account, sends verification email, redirects to `/verify-pending`
2. **`/dashboard`** - Requires verified email (middleware check)
3. **`/api/auth/verify`** - Verify token endpoint
4. **`/api/auth/resend-verification`** - Resend verification email

## Database Schema (Backend Required)

```sql
-- User table (existing)
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Implementation Steps

1. ✅ Design architecture (this document)
2. ⏳ Create backend verification API routes
3. ⏳ Create frontend verification pages
4. ⏳ Update signup flow to send verification email
5. ⏳ Update middleware to check verification status
6. ⏳ Update dashboard to require verification
7. ⏳ Test complete flow end-to-end

## Email Template

```html
Subject: Verify Your Email - AI Lead Strategies

Hi {{firstName}},

Welcome to AI Lead Strategies! Please verify your email address to activate your account.

[Verify Email Button] → https://leadsite.ai/verify-email?token={{token}}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
AI Lead Strategies Team
```

## Security Considerations

1. **Token Generation**: Use `crypto.randomBytes(32).toString('hex')` for secure tokens
2. **Token Storage**: Hash tokens in database (bcrypt or SHA-256)
3. **Rate Limiting**: Max 5 verification attempts per hour per email
4. **Expiration**: 24-hour token expiration
5. **Single Use**: Tokens invalidated after successful verification
6. **HTTPS Only**: All verification links use HTTPS
7. **Cookie Security**: HTTP-only, Secure, SameSite=Lax cookies

## User Experience

1. User completes signup → Sees "Check your email" message
2. User receives email → Clicks verification link
3. Token verified → User redirected to dashboard
4. If token expired → User can request new verification email
5. If already verified → User redirected to dashboard

## Error Handling

- **Invalid token**: Show error, offer resend option
- **Expired token**: Show expiration message, offer resend option
- **Already verified**: Redirect to dashboard
- **Rate limit exceeded**: Show message, wait period
- **Network error**: Show retry option
