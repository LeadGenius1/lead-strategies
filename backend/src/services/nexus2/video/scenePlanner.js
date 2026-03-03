// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — SCENE PLANNER
// Uses Claude to break a script into timed scenes with clip
// assignments (Tier 1) or photo/template layouts (Tier 2).
// ═══════════════════════════════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk');
const { CLIP_CATALOG } = require('./constants');

let client = null;

function getClient() {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Parse JSON from Claude response, stripping markdown fences if present.
 */
function parseJSON(text) {
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Tier 1 — Auto scene planning with stock clips.
 *
 * @param {object} opts
 * @param {string} opts.script - Video script text
 * @param {Array}  opts.clips  - Available clip catalog
 * @param {number} [opts.duration=30] - Target video duration in seconds
 * @returns {Promise<{ scenes: Array, music_mood: string }>}
 */
async function planScenesAuto({ script, clips = CLIP_CATALOG, duration = 30 }) {
  const clipSummary = clips.map((c, i) => `${i}: [${c.tags.join(', ')}] (${c.duration}s)`).join('\n');

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a video editor AI. Break this script into timed scenes for a ${duration}-second video.

Available stock clips (index: [tags] (duration)):
${clipSummary}

Script:
${script}

Return ONLY valid JSON (no markdown, no explanation):
{
  "scenes": [
    {
      "scene_number": 1,
      "clip_index": 0,
      "start_time": 0,
      "end_time": 8,
      "text": "overlay text for this scene",
      "text_position": "center",
      "animation": "fade-in"
    }
  ],
  "music_mood": "upbeat"
}

Rules:
- Scenes must cover the full ${duration}s with no gaps
- Each scene's duration must not exceed its clip's duration
- text_position: "top", "center", or "bottom"
- animation: "fade-in", "slide-up", "zoom-in", or "none"
- music_mood: "upbeat", "calm", "energetic", "inspiring", "warm", "bold", "professional", or "friendly"`,
    }],
  });

  const text = response.content[0].text;
  return parseJSON(text);
}

/**
 * Tier 2 — Personalized scene planning with user photos + template.
 *
 * @param {object} opts
 * @param {string} opts.script - Video script text
 * @param {Array}  opts.photos - User-uploaded photo URLs
 * @param {object} opts.template - Template from VIDEO_TEMPLATES
 * @param {number} [opts.duration=30] - Target video duration in seconds
 * @returns {Promise<{ scenes: Array, music_mood: string }>}
 */
async function planScenesPersonalized({ script, photos, template, duration = 30 }) {
  const photoList = photos.map((url, i) => `${i}: ${url}`).join('\n');
  const sceneList = template.scenes.join(', ');

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a video editor AI. Plan scenes for a ${duration}-second "${template.name}" video.

Template scene flow: ${sceneList}

User photos (index: url):
${photoList}

Script:
${script}

Return ONLY valid JSON (no markdown, no explanation):
{
  "scenes": [
    {
      "scene_number": 1,
      "photo_index": 0,
      "start_time": 0,
      "end_time": 8,
      "text": "overlay text for this scene",
      "text_position": "center",
      "animation": "fade-in",
      "template_scene": "before-shot"
    }
  ],
  "music_mood": "inspiring"
}

Rules:
- Follow the template scene flow: ${sceneList}
- Scenes must cover the full ${duration}s with no gaps
- Assign photos to appropriate scenes (photo_index)
- Scenes without a matching photo should use photo_index: null (stock footage will fill)
- text_position: "top", "center", or "bottom"
- animation: "fade-in", "slide-up", "zoom-in", or "none"
- music_mood: "upbeat", "calm", "energetic", "inspiring", "warm", "bold", "professional", or "friendly"`,
    }],
  });

  const text = response.content[0].text;
  return parseJSON(text);
}

module.exports = { planScenesAuto, planScenesPersonalized };
