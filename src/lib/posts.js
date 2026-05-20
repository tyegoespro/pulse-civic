// ============================================================================
// Live-data adapter — translates between Supabase row shape and the local
// app-state shape that every component already consumes. The goal is to keep
// PostCard, CommentsModal, etc. unchanged: they keep reading `post.votes`,
// `post.userVote`, `post.comments[*].votes`, etc.
// ============================================================================

import {
  supabase,
  fetchMyVotes,
  fetchMyCommentVotes,
  fetchMyWatched,
  voteOnPost as sbVoteOnPost,
  voteOnComment as sbVoteOnComment,
  createComment as sbCreateComment,
  startWatching as sbStartWatching,
  stopWatching as sbStopWatching
} from './supabase'

// ---------------------------------------------------------------------------
// SHAPE CONVERSION
// ---------------------------------------------------------------------------

const formatRelative = (iso) => {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - t)
  const m = 60_000, h = 60 * m, d = 24 * h
  if (diff < m) return 'Just now'
  if (diff < h) return `${Math.floor(diff / m)}m ago`
  if (diff < d) return `${Math.floor(diff / h)}h ago`
  return `${Math.floor(diff / d)}d ago`
}

const rowToComment = (row, userVote) => {
  const profile = row.profiles || null
  const displayName = row.is_incognito
    ? 'Anonymous'
    : (profile?.display_name || row.seed_author || 'Anonymous')
  return {
    id: row.id,
    author: displayName,
    // Incognito comments aren't tappable; non-incognito ones expose user_id so
    // the existing authorId-based profile click flow works in live mode too.
    authorId: row.is_incognito ? null : (row.user_id || null),
    authorAvatar: row.is_incognito ? null : (profile?.avatar || null),
    text: row.text,
    timestamp: new Date(row.created_at).getTime(),
    incognito: !!row.is_incognito,
    votes: row.vote_count || 0,
    userVote: userVote || 0
  }
}

const rowToPost = (row, userVote, comments) => {
  const profile = row.profiles || null
  const displayName = row.is_incognito
    ? null
    : (profile?.display_name || row.seed_author || 'Anonymous')
  return {
    id: row.id,
    type: row.type || 'statement',
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location_label,
    scope: row.scope || 'local',
    votes: row.vote_count || 0,
    userVote: userVote || 0,
    comments: comments || [],
    incognito: !!row.is_incognito,
    author: displayName,
    // authorId is the click-through target for the author chip. Incognito
    // posts shouldn't link to anyone; seed posts have no user_id so they
    // also stay non-clickable (matches demo-mode behavior).
    authorId: row.is_incognito ? null : (row.user_id || null),
    authorVerified: profile?.is_verified ?? true,
    authorAvatar: profile?.avatar || null,
    createdAt: formatRelative(row.created_at),
    createdAtTs: new Date(row.created_at).getTime(),
    userId: row.user_id,
    media: row.media || [],
    impact: row.impact || null,
    lat: row.lat,
    lng: row.lng
  }
}

// ---------------------------------------------------------------------------
// LOAD
// ---------------------------------------------------------------------------

// Loads all posts (both scopes) + the user's votes + comment votes + every
// comment for the visible posts. One round of parallel reads.
export const loadLivePosts = async (userId) => {
  if (!supabase) return []

  const [postsRes, votesRes, cVotesRes] = await Promise.all([
    supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(display_name, avatar, is_verified)')
      .order('created_at', { ascending: false })
      .limit(500),
    userId ? fetchMyVotes(userId) : Promise.resolve({ data: [] }),
    userId ? fetchMyCommentVotes(userId) : Promise.resolve({ data: [] })
  ])

  const postRows = postsRes?.data || []
  if (postRows.length === 0) return []

  const myVotes = Object.fromEntries((votesRes?.data || []).map(v => [v.post_id, v.direction]))
  const myCommentVotes = Object.fromEntries((cVotesRes?.data || []).map(v => [v.comment_id, v.direction]))

  // Bulk-fetch comments across all visible posts.
  const postIds = postRows.map(r => r.id)
  const { data: commentRows } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(display_name, avatar, is_verified)')
    .in('post_id', postIds)
    .order('vote_count', { ascending: false })

  const commentsByPost = {}
  for (const c of (commentRows || [])) {
    const arr = commentsByPost[c.post_id] || (commentsByPost[c.post_id] = [])
    arr.push(rowToComment(c, myCommentVotes[c.id]))
  }

  return postRows.map(r => rowToPost(r, myVotes[r.id], commentsByPost[r.id]))
}

// Load watched state (ids + snapshots) shaped to match the existing app.
export const loadLiveWatched = async (userId) => {
  if (!supabase || !userId) return { ids: [], snapshots: {} }
  const { data } = await fetchMyWatched(userId) || {}
  const rows = data || []
  const ids = rows.map(r => r.post_id)
  const snapshots = {}
  for (const r of rows) {
    snapshots[r.post_id] = {
      votes: r.snapshot_votes || 0,
      commentCount: r.snapshot_comment_count || 0,
      topCommentId: r.snapshot_top_comment_id || null,
      topCommentVotes: r.snapshot_top_comment_votes || 0,
      takenAt: new Date(r.taken_at).getTime()
    }
  }
  return { ids, snapshots }
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

// Vote on a post via the RPC (atomic toggle). Returns the resulting userVote.
export const liveVotePost = async (postId, direction) => {
  const res = await sbVoteOnPost(postId, direction)
  if (res?.error) throw res.error
  return res?.data ?? 0
}

export const liveVoteComment = async (commentId, direction) => {
  const res = await sbVoteOnComment(commentId, direction)
  if (res?.error) throw res.error
  return res?.data ?? 0
}

// Insert a new post and return it in local shape.
export const liveCreatePost = async (post, userId) => {
  if (!supabase) return null
  const row = {
    user_id: userId,
    type: post.type || 'statement',
    scope: post.scope || 'local',
    title: post.title,
    description: post.description,
    category: post.category,
    location_label: post.location || null,
    lat: post.lat ?? null,
    lng: post.lng ?? null,
    is_incognito: !!post.incognito,
    media: post.media && post.media.length ? post.media : null,
    impact: post.impact || null
  }
  const { data, error } = await supabase
    .from('posts')
    .insert([row])
    .select('*, profiles!posts_user_id_fkey(display_name, avatar, is_verified)')
    .single()
  if (error) throw error
  // Author voted +1 on their own post for parity with local behavior. Best-effort.
  try { await sbVoteOnPost(data.id, 1) } catch {}
  return rowToPost(data, 1, [])
}

// Insert a comment (used for both Statement comments and Question answers).
// For Question Pulses, auto-upvote the author's answer (parity with local UX).
export const liveAddComment = async ({ postId, text, userId, incognito, isQuestion }) => {
  if (!supabase) return null
  const { data, error } = await sbCreateComment({
    post_id: postId,
    user_id: userId,
    text,
    is_incognito: !!incognito
  })
  if (error) throw error

  let userVote = 0
  if (isQuestion) {
    try {
      userVote = await liveVoteComment(data.id, 1)
    } catch {
      // non-fatal — vote can be retried by the user
    }
  }

  // Refetch with the profile join so author display_name is populated.
  const { data: full } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(display_name, avatar, is_verified)')
    .eq('id', data.id)
    .single()

  return rowToComment(full || data, userVote)
}

// Watch/unwatch — snapshot is captured server-side by startWatching helper.
export const liveStartWatching = async (postId, userId) => {
  await sbStartWatching(postId, userId)
}

export const liveStopWatching = async (postId, userId) => {
  await sbStopWatching(postId, userId)
}
