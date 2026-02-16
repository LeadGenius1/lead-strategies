// USER EMAIL OAUTH - For connecting Outlook accounts to SEND emails
// THIS IS NOT THE LOGIN SYSTEM
import { ConfidentialClientApplication } from '@azure/msal-node';

const SCOPES = [
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/Mail.ReadWrite',
  'https://graph.microsoft.com/User.Read',
  'offline_access',
];

const CLIENT_ID = process.env.EMAIL_MICROSOFT_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_MICROSOFT_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.EMAIL_MICROSOFT_REDIRECT_URI ||
  process.env.MICROSOFT_REDIRECT_URI ||
  `${process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://aileadstrategies.com' : 'http://localhost:3000')}/api/user/email-accounts/oauth/microsoft/callback`;

const msalConfig = {
  auth: {
    clientId: CLIENT_ID!,
    clientSecret: CLIENT_SECRET!,
    authority: 'https://login.microsoftonline.com/common',
  },
};

export function getMicrosoftEmailOAuthClient() {
  return new ConfidentialClientApplication(msalConfig);
}

export async function getMicrosoftEmailAuthUrl(state: string): Promise<string> {
  const client = getMicrosoftEmailOAuthClient();
  const authUrl = await client.getAuthCodeUrl({
    scopes: SCOPES,
    redirectUri: REDIRECT_URI!,
    state,
  });
  return authUrl || '';
}

export async function exchangeMicrosoftEmailCode(code: string) {
  const client = getMicrosoftEmailOAuthClient();
  const result = await client.acquireTokenByCode({
    code,
    scopes: SCOPES,
    redirectUri: REDIRECT_URI!,
  });
  return result;
}
