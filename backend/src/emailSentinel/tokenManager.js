// Token decryption for SMTP credentials (port from lib/email-oauth/token-manager)
const crypto = require('crypto');

const ENCRYPTION_KEY =
  process.env.EMAIL_TOKEN_ENCRYPTION_KEY ||
  process.env.EMAIL_ENCRYPTION_KEY ||
  process.env.ENCRYPTION_KEY ||
  'default-dev-key-change-in-production-32ch';

function getKey() {
  if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
}

function decryptToken(encryptedToken) {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { decryptToken };
