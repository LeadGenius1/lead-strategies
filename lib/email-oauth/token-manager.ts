// USER EMAIL OAUTH - Token encryption for Gmail/Outlook credentials
// NOT the login system
import crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.EMAIL_TOKEN_ENCRYPTION_KEY ||
  process.env.EMAIL_ENCRYPTION_KEY ||
  process.env.ENCRYPTION_KEY ||
  'default-dev-key-change-in-production-32ch';
const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
