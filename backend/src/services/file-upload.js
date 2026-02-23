const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');

/**
 * File Upload Manager for NEXUS
 * Handles docs, images, PDFs, spreadsheets
 */

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter - only allow specific types
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES ||
    '.pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.webp')
    .split(',')
    .map(t => t.trim());

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '52428800'), // 50MB default
  },
});

/**
 * Save uploaded file to disk
 */
async function saveUploadedFile(file, userId) {
  const uploadDir = path.join(process.cwd(), 'uploads', userId);

  // Create user upload directory if doesn't exist
  await fs.mkdir(uploadDir, { recursive: true });

  const fileId = crypto.randomUUID();
  const ext = path.extname(file.originalname);
  const filename = `${fileId}${ext}`;
  const filepath = path.join(uploadDir, filename);

  // Write file to disk
  await fs.writeFile(filepath, file.buffer);

  return {
    id: fileId,
    filename: file.originalname,
    storedFilename: filename,
    filepath,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Extract text from uploaded file
 */
async function extractTextFromFile(filepath, mimetype) {
  const ext = path.extname(filepath).toLowerCase();

  try {
    switch (ext) {
      case '.txt':
      case '.md':
        return await fs.readFile(filepath, 'utf-8');

      case '.pdf': {
        const pdfParse = require('pdf-parse');
        const pdfBuffer = await fs.readFile(filepath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
      }

      case '.doc':
      case '.docx': {
        const mammoth = require('mammoth');
        const docResult = await mammoth.extractRawText({ path: filepath });
        return docResult.value;
      }

      case '.csv':
        return await fs.readFile(filepath, 'utf-8');

      case '.xlsx': {
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(filepath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_csv(sheet);
      }

      default:
        return null; // Images, etc. - no text extraction
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return null;
  }
}

/**
 * Get file metadata
 */
async function getFileMetadata(filepath) {
  try {
    const stats = await fs.stat(filepath);
    const mimetype = mime.lookup(filepath) || 'application/octet-stream';

    return {
      exists: true,
      size: stats.size,
      mimetype,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Delete uploaded file
 */
async function deleteUploadedFile(filepath) {
  try {
    await fs.unlink(filepath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

module.exports = {
  upload,
  saveUploadedFile,
  extractTextFromFile,
  getFileMetadata,
  deleteUploadedFile,
};
