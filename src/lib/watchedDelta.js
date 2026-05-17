// Compute the delta between a post's current state and the user's last snapshot.
// Returns null when there's no snapshot (e.g. unwatched), or a summary otherwise.

export function computeWatchedDelta(post, snapshot) {
  if (!post || !snapshot) {
    return { hasChanges: false, votesDelta: 0, commentsDelta: 0, verdictChanged: false }
  }

  const currentVotes = post.votes || 0
  const currentCommentCount = post.comments?.length || 0

  let currentTop = null
  if (post.type === 'question' && post.comments?.length) {
    currentTop = post.comments.reduce(
      (max, c) => ((c.votes || 0) > (max?.votes || 0) ? c : max),
      null
    )
  }

  const votesDelta = currentVotes - snapshot.votes
  const commentsDelta = currentCommentCount - snapshot.commentCount
  const verdictChanged = snapshot.topCommentId
    ? currentTop?.id !== snapshot.topCommentId
    : false

  const hasChanges = votesDelta !== 0 || commentsDelta !== 0 || verdictChanged

  return {
    hasChanges,
    votesDelta,
    commentsDelta,
    verdictChanged,
    currentTopAnswerText: currentTop?.text || null,
    currentTopAnswerAuthor: currentTop?.author || null,
    snapshotTakenAt: snapshot.takenAt
  }
}

// Human-readable "time since snapshot" — "2h", "3d", "just now"
export function formatTimeSince(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}
