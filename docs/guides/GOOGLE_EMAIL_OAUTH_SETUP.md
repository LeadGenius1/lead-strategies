# Google OAuth Setup — Email Sending (NOT Login)

This is for connecting Gmail accounts to SEND emails through the platform.
This is SEPARATE from the existing Google Login OAuth.

## Step 1: Create a New OAuth Client in Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your existing project (or create a new one for email sending)
3. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
4. Application type: **Web application**
5. Name: **AI Lead Strategies - Email Sending** (clearly different from login)
6. Under **Authorized redirect URIs**, add:
   ```
   https://aileadstrategies.com/api/user/email-accounts/oauth/google/callback
   ```
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

## Step 2: Enable Gmail API

1. Go to https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Click **Enable**

## Step 3: Configure OAuth Consent Screen (if not done)

1. Go to https://console.cloud.google.com/apis/credentials/consent
2. User Type: External
3. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
4. Add test users while in testing mode

## Step 4: Update Railway Environment Variables

```bash
railway variables set EMAIL_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
railway variables set EMAIL_GOOGLE_CLIENT_SECRET=GOCSPX-<your-secret>
```

## Important Notes

- This is a SEPARATE OAuth client from your login OAuth
- The redirect URI is different: `/api/user/email-accounts/oauth/google/callback` (NOT `/api/auth/oauth/callback`)
- The scopes are different: `gmail.send` (NOT just `openid profile email`)
