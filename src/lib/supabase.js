import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Returns null gracefully when env vars aren't set, so dev/demo still runs.
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => !!supabase

// ============================================================================
// AUTH
// ============================================================================

export const signInWithGoogle = () =>
  supabase?.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })

export const signInWithMagicLink = (email) =>
  supabase?.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  })

export const signOut = () => supabase?.auth.signOut()

export const getSession = () => supabase?.auth.getSession()
export const getUser = () => supabase?.auth.getUser()

// Subscribe to auth state changes. Returns the subscription so the caller can unsubscribe.
export const onAuthChange = (callback) =>
  supabase?.auth.onAuthStateChange((_event, session) => callback(session?.user || null))

// ============================================================================
// PROFILES
// ============================================================================

export const getProfile = (userId) =>
  supabase?.from('profiles').select('*').eq('id', userId).single()

export const updateProfile = (userId, fields) =>
  supabase?.from('profiles').update(fields).eq('id', userId)

// ============================================================================
// POSTS
// ============================================================================

// Read posts for a given scope. Joins the author profile so we have display_name.
// Returns { data, error }.
export const fetchPosts = ({ scope = 'local', category = null, limit = 100 } = {}) => {
  if (!supabase) return null
  let q = supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(display_name, avatar, is_verified)')
    .eq('scope', scope)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (category && category !== 'all') q = q.eq('category', category)
  return q
}

export const fetchPost = (postId) =>
  supabase?.from('posts')
    .select('*, profiles!posts_user_id_fkey(display_name, avatar, is_verified)')
    .eq('id', postId)
    .single()

export const createPost = (post) =>
  supabase?.from('posts').insert([post]).select().single()

export const deletePost = (postId) =>
  supabase?.from('posts').delete().eq('id', postId)

// ============================================================================
// VOTES (on posts)
// ============================================================================

// Toggle a vote: tap same direction = remove; opposite direction = flip; new = insert.
// Trigger keeps posts.vote_count in sync.
export const voteOnPost = async (postId, userId, direction) => {
  if (!supabase) return null
  const { data: existing } = await supabase
    .from('votes')
    .select('id, direction')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.direction === direction) {
      return supabase.from('votes').delete().eq('id', existing.id)
    }
    return supabase.from('votes').update({ direction }).eq('id', existing.id)
  }
  return supabase.from('votes').insert([{ post_id: postId, user_id: userId, direction }])
}

// Fetch the current user's votes (used to rehydrate userVote UI state).
export const fetchMyVotes = (userId) =>
  supabase?.from('votes').select('post_id, direction').eq('user_id', userId)

// ============================================================================
// COMMENTS (used for both Statement comments and Question answers)
// ============================================================================

export const fetchComments = (postId) =>
  supabase?.from('comments')
    .select('*, profiles!comments_user_id_fkey(display_name, avatar)')
    .eq('post_id', postId)
    .order('vote_count', { ascending: false })

export const createComment = (comment) =>
  supabase?.from('comments').insert([comment]).select().single()

export const deleteComment = (commentId) =>
  supabase?.from('comments').delete().eq('id', commentId)

// ============================================================================
// COMMENT VOTES (Question Pulse answer voting)
// ============================================================================

export const voteOnComment = async (commentId, userId, direction) => {
  if (!supabase) return null
  const { data: existing } = await supabase
    .from('comment_votes')
    .select('id, direction')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.direction === direction) {
      return supabase.from('comment_votes').delete().eq('id', existing.id)
    }
    return supabase.from('comment_votes').update({ direction }).eq('id', existing.id)
  }
  return supabase.from('comment_votes').insert([{ comment_id: commentId, user_id: userId, direction }])
}

export const fetchMyCommentVotes = (userId) =>
  supabase?.from('comment_votes').select('comment_id, direction').eq('user_id', userId)

// ============================================================================
// WATCHED (with snapshot baked in)
// ============================================================================

// Start watching a post — captures the current state as the snapshot.
export const startWatching = async (postId, userId) => {
  if (!supabase) return null
  const { data: post } = await supabase
    .from('posts')
    .select('vote_count, comment_count')
    .eq('id', postId)
    .single()

  // Compute top answer at snapshot time (Question Pulses only, but cheap either way).
  const { data: topComment } = await supabase
    .from('comments')
    .select('id, vote_count')
    .eq('post_id', postId)
    .order('vote_count', { ascending: false })
    .limit(1)
    .maybeSingle()

  return supabase.from('watched').upsert([{
    user_id: userId,
    post_id: postId,
    snapshot_votes: post?.vote_count || 0,
    snapshot_comment_count: post?.comment_count || 0,
    snapshot_top_comment_id: topComment?.id || null,
    snapshot_top_comment_votes: topComment?.vote_count || 0,
    taken_at: new Date().toISOString()
  }])
}

export const stopWatching = (postId, userId) =>
  supabase?.from('watched').delete().eq('post_id', postId).eq('user_id', userId)

export const fetchMyWatched = (userId) =>
  supabase?.from('watched').select('*').eq('user_id', userId)
