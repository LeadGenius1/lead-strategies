# OAuth Authentication Setup Guide

This guide explains how to configure OAuth authentication for Google, Microsoft, and LinkedIn on the LeadSite.ai platform.

## Overview

The platform supports social authentication via:
- **Google OAuth 2.0**
- **Microsoft OAuth 2.0** (Azure AD)
- **LinkedIn OAuth 2.0**

## Frontend Implementation

The frontend OAuth flow is implemented using Next.js API routes:
- `/api/auth/oauth/google` - Initiates Google OAuth
- `/api/auth/oauth/microsoft` - Initiates Microsoft OAuth
- `/api/auth/oauth/linkedin` - Initiates LinkedIn OAuth
- `/api/auth/oauth/callback` - Handles OAuth callbacks

## Required Environment Variables

Add these environment variables to your Railway frontend service:

### Frontend Environment Variables

```bash
# Frontend URL (for OAuth redirects)
NEXT_PUBLIC_FRONTEND_URL=https://leadsite.ai

# OAuth Client IDs (public, can be exposed)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
MICROSOFT_CLIENT_ID=your-microsoft-client-id
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

### Backend Environment Variables

The backend needs these additional variables (client secrets should NEVER be exposed to frontend):

```bash
# OAuth Client Secrets (private, backend only)
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Setting Up OAuth Providers

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Name**: LeadSite.ai
   - **Authorized JavaScript origins**: 
     - `https://leadsite.ai`
     - `http://localhost:3000` (for development)
   - **Authorized redirect URIs**:
     - `https://leadsite.ai/api/auth/oauth/callback?provider=google`
     - `http://localhost:3000/api/auth/oauth/callback?provider=google` (for development)
6. Copy the **Client ID** and **Client Secret**

### 2. Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: LeadSite.ai
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Platform: Web
     - URI: `https://leadsite.ai/api/auth/oauth/callback?provider=microsoft`
5. After creation, go to **Certificates & secrets**
6. Create a new **Client secret** and copy it
7. Copy the **Application (client) ID**

### 3. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Configure:
   - **App name**: LeadSite.ai
   - **LinkedIn Page**: Your company page
   - **Privacy policy URL**: `https://leadsite.ai/privacy`
   - **App logo**: Upload your logo
4. Under **Auth** tab:
   - **Authorized redirect URLs**:
     - `https://leadsite.ai/api/auth/oauth/callback?provider=linkedin`
     - `http://localhost:3000/api/auth/oauth/callback?provider=linkedin` (for development)
5. Request access to these products:
   - **Sign In with LinkedIn using OpenID Connect**
   - **Email Address** (if needed)
6. Copy the **Client ID** and **Client Secret** from the **Auth** tab

## Backend Implementation

The backend needs to implement the OAuth callback endpoint:

### Required Backend Endpoint

**POST** `/api/auth/oauth/callback`

**Request Body:**
```json
{
  "provider": "google" | "microsoft" | "linkedin",
  "code": "authorization_code_from_provider",
  "redirectUri": "https://leadsite.ai/api/auth/oauth/callback?provider=google",
  "tier": "leadsite-ai" | "leadsite-io" | "clientcontact" | "tackle"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      ...
    }
  }
}
```

### Backend OAuth Flow

1. Receive authorization code from frontend
2. Exchange code for access token with provider
3. Fetch user profile from provider using access token
4. Create or update user in database
5. Generate JWT token
6. Return token and user data

### Example Backend Implementation (Node.js/Express)

```javascript
// POST /api/auth/oauth/callback
app.post('/api/auth/oauth/callback', async (req, res) => {
  const { provider, code, redirectUri, tier } = req.body
  
  try {
    let userProfile
    
    // Exchange code for token and get user profile
    switch (provider) {
      case 'google':
        userProfile = await exchangeGoogleCode(code, redirectUri)
        break
      case 'microsoft':
        userProfile = await exchangeMicrosoftCode(code, redirectUri)
        break
      case 'linkedin':
        userProfile = await exchangeLinkedInCode(code, redirectUri)
        break
      default:
        return res.status(400).json({ success: false, message: 'Invalid provider' })
    }
    
    // Find or create user
    let user = await User.findOne({ email: userProfile.email })
    
    if (!user) {
      // Create new user
      user = await User.create({
        email: userProfile.email,
        name: userProfile.name,
        oauthProvider: provider,
        oauthId: userProfile.id,
        subscriptionTier: tier,
        // ... other fields
      })
    } else {
      // Update existing user
      user.oauthProvider = provider
      user.oauthId = userProfile.id
      await user.save()
    }
    
    // Generate JWT token
    const token = generateJWT(user)
    
    res.json({
      success: true,
      token,
      data: { user }
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.status(500).json({ success: false, message: 'OAuth authentication failed' })
  }
})
```

## Testing OAuth

1. **Local Development:**
   - Set `NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000`
   - Ensure redirect URIs include `http://localhost:3000/api/auth/oauth/callback?provider=...`

2. **Production:**
   - Set `NEXT_PUBLIC_FRONTEND_URL=https://leadsite.ai`
   - Ensure redirect URIs match exactly in provider settings

3. **Test Flow:**
   - Click "Continue with Google/Microsoft/LinkedIn" on signup/login page
   - Should redirect to provider's login page
   - After authentication, should redirect back to `/dashboard`
   - User should be logged in with JWT token stored in cookie

## Troubleshooting

### "OAuth is not configured" Error
- Check that environment variables are set in Railway
- Verify variable names match exactly (case-sensitive)
- Restart Railway service after adding variables

### Redirect URI Mismatch
- Ensure redirect URIs in provider settings match exactly (including protocol, domain, path, query params)
- Check for trailing slashes or extra characters

### Backend Connection Error
- Verify backend is deployed and accessible
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend `/api/auth/oauth/callback` endpoint exists

### Token Not Set
- Check browser console for errors
- Verify cookie settings (secure, sameSite)
- Check that backend returns token in response

## Security Considerations

1. **Client Secrets**: Never expose client secrets to frontend. They should only exist in backend environment variables.

2. **State Parameter**: The OAuth flow uses a state parameter to prevent CSRF attacks. Always validate the state on callback.

3. **HTTPS**: Always use HTTPS in production for OAuth redirects.

4. **Token Storage**: JWT tokens are stored in cookies with appropriate security flags (httpOnly, secure, sameSite).

5. **Scope Limitation**: Request only necessary scopes from OAuth providers (email, profile).

## Next Steps

1. Set up OAuth applications with each provider
2. Add environment variables to Railway frontend and backend
3. Implement backend OAuth callback endpoint
4. Test OAuth flow end-to-end
5. Monitor for errors and adjust as needed
