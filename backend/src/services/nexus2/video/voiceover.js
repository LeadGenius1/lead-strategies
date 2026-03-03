// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — VOICEOVER SERVICE
// ElevenLabs TTS → R2 upload. Graceful skip if API key unset.
// ═══════════════════════════════════════════════════════════════

const { VOICE_PRESETS } = require('./constants');
const { uploadToR2 } = require('./r2Upload');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

/**
 * Generate voiceover audio via ElevenLabs and upload to R2.
 *
 * @param {object} opts
 * @param {string} opts.text - Script text to narrate
 * @param {string} [opts.tone='professional'] - Voice tone key from VOICE_PRESETS
 * @param {string} opts.projectId - Used in the R2 key
 * @returns {Promise<{ status: string, url?: string, voice?: string, size?: number }>}
 */
async function generateVoiceover({ text, tone = 'professional', projectId }) {
  if (!ELEVENLABS_API_KEY) {
    console.warn('[Voiceover] ELEVENLABS_API_KEY not set — skipping voiceover');
    return { status: 'skipped', url: null, voice: null, size: 0 };
  }

  const preset = VOICE_PRESETS[tone] || VOICE_PRESETS.professional;

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${preset.id}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'unknown');
    throw new Error(`ElevenLabs API error ${res.status}: ${errBody}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const key = `voiceovers/${projectId}_vo.mp3`;
  const url = await uploadToR2(key, buffer, 'audio/mpeg');

  return { status: 'generated', url, voice: preset.name, size: buffer.length };
}

module.exports = { generateVoiceover };
