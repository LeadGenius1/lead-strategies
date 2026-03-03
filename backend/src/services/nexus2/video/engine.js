// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — CORE ORCHESTRATOR
// Tier 1 (Auto) and Tier 2 (Personalized) pipelines.
// Voiceover → Scene Planning → Footage → Music → Render → Upload.
// ═══════════════════════════════════════════════════════════════

const { VIDEO_STATUS, MUSIC_LIBRARY, CLIP_CATALOG, FFMPEG_RENDERER_URL, VIDEO_FORMATS } = require('./constants');
const { generateVoiceover } = require('./voiceover');
const { planScenesAuto, planScenesPersonalized } = require('./scenePlanner');
const { getClipsForScenes } = require('./footage');
const { uploadToR2 } = require('./r2Upload');

const POLL_INTERVAL_MS = 10_000;
const MAX_POLLS = 30; // 5 minutes max

/**
 * Select a music track by mood.
 */
function pickMusic(mood) {
  const match = MUSIC_LIBRARY.find(m => m.mood === mood);
  return match || MUSIC_LIBRARY[0];
}

/**
 * Submit a render job to the FFmpeg renderer and poll until complete.
 *
 * @param {object} renderRequest - Render payload
 * @param {Function} emit - Progress callback
 * @returns {Promise<{ status: string, output_url: string }>}
 */
