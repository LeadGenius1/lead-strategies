// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — R2 UPLOAD UTILITY
// Reusable Cloudflare R2 upload extracted from videosite.js.
// ═══════════════════════════════════════════════════════════════

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'videosite-videos';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL || 'https://pub-00746658f70a4185a900f207b96d9e3b.r2.dev';

let s3Client = null;

function getS3Client() {
  if (s3Client) return s3Client;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
    console.warn('[VideoR2] Missing R2 credentials — uploads will fail');
    return null;
  }
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY,
      secretAccessKey: R2_SECRET_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return s3Client;
}

/**
 * Upload a buffer to Cloudflare R2 and return the public URL.
 *
 * @param {string} key - Object key (e.g. 'voiceovers/proj123_vo.mp3')
 * @param {Buffer} buffer - File contents
 * @param {string} contentType - MIME type (e.g. 'audio/mpeg')
 * @returns {Promise<string>} Public URL
 */
async function uploadToR2(key, buffer, contentType) {
  const client = getS3Client();
  if (!client) throw new Error('R2 not configured — missing credentials');

  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}

module.exports = { uploadToR2, getS3Client };
