/**
 * Keyword-based similarity matching for duplicate detection.
 * MVP approach — upgrade to Supabase pgvector for semantic similarity later.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up',
  'its', 'it', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we',
  'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them'
])

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word))
}

function calculateSimilarity(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0
  const set2 = new Set(keywords2)
  const matches = keywords1.filter(word => set2.has(word))
  return matches.length / Math.max(keywords1.length, keywords2.length)
}

/**
 * Find posts similar to the given text.
 * @param {string} inputText - The user's draft text
 * @param {Array} existingPosts - Array of existing posts to compare against
 * @param {number} threshold - Similarity threshold (0-1), default 0.3
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Array} Matching posts sorted by similarity score
 */
export function findSimilarPosts(inputText, existingPosts, threshold = 0.3, maxResults = 3) {
  if (!inputText || inputText.length < 10) return []

  const inputKeywords = extractKeywords(inputText)
  if (inputKeywords.length === 0) return []

  const scored = existingPosts
    .map(post => {
      const postText = `${post.title} ${post.description || ''}`
      const postKeywords = extractKeywords(postText)
      const score = calculateSimilarity(inputKeywords, postKeywords)
      return { ...post, similarityScore: score }
    })
    .filter(post => post.similarityScore >= threshold)
    .sort((a, b) => b.similarityScore - a.similarityScore)

  return scored.slice(0, maxResults)
}
