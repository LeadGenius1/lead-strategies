// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — LEAD HUNTER FILE PROCESSOR
// Extracts text from uploaded files, stores in R2, saves metadata.
// ═══════════════════════════════════════════════════════════════

const path = require('path');
const { prisma } = require('../../../config/database');
const { uploadToR2 } = require('../video/r2Upload');

const MAX_EXTRACTED_TEXT = 50000;

/**
 * Extract text from a file buffer based on extension.
 * Reuses extraction patterns from file-upload.js.
 */
async function extractText(buffer, originalname) {
  const ext = path.extname(originalname).toLowerCase();

  try {
    switch (ext) {
      case '.txt':
      case '.md':
        return buffer.toString('utf-8');

      case '.csv':
        return buffer.toString('utf-8');

      case '.pdf': {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      }

      case '.doc':
      case '.docx': {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }

      case '.xlsx': {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_csv(sheet);
      }

      default:
        return null; // Images etc — no text extraction
    }
  } catch (err) {
    console.error('[FileProcessor] Text extraction error:', err.message);
    return null;
  }
}

/**
 * Process an uploaded file: extract text, upload to R2, save to DB.
 * @param {{ buffer: Buffer, originalname: string, mimetype: string, size: number }} file - Multer file
 * @param {string} userId
 * @param {string} [sessionId]
 * @returns {Promise<{ fileId: string, filename: string, extractedText: string|null, r2Url: string }>}
 */
async function processFile(file, userId, sessionId) {
  // Extract text from document
  let extractedText = await extractText(file.buffer, file.originalname);

  // Truncate if exceeds limit
  let truncated = false;
  if (extractedText && extractedText.length > MAX_EXTRACTED_TEXT) {
    extractedText = extractedText.substring(0, MAX_EXTRACTED_TEXT);
    truncated = true;
  }

  // Create DB record first to get the ID
  const record = await prisma.leadHunterFile.create({
    data: {
      userId,
      sessionId: sessionId || null,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      r2Key: '', // Placeholder, updated after upload
      r2Url: '',
      extractedText,
      metadata: truncated ? { truncated: true, originalLength: extractedText.length } : null,
    },
  });

  // Upload to R2
  const ext = path.extname(file.originalname);
  const r2Key = `assistant-files/${userId}/${record.id}${ext}`;

  let r2Url = '';
  try {
    r2Url = await uploadToR2(r2Key, file.buffer, file.mimetype);
  } catch (err) {
    console.warn('[FileProcessor] R2 upload failed (continuing without):', err.message);
    r2Url = `r2-unavailable://${r2Key}`;
  }

  // Update record with R2 info
  await prisma.leadHunterFile.update({
    where: { id: record.id },
    data: { r2Key, r2Url },
  });

  return {
    fileId: record.id,
    filename: file.originalname,
    extractedText,
    r2Url,
    truncated,
  };
}

/**
 * Get file records for a user, optionally filtered by IDs.
 */
async function getFiles(userId, fileIds) {
  const where = { userId };
  if (fileIds?.length) {
    where.id = { in: fileIds };
  }
  return prisma.leadHunterFile.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      filename: true,
      mimetype: true,
      size: true,
      extractedText: true,
      createdAt: true,
    },
  });
}

/**
 * Get all files for a session (auto-loads file context without explicit fileIds).
 */
async function getSessionFiles(userId, sessionId) {
  if (!sessionId) return [];
  return prisma.leadHunterFile.findMany({
    where: { userId, sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      filename: true,
      mimetype: true,
      size: true,
      extractedText: true,
      createdAt: true,
    },
  });
}

module.exports = { processFile, getFiles, getSessionFiles, extractText };
