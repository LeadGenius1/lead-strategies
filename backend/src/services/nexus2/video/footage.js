// ═══════════════════════════════════════════════════════════════
// VIDEO CREATION ENGINE — STOCK FOOTAGE SERVICE
// R2 catalog tag-matching + Pexels API fallback.
// ═══════════════════════════════════════════════════════════════

const { CLIP_CATALOG } = require('./constants');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

/**
 * Score catalog clips against scene descriptions using tag overlap.
 *
 * @param {string[]} descriptions - Scene description keywords
 * @returns {Array<{ clip: object, score: number }>} Sorted best-first
 */
function findCatalogClips(descriptions) {
  const keywords = descriptions
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return CLIP_CATALOG
    .map(clip => {
      const score = clip.tags.reduce((acc, tag) => {
        return acc + (keywords.some(kw => tag.includes(kw) || kw.includes(tag)) ? 1 : 0);
      }, 0);
      return { clip, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Fetch video clips from Pexels API.
 * Graceful no-op if PEXELS_API_KEY is not set.
 *
 * @param {string} query - Search query
 * @param {number} [count=3] - Number of clips to fetch
 * @returns {Promise<Array<{ id: string, url: string, duration: number, tags: string[] }>>}
 */
async function fetchPexelsClips(query, count = 3) {
  if (!PEXELS_API_KEY) {
    return [];
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${count}&size=medium`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.videos || []).map(v => ({
      id: `pexels-${v.id}`,
      url: v.video_files?.[0]?.link || '',
      duration: v.duration || 10,
      tags: [query],
    }));
  } catch (err) {
    console.warn('[Footage] Pexels API error:', err.message);
    return [];
  }
}

/**
 * Get the best clip for each scene — catalog first, Pexels fallback.
 *
 * @param {Array} scenes - Scene plan from scenePlanner
 * @param {string} [industry='general'] - Industry context for Pexels queries
 * @returns {Promise<Array<{ scene_number: number, clip: object }>>}
 */
async function getClipsForScenes(scenes, industry = 'general') {
  const results = [];

  for (const scene of scenes) {
    const description = scene.text || scene.template_scene || '';
    const ranked = findCatalogClips([description, industry]);

    if (ranked.length > 0 && ranked[0].score > 0) {
      results.push({ scene_number: scene.scene_number, clip: ranked[0].clip });
    } else {
      // Pexels fallback
      const pexelsClips = await fetchPexelsClips(`${description} ${industry}`, 1);
      if (pexelsClips.length > 0) {
        results.push({ scene_number: scene.scene_number, clip: pexelsClips[0] });
      } else {
        // Last resort: use the first catalog clip
        results.push({ scene_number: scene.scene_number, clip: CLIP_CATALOG[0] });
      }
    }
  }

  return results;
}

module.exports = { findCatalogClips, fetchPexelsClips, getClipsForScenes };