async function submitAndPollRender(renderRequest, emit) {
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.RENDERING, message: 'Submitting render job...' });

  const submitRes = await fetch(`${FFMPEG_RENDERER_URL}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(renderRequest),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => 'unknown');
    throw new Error(`Render submit failed (${submitRes.status}): ${errText}`);
  }

  const { job_id } = await submitRes.json();
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.RENDERING, message: `Render job ${job_id} submitted, polling...` });

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    const pollRes = await fetch(`${FFMPEG_RENDERER_URL}/render/${job_id}`);
    if (!pollRes.ok) continue;

    const result = await pollRes.json();

    if (result.status === 'completed' || result.status === 'done') {
      return { status: 'completed', output_url: result.output_url };
    }
    if (result.status === 'failed' || result.status === 'error') {
      throw new Error(`Render failed: ${result.error || 'unknown'}`);
    }

    emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.RENDERING, message: `Rendering... (${i + 1}/${MAX_POLLS})` });
  }

  throw new Error('Render timed out after 5 minutes');
}

/**
 * Tier 1 — Fully automated video pipeline.
 *
 * @param {object} opts
 * @param {string} opts.script - Video script
 * @param {string} opts.projectId - Unique project/video ID
 * @param {string} opts.projectName - Display name
 * @param {string} [opts.tone='professional'] - Voice tone
 * @param {string} [opts.industry='general'] - Industry for clip matching
 * @param {string} [opts.format='vertical'] - Video format key
 * @param {Function} opts.emit - Progress callback
 * @returns {Promise<object>} Final result with video URL
 */
async function createAutoVideo({ script, projectId, projectName, tone = 'professional', industry = 'general', format = 'vertical', emit }) {
  const noop = () => {};
  emit = emit || noop;
  const fmt = VIDEO_FORMATS[format] || VIDEO_FORMATS.vertical;

  // 1. Voiceover
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.GENERATING_VOICE, message: 'Generating voiceover...' });
  const voiceover = await generateVoiceover({ text: script, tone, projectId });

  // 2. Scene planning
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.PLANNING_SCENES, message: 'AI planning scenes...' });
  const plan = await planScenesAuto({ script, clips: CLIP_CATALOG, duration: 30 });

  // 3. Footage selection
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.FETCHING_FOOTAGE, message: 'Selecting footage...' });
  const clipAssignments = await getClipsForScenes(plan.scenes, industry);

  // 4. Music
  const music = pickMusic(plan.music_mood);

  // 5. Build render request
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.PROCESSING_MEDIA, message: 'Preparing render...' });
  const renderRequest = {
    project_id: projectId,
    project_name: projectName,
    width: fmt.width,
    height: fmt.height,
    clips: clipAssignments.map(ca => ({
      url: ca.clip.url,
      duration: ca.clip.duration,
    })),
    scenes: plan.scenes.map((scene, i) => ({
      ...scene,
      clip_url: clipAssignments[i]?.clip?.url || CLIP_CATALOG[0].url,
    })),
    voiceover_url: voiceover.url || null,
    music_url: music.url,
    output_filename: `${projectId}_auto.mp4`,
  };

  // 6. Submit and poll render
  const renderResult = await submitAndPollRender(renderRequest, emit);

  // 7. Upload final video to R2
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.UPLOADING, message: 'Uploading final video...' });
  let finalUrl = renderResult.output_url;

  // If renderer returns a URL we can fetch, re-upload to our R2 bucket
  if (finalUrl && !finalUrl.includes('r2.dev')) {
    try {
      const videoRes = await fetch(finalUrl);
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      finalUrl = await uploadToR2(`videos/${projectId}_auto.mp4`, videoBuffer, 'video/mp4');
    } catch (err) {
      console.warn('[Engine] R2 re-upload failed, using renderer URL:', err.message);
    }
  }

  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.COMPLETE, message: 'Video complete!' });

  return {
    status: VIDEO_STATUS.COMPLETE,
    videoUrl: finalUrl,
    voiceover,
    scenes: plan.scenes,
    music,
    format: fmt,
  };
}

/**
 * Tier 2 — Personalized video pipeline with user photos + template.
 *
 * @param {object} opts
 * @param {string} opts.script - Video script
 * @param {string} opts.projectId - Unique project/video ID
 * @param {string} opts.projectName - Display name
 * @param {Array}  opts.photos - User-uploaded photo URLs
 * @param {object} opts.template - Template from VIDEO_TEMPLATES
 * @param {string} [opts.tone='warm'] - Voice tone
 * @param {Function} opts.emit - Progress callback
 * @returns {Promise<object>} Final result with video URL
 */
async function createPersonalizedVideo({ script, projectId, projectName, photos, template, tone = 'warm', emit }) {
  const noop = () => {};
  emit = emit || noop;

  // 1. Voiceover
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.GENERATING_VOICE, message: 'Generating voiceover...' });
  const voiceover = await generateVoiceover({ text: script, tone, projectId });

  // 2. Scene planning with template
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.PLANNING_SCENES, message: 'AI planning personalized scenes...' });
  const plan = await planScenesPersonalized({ script, photos, template, duration: 30 });

  // 3. Fill gaps with stock footage for scenes without photos
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.FETCHING_FOOTAGE, message: 'Preparing media...' });
  const scenesNeedingClips = plan.scenes.filter(s => s.photo_index === null || s.photo_index === undefined);
  const stockFills = scenesNeedingClips.length > 0
    ? await getClipsForScenes(scenesNeedingClips, template.industries?.[0] || 'general')
    : [];

  // 4. Music
  const music = pickMusic(plan.music_mood);

  // 5. Build render request
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.PROCESSING_MEDIA, message: 'Preparing render...' });

  let fillIdx = 0;
  const renderScenes = plan.scenes.map(scene => {
    if (scene.photo_index !== null && scene.photo_index !== undefined && photos[scene.photo_index]) {
      return { ...scene, clip_url: photos[scene.photo_index], is_photo: true };
    }
    const fill = stockFills[fillIdx++];
    return { ...scene, clip_url: fill?.clip?.url || CLIP_CATALOG[0].url, is_photo: false };
  });

  const renderRequest = {
    project_id: projectId,
    project_name: projectName,
    width: 1080,
    height: 1920,
    clips: renderScenes.map(s => ({
      url: s.clip_url,
      duration: s.end_time - s.start_time,
      is_photo: s.is_photo || false,
    })),
    scenes: renderScenes,
    voiceover_url: voiceover.url || null,
    music_url: music.url,
    output_filename: `${projectId}_personalized.mp4`,
  };

  // 6. Submit and poll render
  const renderResult = await submitAndPollRender(renderRequest, emit);

  // 7. Upload to R2
  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.UPLOADING, message: 'Uploading final video...' });
  let finalUrl = renderResult.output_url;

  if (finalUrl && !finalUrl.includes('r2.dev')) {
    try {
      const videoRes = await fetch(finalUrl);
      const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
      finalUrl = await uploadToR2(`videos/${projectId}_personalized.mp4`, videoBuffer, 'video/mp4');
    } catch (err) {
      console.warn('[Engine] R2 re-upload failed, using renderer URL:', err.message);
    }
  }

  emit({ type: 'VIDEO_PROGRESS', status: VIDEO_STATUS.COMPLETE, message: 'Video complete!' });

  return {
    status: VIDEO_STATUS.COMPLETE,
    videoUrl: finalUrl,
    voiceover,
    scenes: plan.scenes,
    music,
    template: template.id,
  };
}

module.exports = { createAutoVideo, createPersonalizedVideo, submitAndPollRender };
