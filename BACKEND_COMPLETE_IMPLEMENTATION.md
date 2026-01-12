# Complete Backend Implementation - Email Verification

This document contains all the code you need to implement email verification in your backend.

---

## 1. Prisma Schema Update

**File:** `prisma/schema.prisma`

Add to the `User` model:

```prisma
model User {
  // ... existing fields ...
  
  // Email Verification
  emailVerified   Boolean?  @default(false) @map("email_verified")
  emailVerifiedAt DateTime? @map("email_verified_at")
  
  // ... existing relations ...
  
  // Add this relation:
  emailVerificationTokens EmailVerificationToken[]
}
```

Add new model at the end of the file:

```prisma
// ==================== EMAIL VERIFICATION ====================

model EmailVerificationToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  tokenHash String   @unique @map("token_hash")
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([expiresAt])
  @@map("email_verification_tokens")
}
```

**After updating schema, run:**
```bash
npx prisma migrate dev --name add_email_verification
npx prisma generate
```

---

## 2. Create Token Utilities

**File:** `src/utils/emailVerification.js` (NEW FILE)

```javascript
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a secure random verification token
 * @returns {string} 64-character hexadecimal token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a verification token for storage
 * @param {string} token - Plain text token
 * @returns {Promise<string>} Hashed token
 */
async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

/**
 * Compare a plain token with a hashed token
 * @param {string} token - Plain text token
 * @param {string} hashedToken - Hashed token from database
 * @returns {Promise<boolean>} True if tokens match
 */
async function compareToken(token, hashedToken) {
  return bcrypt.compare(token, hashedToken);
}

/**
 * Calculate token expiration (24 hours from now)
 * @returns {Date} Expiration date
 */
function getTokenExpiration() {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

module.exports = {
  generateVerificationToken,
  hashToken,
  compareToken,
  getTokenExpiration,
};
```

---

## 3. Create Email Verification Helper

**File:** `src/utils/emailVerificationEmail.js` (NEW FILE)

Create a helper function that uses the existing email service:

