const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { createJob, getJob, updateJob, canAcceptJob, incrementActive, decrementActive } = require('../jobs/store');
const { downloadJobAssets } = require('../services/downloader');
const { renderVideo } = require('../services/ffmpeg');
const { uploadToR2 } = require('../services/r2Upload');

const router = express.Router();

/**
 * POST /render
 * Accept a render job from the main backend.
 *
 * Request body (matches engine.js renderRequest):
 * {
 *   project_id: string,
 *   project_name: string,
 *   width: number,
 *   height: number,
 *   clips: [{ url, duration, is_photo? }],
 *   scenes: [{ start_time, end_time, text, clip_url, ... }],
 *   voiceover_url: string | null,
 *   music_url: string,
 *   output_filename: string
 * }
 *
 * Response: { job_id: string }
 */
router.post('/', (req, res) => {
  const data = req.body;

  if (!data || !data.clips || data.clips.length === 0) {
    return res.status(400).json({ error: 'clips array is required' });
  }

  if (!canAcceptJob()) {
    return res.status(503).json({ error: 'Renderer at capacity — try again shortly' });
  }

  // Normalize clips: ensure every clip has a duration field.
  // Backend may send duration directly, or scenes with start_time/end_time.
  // If clips lack duration, try to compute from matching scene or fall back to 5s.
  const scenes = data.scenes || [];
  data.clips = data.clips.map((clip, i) => {
    if (clip.duration && clip.duration > 0) return clip;
    // Try matching scene by index
    const scene = scenes[i];
    if (scene && typeof scene.start_time === 'number' && typeof scene.end_time === 'number') {
      return { ...clip, duration: scene.end_time - scene.start_time };
    }
    // Fall back to 5 seconds
    return { ...clip, duration: 5 };
  });

  // Normalize scenes: ensure every scene has a duration field
  data.scenes = scenes.map((scene) => {
    if (scene.duration && scene.duration > 0) return scene;
    if (typeof scene.start_time === 'number' && typeof scene.end_time === 'number') {
      return { ...scene, duration: scene.end_time - scene.start_time };
    }
    return { ...scene, duration: 5 };
  });

  const jobId = uuidv4();
  createJob(jobId, data);

  // Start processing asynchronously
  processJob(jobId, data);

  res.json({ job_id: jobId });
});

/**
 * GET /render/:id
 * Poll job status.
 *
 * Response: { status, progress, output_url, error }
 */
router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({
    status: job.status,
    progress: job.progress,
    output_url: job.output_url,
    error: job.error,
  });
});

/**
 * Process a render job end-to-end.
 * Runs async — does not block the request.
 */
async function processJob(jobId, data) {
  incrementActive();
  let workDir = null;

  try {
    updateJob(jobId, { status: 'processing', progress: 5 });

    // 1. Download all source files
    console.log(`[Job ${jobId}] Downloading assets...`);
    const assets = await downloadJobAssets(jobId, data);
    workDir = assets.workDir;
    updateJob(jobId, { progress: 20 });

    if (assets.clips.length === 0) {
      throw new Error('No clips could be downloaded');
    }

    // 2. Run FFmpeg render
    console.log(`[Job ${jobId}] Rendering video (${data.width}x${data.height}, ${assets.clips.length} clips)...`);
    const outputPath = await renderVideo({
      workDir: assets.workDir,
      clips: assets.clips,
      voiceover: assets.voiceover,
      music: assets.music,
      width: data.width,
      height: data.height,
      outputFilename: data.output_filename || `${jobId}.mp4`,
      onProgress: (pct) => {
        // Map ffmpeg progress (0-90) to overall progress (20-85)
        const overall = 20 + Math.round(pct * 0.72);
        updateJob(jobId, { progress: overall });
      },
    });

    updateJob(jobId, { progress: 88 });

    // 3. Upload to R2
    console.log(`[Job ${jobId}] Uploading to R2...`);
    const r2Key = `videos/${data.output_filename || `${jobId}.mp4`}`;
    let outputUrl;
    try {
      outputUrl = await uploadToR2(outputPath, r2Key, 'video/mp4');
    } catch (err) {
      console.error(`[Job ${jobId}] R2 upload failed:`, err.message);
      throw new Error(`R2 upload failed: ${err.message}`);
    }

    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      output_url: outputUrl,
    });

    console.log(`[Job ${jobId}] Complete: ${outputUrl}`);
  } catch (err) {
    console.error(`[Job ${jobId}] Failed:`, err.message);
    updateJob(jobId, {
      status: 'failed',
      error: err.message,
    });
  } finally {
    decrementActive();
    // Clean up temp files
    if (workDir) {
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

module.exports = router;
