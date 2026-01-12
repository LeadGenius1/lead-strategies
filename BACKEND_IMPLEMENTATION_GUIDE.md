# Backend Email Verification Implementation Guide

This guide provides step-by-step instructions for implementing email verification in the backend.

## Prerequisites

- Backend repository access
- Database access (PostgreSQL)
- Email service configured (SendGrid or AWS SES)
- Node.js/Express backend running

---

## Step 1: Database Schema Changes

### 1.1 Add Columns to Users Table

Run this SQL migration:

```sql
-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
```

### 1.2 Create Email Verification Tokens Table

```sql
-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_verification_expires_at ON email_verification_tokens(expires_at);
```

---

## Step 2: Create Token Utility Functions

Create `src/utils/emailVerification.js`:

```javascript
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

## Step 3: Create Email Service

Create `src/services/emailService.js`:

```javascript
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email verification email
 * @param {string} email - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
async function sendVerificationEmail(email, firstName, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://leadsite.ai'}/verify-email?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@leadsite.ai',
    subject: 'Verify Your Email - AI Lead Strategies',
    html: `
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
    `,
    text: `
Hi ${firstName},

Welcome to AI Lead Strategies! Please verify your email address to activate your account.

Verify your email: ${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
AI Lead Strategies Team
    `,
  };

  try {
    await sgMail.send(msg);
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

**Alternative for AWS SES:**

```javascript
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function sendVerificationEmail(email, firstName, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://leadsite.ai'}/verify-email?token=${token}`;

  const params = {
    Source: process.env.SES_FROM_EMAIL || 'noreply@leadsite.ai',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: 'Verify Your Email - AI Lead Strategies' },
      Body: {
        Html: {
          Data: `... (same HTML as above) ...`,
        },
        Text: {
          Data: `... (same text as above) ...`,
        },
      },
    },
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}
```

---

## Step 4: Modify Signup Endpoint

Update `src/routes/auth.js` (or your signup route):

```javascript
const { generateVerificationToken, hashToken, getTokenExpiration } = require('../utils/emailVerification');
const { sendVerificationEmail } = require('../services/emailService');
const db = require('../config/database'); // Your database connection

