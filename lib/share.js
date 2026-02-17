/**
 * Social sharing utilities for VideoSite.AI
 */

const SHARE_BASE_URL = 'https://videositeai.com';

/**
 * Generate platform-specific share URLs
 */
export function generateShareLinks(videoId, title, description) {
  const videoUrl = `${SHARE_BASE_URL}/watch/${videoId}`;
  const encodedUrl = encodeURIComponent(videoUrl);
  const encodedText = encodeURIComponent(`${title} - ${description || 'Watch on VideoSite.AI'}`);
  const encodedTitle = encodeURIComponent(title);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
  };
}

/**
 * Get the public watch URL for a video
 */
export function getWatchUrl(videoId) {
  return `${SHARE_BASE_URL}/watch/${videoId}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
