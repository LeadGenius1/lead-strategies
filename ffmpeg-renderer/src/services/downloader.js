const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

/**
 * Download a file from a URL to a local path.
 * Returns the local path on success, null on failure.
 */
async function downloadFile(url, destPath) {
  if (!url) return null;

  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}): ${url}`);
  }

  const fileStream = fs.createWriteStream(destPath);
  await pipeline(res.body, fileStream);
  return destPath;
}

/**
 * Download all source files for a render job.
 * Returns paths object with local file locations.
 */
async function downloadJobAssets(jobId, renderData) {
  const workDir = path.join('/tmp', 'render', jobId);
  fs.mkdirSync(workDir, { recursive: true });

  const paths = { workDir, clips: [], voiceover: null, music: null };

  // Download clips/photos
  const clips = renderData.clips || [];
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    if (!clip.url) continue;
    const ext = clip.is_photo ? '.jpg' : '.mp4';
    const localPath = path.join(workDir, `clip_${i}${ext}`);
    try {
      await downloadFile(clip.url, localPath);
      paths.clips.push({ ...clip, localPath, index: i });
    } catch (err) {
      console.error(`[Download] clip ${i} failed:`, err.message);
    }
  }

  // Download voiceover
  if (renderData.voiceover_url) {
    const voPath = path.join(workDir, 'voiceover.mp3');
    try {
      await downloadFile(renderData.voiceover_url, voPath);
      paths.voiceover = voPath;
    } catch (err) {
      console.error('[Download] voiceover failed:', err.message);
    }
  }

  // Download music
  if (renderData.music_url) {
    const musicPath = path.join(workDir, 'music.mp3');
    try {
      await downloadFile(renderData.music_url, musicPath);
      paths.music = musicPath;
    } catch (err) {
      console.error('[Download] music failed:', err.message);
    }
  }

  return paths;
}

module.exports = { downloadFile, downloadJobAssets };
