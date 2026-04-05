// src/utils/youtube.js
// YouTube utility functions — used in VideoPlayer and LessonCard

/**
 * Validates that a string is a proper YouTube video ID (11 alphanumeric chars)
 * Prevents malformed embeds from silently breaking the player
 */
export const isValidYouTubeId = (id) => {
  if (!id || typeof id !== 'string') return false
  return /^[a-zA-Z0-9_-]{11}$/.test(id)
}

/**
 * Returns the privacy-enhanced YouTube embed URL
 * - youtube-nocookie.com prevents tracking cookies
 * - rel=0 prevents "related videos" at end
 * - modestbranding=1 reduces YouTube logo presence
 */
export const getEmbedUrl = (id) => {
  if (!isValidYouTubeId(id)) return null
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
}

/**
 * Returns the highest-quality available thumbnail URL for a YouTube video
 * hqdefault = 480×360, always available (maxresdefault may 404 on some videos)
 */
export const getThumbnailUrl = (id) => {
  if (!isValidYouTubeId(id)) return null
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

/**
 * Extracts a YouTube video ID from various URL formats
 * Useful when an admin accidentally pastes a full URL instead of just the ID
 *
 * Handles:
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *   https://youtu.be/dQw4w9WgXcQ
 *   https://youtube.com/embed/dQw4w9WgXcQ
 *   dQw4w9WgXcQ  (already an ID)
 */
export const extractYouTubeId = (input) => {
  if (!input) return null
  // Already an ID
  if (isValidYouTubeId(input)) return input
  // Try extracting from URL
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return null
}
