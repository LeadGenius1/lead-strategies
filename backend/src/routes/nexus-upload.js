const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload, saveUploadedFile, extractTextFromFile } = require('../services/file-upload');

/**
 * POST /api/v1/nexus/upload
 * Upload file to NEXUS chat
 * Requires authentication
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user.userId || req.user.id || 'unknown';

    // Save file
    const savedFile = await saveUploadedFile(req.file, String(userId));

    // Extract text if possible
    const extractedText = await extractTextFromFile(
      savedFile.filepath,
      savedFile.mimetype
    );

    return res.json({
      success: true,
      file: {
        id: savedFile.id,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        size: savedFile.size,
        uploadedAt: savedFile.uploadedAt,
        hasText: !!extractedText,
        textPreview: extractedText ? extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '') : null,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);

    // Multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Max size: ${parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '52428800') / 1024 / 1024}MB`,
      });
    }

    return res.status(500).json({
      error: error.message || 'File upload failed',
    });
  }
});

module.exports = router;
