# Microsoft OAuth Setup — Email Sending (NOT Login)

## Step 1: Register a New App in Azure Portal

1. Go to https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
2. Click **+ New registration**
3. Name: **AI Lead Strategies - Email Sending**
4. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
5. Redirect URI:
   - Platform: **Web**
   - URI: `https://aileadstrategies.com/api/user/email-accounts/oauth/microsoft/callback`
6. Click **Register**
7. Copy the **Application (client) ID**

## Step 2: Create Client Secret

1. Go to **Certificates & secrets** → **+ New client secret**
2. Description: "Email Sending Secret"
3. Expiry: 24 months
4. Click **Add**
5. Copy the **Value** (NOT the Secret ID)

## Step 3: Add API Permissions

1. Go to **API permissions** → **+ Add a permission**
2. Select **Microsoft Graph** → **Delegated permissions**
3. Add:
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `User.Read`
   - `offline_access`
4. Click **Grant admin consent** (if you're admin)

## Step 4: Update Railway Environment Variables

```bash
railway variables set EMAIL_MICROSOFT_CLIENT_ID=<application-client-id>
railway variables set EMAIL_MICROSOFT_CLIENT_SECRET=<client-secret-value>
```
