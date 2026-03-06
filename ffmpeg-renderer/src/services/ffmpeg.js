const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build and run an FFmpeg command to compose a video from clips, voiceover, and music.
 *
 * @param {object} opts
 * @param {string} opts.workDir - Working directory with downloaded assets
 * @param {Array} opts.clips - Array of { localPath, duration, is_photo, index }
 * @param {string|null} opts.voiceover - Local path to voiceover audio
 * @param {string|null} opts.music - Local path to background music
 * @param {number} opts.width - Output width
 * @param {number} opts.height - Output height
 * @param {string} opts.outputFilename - Output filename
 * @param {Function} opts.onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Path to output file
 */
async function renderVideo({ workDir, clips, voiceover, music, width, height, outputFilename, onProgress }) {
  const outputPath = path.join(workDir, outputFilename);
  const w = width || 1080;
  const h = height || 1920;

  if (!clips || clips.length === 0) {
    throw new Error('No clips provided for rendering');
  }

  // Step 1: Build a concat file for video clips
  // For photos, create a still-image video segment
  const segmentPaths = [];
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const dur = clip.duration || 5;
    const segPath = path.join(workDir, `seg_${i}.mp4`);

    if (clip.is_photo) {
      // Convert photo to video segment with Ken Burns zoom
      await runFFmpeg([
        '-loop', '1',
        '-i', clip.localPath,
        '-t', String(dur),
        '-vf', `scale=${w * 2}:${h * 2},zoompan=z='min(zoom+0.002,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${dur * 25}:s=${w}x${h}:fps=25`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        '-an',
        segPath,
      ]);
    } else {
      // Scale and trim video clip to exact duration and resolution
      await runFFmpeg([
        '-i', clip.localPath,
        '-t', String(dur),
        '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-pix_fmt', 'yuv420p',
        '-an',
        segPath,
      ]);
    }

    segmentPaths.push(segPath);
    if (onProgress) onProgress(Math.round((i + 1) / clips.length * 40));
  }

  // Step 2: Write concat list
  const concatListPath = path.join(workDir, 'concat.txt');
  const concatContent = segmentPaths.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  // Step 3: Concatenate all segments
  const concatPath = path.join(workDir, 'concat.mp4');
  await runFFmpeg([
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-an',
    concatPath,
  ]);
  if (onProgress) onProgress(50);

  // Step 4: Mix audio tracks
  const args = ['-i', concatPath];
  const filterParts = [];
  let audioStreamIdx = 1;

  if (voiceover) {
    args.push('-i', voiceover);
    filterParts.push(`[${audioStreamIdx}:a]aresample=44100,volume=1.0[vo]`);
    audioStreamIdx++;
  }

  if (music) {
    args.push('-i', music);
    filterParts.push(`[${audioStreamIdx}:a]aresample=44100,volume=0.15[bg]`);
    audioStreamIdx++;
  }

  // Build final mix
  if (voiceover && music) {
    filterParts.push('[vo][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]');
    args.push('-filter_complex', filterParts.join(';'));
    args.push('-map', '0:v', '-map', '[aout]');
  } else if (voiceover) {
    args.push('-filter_complex', filterParts.join(';'));
    args.push('-map', '0:v', '-map', '[vo]');
  } else if (music) {
    args.push('-filter_complex', filterParts.join(';'));
    args.push('-map', '0:v', '-map', '[bg]');
  } else {
    // No audio — just copy video
    args.push('-an');
  }

  args.push(
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outputPath,
  );

  await runFFmpeg(args);
  if (onProgress) onProgress(90);

  return outputPath;
}

/**
 * Run an FFmpeg command and return a promise.
 */
function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = execFile('ffmpeg', ['-y', ...args], {
      maxBuffer: 50 * 1024 * 1024,
      timeout: 5 * 60 * 1000, // 5 minute timeout per command
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('[FFmpeg] stderr:', stderr?.slice(-500));
        reject(new Error(`FFmpeg failed: ${error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = { renderVideo };