router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName, tier, ...otherFields } = req.body;

    // ... existing validation ...

    // Check if user exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with email_verified = false
    const userResult = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, company_name, tier, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING id, email, first_name, last_name, company_name, tier, email_verified`,
      [email, hashedPassword, firstName, lastName, companyName, tier]
    );

    const user = userResult.rows[0];

    // Generate verification token
    const token = generateVerificationToken();
    const tokenHash = await hashToken(token);
    const expiresAt = getTokenExpiration();

    // Store token in database
    await db.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, firstName, token);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user can request resend
    }

    // Generate JWT token (user is logged in but unverified)
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      data: {
        user: {
          ...user,
          emailVerified: false,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

---

## Step 5: Create Verify Email Endpoint

Add to `src/routes/auth.js`:

```javascript
const { compareToken } = require('../utils/emailVerification');

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Verification token is required' });
    }

    // Find token in database
    const tokenResult = await db.query(
      `SELECT evt.*, u.id as user_id, u.email, u.first_name
       FROM email_verification_tokens evt
       JOIN users u ON evt.user_id = u.id
       WHERE evt.used_at IS NULL AND evt.expires_at > NOW()`
    );

    let validToken = null;
    let user = null;

    // Compare token with all active tokens
    for (const row of tokenResult.rows) {
      const isMatch = await compareToken(token, row.token_hash);
      if (isMatch) {
        validToken = row;
        user = {
          id: row.user_id,
          email: row.email,
          firstName: row.first_name,
        };
        break;
      }
    }

    if (!validToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired verification token' 
      });
    }

    // Mark token as used
    await db.query(
      `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
      [validToken.id]
    );

    // Invalidate all other tokens for this user
    await db.query(
      `UPDATE email_verification_tokens 
       SET used_at = NOW() 
       WHERE user_id = $1 AND id != $2 AND used_at IS NULL`,
      [validToken.user_id, validToken.id]
    );

    // Mark user as verified
    await db.query(
      `UPDATE users 
       SET email_verified = true, email_verified_at = NOW() 
       WHERE id = $1`,
      [validToken.user_id]
    );

    // Get updated user data
    const userResult = await db.query(
      `SELECT id, email, first_name, last_name, company_name, tier, email_verified, email_verified_at
       FROM users WHERE id = $1`,
      [validToken.user_id]
    );

    const updatedUser = userResult.rows[0];

    // Generate new JWT token
    const jwtToken = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token: jwtToken,
      data: {
        user: {
          ...updatedUser,
          emailVerified: updatedUser.email_verified,
          emailVerifiedAt: updatedUser.email_verified_at,
        },
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

---

## Step 6: Create Resend Verification Endpoint

Add to `src/routes/auth.js`:

```javascript
router.post('/resend-verification', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user
    const userResult = await db.query(
      `SELECT id, email, first_name, email_verified FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already verified' 
      });
    }

    // Check rate limit (max 3 resends per hour)
    const recentResends = await db.query(
      `SELECT COUNT(*) as count 
       FROM email_verification_tokens 
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [userId]
    );

    if (parseInt(recentResends.rows[0].count) >= 3) {
      return res.status(429).json({ 
        success: false, 
        error: 'Too many requests. Please try again in an hour.' 
      });
    }

    // Invalidate old tokens
    await db.query(
      `UPDATE email_verification_tokens 
       SET used_at = NOW() 
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );

    // Generate new token
    const token = generateVerificationToken();
    const tokenHash = await hashToken(token);
    const expiresAt = getTokenExpiration();

    // Store new token
    await db.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    // Send verification email
    await sendVerificationEmail(user.email, user.first_name, token);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

---

## Step 7: Update /api/auth/me Endpoint

Update your existing `/api/auth/me` endpoint to include `emailVerified`:

```javascript
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.query(
      `SELECT id, email, first_name, last_name, company_name, tier, 
              email_verified, email_verified_at, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          companyName: user.company_name,
          tier: user.tier,
          emailVerified: user.email_verified,
          emailVerifiedAt: user.email_verified_at,
          // ... other user fields ...
        },
        // ... tierLimits, tierFeatures, etc. ...
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
```

---

## Step 8: Environment Variables

Add to your `.env` file:

```env
# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@leadsite.ai

# OR AWS SES
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SES_FROM_EMAIL=noreply@leadsite.ai

# Frontend URL for verification links
FRONTEND_URL=https://leadsite.ai
```

---

## Step 9: Install Required Packages

```bash
npm install @sendgrid/mail bcrypt
# OR for AWS SES
npm install @aws-sdk/client-ses bcrypt
```

---

## Step 10: Testing

Test the complete flow:

1. **Signup**: Create account → Should receive verification email
2. **Verify**: Click link → Should verify and redirect to dashboard
3. **Resend**: Request resend → Should receive new email
4. **Rate Limit**: Try 4 resends → 4th should be blocked
5. **Expired Token**: Wait 24+ hours → Should be rejected
6. **Used Token**: Use same token twice → Second use should fail

---

## Notes

- Tokens are hashed before storage (security best practice)
- Tokens expire after 24 hours
- Rate limiting: Max 3 resends per hour
- Old tokens are invalidated when new ones are generated
- Users can be logged in but unverified (dashboard will check)

---

## Troubleshooting

**Email not sending:**
- Check SendGrid/SES API keys
- Verify sender email is verified in SendGrid/SES
- Check email service logs

**Token not working:**
- Verify token hasn't expired
- Check token hasn't been used
- Verify token hash comparison is working

**Rate limiting issues:**
- Check database query for recent tokens
- Verify timezone settings
