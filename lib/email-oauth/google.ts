// USER EMAIL OAUTH - For connecting Gmail accounts to SEND emails
// THIS IS NOT THE LOGIN SYSTEM
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

const CLIENT_ID = process.env.EMAIL_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.EMAIL_GOOGLE_REDIRECT_URI ||
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/email-accounts/oauth/google/callback`;

export function getGoogleEmailOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getGoogleEmailAuthUrl(state: string): string {
  const client = getGoogleEmailOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
  });
}

export async function exchangeGoogleEmailCode(code: string) {
  const client = getGoogleEmailOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function refreshGoogleEmailToken(refreshToken: string) {
  const client = getGoogleEmailOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}
