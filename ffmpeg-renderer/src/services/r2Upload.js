const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'videosite';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-08746658f70a4185a980f297b96d9e3b.r2.dev';

let s3Client = null;

function getClient() {
  if (s3Client) return s3Client;
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn('[R2] Missing credentials — uploads will fail');
    return null;
  }
  s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return s3Client;
}

/**
 * Upload a local file to R2 and return the public URL.
 */
async function uploadToR2(localPath, key, contentType) {
  const client = getClient();
  if (!client) throw new Error('R2 not configured — missing credentials');

  const body = fs.readFileSync(localPath);

  await client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return `${R2_PUBLIC_URL}/${key}`;
}

module.exports = { uploadToR2 };