```javascript
const { sendEmail } = require('../services/emailService');

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
async function sendVerificationEmail(email, firstName, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://leadsite.ai';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #a855f7; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hi ${firstName},</h2>
        <p>Welcome to AI Lead Strategies! Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <div class="footer">
          <p>© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hi ${firstName},

Welcome to AI Lead Strategies! Please verify your email address to activate your account.

Verify your email: ${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
AI Lead Strategies Team
  `;

  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - AI Lead Strategies',
      text: textContent,
      html: htmlContent,
    });
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
};
```

**Then in auth.js, import from this file instead:**
```javascript
const { sendVerificationEmail } = require('../utils/emailVerificationEmail');
```

---

## 4. Update Auth Routes

**File:** `src/routes/auth.js`

**4.1 Add imports at the top:**

```javascript
const { generateVerificationToken, hashToken, compareToken, getTokenExpiration } = require('../utils/emailVerification');
const { sendVerificationEmail } = require('../services/emailService');
```

**4.2 Modify the signup route:**

Replace the existing `/signup` route with this:

```javascript
// Signup
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      name, 
      company, 
      firstName,
      lastName,
      companyName,
      tier = 1 
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Map tier name to tier number if needed
    let tierNumber = parseInt(tier);
    if (isNaN(tierNumber) && typeof tier === 'string') {
      tierNumber = TIER_MAP[tier.toLowerCase()] || 1;
    }
    if (!tierNumber || tierNumber < 1 || tierNumber > 5) {
      tierNumber = 1;
    }

    // Build name and company from available fields
    const userName = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || email.split('@')[0]);
    const userCompany = company || companyName || '';

    if (!userName) {
      return res.status(400).json({ error: 'Name is required (provide name or firstName/lastName)' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with email_verified = false
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: userName,
        company: userCompany,
        tier: tierNumber,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        emailVerified: false, // NEW: User starts unverified
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        tier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        emailVerified: true,
        createdAt: true
      }
    });

    // Generate verification token
    const token = generateVerificationToken();
    const tokenHash = await hashToken(token);
    const expiresAt = getTokenExpiration();

    // Store token in database
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      }
    });

    // Send verification email
    try {
      const firstName = firstName || userName.split(' ')[0] || 'User';
      await sendVerificationEmail(email, firstName, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user can request resend
    }

    // Generate token (user is logged in but unverified)
    const jwtToken = generateToken(user.id, user.tier);

    res.status(201).json({
      success: true,
      token: jwtToken,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          tier: user.tier,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        },
        subscription: {
          tier: TIER_LIMITS[user.tier]?.name?.toLowerCase().replace(/\./g, '-') || 'leadsite-ai',
          features: TIER_FEATURES[user.tier] || []
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});
```

**4.3 Add verify-email endpoint (NEW):**

Add this after the login route:

```javascript
// Verify Email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Verification token is required' });
    }

    // Find all active (unused, not expired) tokens
    const tokens = await prisma.emailVerificationToken.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true
          }
        }
      }
    });

    // Compare token with all active tokens
    let validToken = null;
    for (const dbToken of tokens) {
      const isMatch = await compareToken(token, dbToken.tokenHash);
      if (isMatch) {
        validToken = dbToken;
        break;
      }
    }

    if (!validToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired verification token' 
      });
    }

    // Check if user is already verified
    if (validToken.user.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already verified' 
      });
    }

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: validToken.id },
      data: { usedAt: new Date() }
    });

    // Invalidate all other tokens for this user
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: validToken.userId,
        id: { not: validToken.id },
        usedAt: null
      },
      data: { usedAt: new Date() }
    });

    // Mark user as verified
    const updatedUser = await prisma.user.update({
      where: { id: validToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        tier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true
      }
    });

    // Generate new JWT token
    const jwtToken = generateToken(updatedUser.id, updatedUser.tier);

    res.json({
      success: true,
      token: jwtToken,
      data: {
        user: {
          ...updatedUser,
          emailVerified: updatedUser.emailVerified,
          emailVerifiedAt: updatedUser.emailVerifiedAt,
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});
```

**4.4 Add resend-verification endpoint (NEW):**

Add this after the verify-email route:

```javascript
// Resend Verification Email
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already verified' 
      });
    }

    // Check rate limit (max 3 resends per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentResends = await prisma.emailVerificationToken.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo
        }
      }
    });

    if (recentResends >= 3) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many requests. Please try again in an hour.' 
      });
    }

    // Invalidate old tokens
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null
      },
      data: { usedAt: new Date() }
    });

    // Generate new token
    const token = generateVerificationToken();
    const tokenHash = await hashToken(token);
    const expiresAt = getTokenExpiration();

    // Store new token
    await prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      }
    });

    // Send verification email
    const firstName = user.name?.split(' ')[0] || 'User';
    await sendVerificationEmail(user.email, firstName, token);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
  }
});
```

**4.5 Update /me endpoint:**

Find the `/me` route and ensure it includes `emailVerified`:

```javascript
// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    // req.user should already have emailVerified if middleware is updated
    // If not, fetch user from database:
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        tier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        tierLimits: req.tierLimits,
        tierFeatures: req.tierFeatures
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});
```

---

## 5. Update Middleware (if needed)

**File:** `src/middleware/auth.js`

Update the `authenticate` middleware to include `emailVerified` in `req.user`:

```javascript
// In the authenticate middleware, when fetching user:
const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  select: {
    id: true,
    email: true,
    name: true,
    company: true,
    tier: true,
    subscriptionStatus: true,
    trialEndsAt: true,
    emailVerified: true,  // ADD THIS
    emailVerifiedAt: true, // ADD THIS
    // ... other fields
  }
});

req.user = {
  ...user,
  emailVerified: user.emailVerified,
  emailVerifiedAt: user.emailVerifiedAt,
};
```

---

## 6. Environment Variables

Add to `.env`:

```env
FRONTEND_URL=https://leadsite.ai
SENDGRID_FROM_EMAIL=noreply@leadsite.ai
# SENDGRID_API_KEY should already exist
```

---

## 7. Testing Checklist

- [ ] Run Prisma migration successfully
- [ ] Signup creates user with emailVerified=false
- [ ] Verification email is sent after signup
- [ ] Clicking verification link verifies user
- [ ] Resend verification works
- [ ] Rate limiting works (max 3/hour)
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] /me endpoint returns emailVerified status

---

## Summary

This implementation adds:
1. ✅ Database schema for email verification
2. ✅ Token generation and hashing utilities
3. ✅ Email service function for verification emails
4. ✅ Signup endpoint that sends verification email
5. ✅ Verify-email endpoint
6. ✅ Resend-verification endpoint
7. ✅ Updated /me endpoint with emailVerified field

All security best practices are followed:
- Tokens are hashed before storage
- 24-hour expiration
- Single-use tokens
- Rate limiting (3 resends/hour)
- Secure token generation (crypto.randomBytes)
