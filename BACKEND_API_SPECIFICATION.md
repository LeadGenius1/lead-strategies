# Backend API Specification - Email Verification

## Required Backend Endpoints

### 1. POST `/api/auth/signup` (Modified)

**Current Behavior:** Creates user account and returns JWT token immediately.

**New Behavior:** Creates user account, sends verification email, returns JWT token (user remains unverified).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "tier": "leadsite-ai",
  "industry": "saas",
  "companySize": "1-10",
  "currentTools": "HubSpot, Mailchimp"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false,
      "tier": 1,
      ...
    }
  }
}
```

**Backend Actions:**
1. Validate input
2. Check if email already exists
3. Hash password
4. Create user with `email_verified = false`
5. Generate verification token (crypto.randomBytes(32).toString('hex'))
6. Store token hash in `email_verification_tokens` table
7. Send verification email (via SendGrid/SES)
8. Return JWT token (user can be logged in but cannot access dashboard until verified)

---

### 2. GET `/api/auth/verify-email?token=xxx` (NEW)

**Purpose:** Verify email address using token from email link.

**Query Parameters:**
- `token` (required): Verification token from email

**Response (Success):**
```json
{
  "success": true,
  "token": "new_jwt_token_here",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "emailVerified": true,
      "emailVerifiedAt": "2025-01-11T12:00:00Z",
      ...
    }
  }
}
```

**Response (Error - Invalid Token):**
```json
{
  "success": false,
  "error": "Invalid verification token"
}
```

**Response (Error - Expired):**
```json
{
  "success": false,
  "error": "Verification token has expired"
}
```

**Backend Actions:**
1. Hash the provided token
2. Find token in `email_verification_tokens` table
3. Check if token exists and not used
4. Check if token hasn't expired (24 hours)
5. Mark token as used (`used_at = NOW()`)
6. Update user: `email_verified = true`, `email_verified_at = NOW()`
7. Delete or mark all other tokens for this user as expired
8. Generate new JWT token
9. Return token and user data

---

### 3. POST `/api/auth/resend-verification` (NEW)

**Purpose:** Resend verification email to user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "User already verified" | "Rate limit exceeded" | "Failed to send email"
}
```

**Backend Actions:**
1. Verify JWT token
2. Get user from token
3. Check if user is already verified → return error
4. Check rate limit (max 3 resends per hour)
5. Invalidate old tokens for this user
6. Generate new verification token
7. Store token hash
8. Send verification email
9. Return success

---

### 4. GET `/api/auth/me` (Modified)

**Current Behavior:** Returns user data.

**New Behavior:** Returns user data including `emailVerified` status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "emailVerifiedAt": "2025-01-11T12:00:00Z",
      "tier": 1,
      ...
    },
    "tierLimits": {...},
    "tierFeatures": {...}
  }
}
```

---

## Database Schema Changes

### 1. Users Table
```sql
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN email_verified_at TIMESTAMP;
```

### 2. Email Verification Tokens Table (NEW)
```sql
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
);
```

---

## Email Service Integration

### Email Template
```
Subject: Verify Your Email - AI Lead Strategies

Hi {{firstName}},

Welcome to AI Lead Strategies! Please verify your email address to activate your account.

[Verify Email] → https://leadsite.ai/verify-email?token={{token}}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
AI Lead Strategies Team
```

### SendGrid/SES Integration
- Use existing email service (SendGrid or AWS SES)
- Send transactional email with verification link
- Include token in URL query parameter
- Use HTML email template

---

## Security Requirements

1. **Token Generation:**
   - Use `crypto.randomBytes(32).toString('hex')` (64-character hex string)
   - Hash tokens before storing in database (SHA-256 or bcrypt)

2. **Token Expiration:**
   - 24-hour expiration
   - Clean up expired tokens periodically (cron job)

3. **Rate Limiting:**
   - Max 3 resend requests per hour per user
   - Max 5 verification attempts per hour per token

4. **Token Security:**
   - Single-use tokens (invalidated after use)
   - Tokens cannot be reused
   - Old tokens invalidated when new one is generated

5. **Error Messages:**
   - Don't reveal if email exists or not
   - Generic error messages for security

---

## Implementation Priority

1. **Phase 1: Database Schema** (1 hour)
   - Add columns to users table
   - Create email_verification_tokens table

2. **Phase 2: Token Generation** (1 hour)
   - Create token generation utility
   - Create token hashing utility

3. **Phase 3: Signup Endpoint** (2 hours)
   - Modify signup to create unverified user
   - Generate and store token
   - Send verification email

4. **Phase 4: Verify Endpoint** (2 hours)
   - Create verify-email endpoint
   - Validate token
   - Update user status
   - Return new JWT

5. **Phase 5: Resend Endpoint** (1 hour)
   - Create resend-verification endpoint
   - Rate limiting
   - Send new email

6. **Phase 6: Email Service** (2 hours)
   - Create email template
   - Integrate SendGrid/SES
   - Test email delivery

**Total Estimated Time: 9 hours**

---

## Testing Checklist

- [ ] User can signup and receive verification email
- [ ] Verification link works and verifies user
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] Resend verification email works
- [ ] Rate limiting works (max 3 resends/hour)
- [ ] Unverified users cannot access dashboard
- [ ] Verified users can access dashboard
- [ ] Email template renders correctly
- [ ] Tokens are properly hashed in database
