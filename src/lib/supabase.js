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

// Submit a phone + ZIP verification request. Auto-approves under the current
// placeholder trigger — at launch this gets gated on Twilio SMS OTP success.
export const submitVerification = ({ userId, phone, zip, city, state }) =>
  supabase?.from('verification_requests')
    .insert([{ user_id: userId, phone: phone || null, zip, city: city || null, state: state || null }])
    .select()
    .single()

// Permanently delete the current user's account via the delete-account edge
// function. The function verifies the caller's JWT then runs auth.admin.deleteUser
// with the service role; FK cascades clean up the rest.
export const deleteMyAccount = async () => {
  if (!supabase) return { ok: false, error: new Error('Not configured') }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, error: new Error('Not signed in') }
  try {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      method: 'POST'
    })
    if (error) return { ok: false, error }
    return { ok: !!data?.ok, error: null }
  } catch (err) {
    return { ok: false, error: err }
  }
}

// Fetch everything stored about a user as one bundle, ready for download.
// Profile + their posts + their votes + their comments + comment votes + watched.
export const exportUserData = async (userId) => {
  if (!supabase || !userId) return { data: null, error: new Error('Not configured') }
  try {
    const [profile, posts, votes, comments, commentVotes, watched] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('posts').select('*').eq('user_id', userId),
      supabase.from('votes').select('*').eq('user_id', userId),
      supabase.from('comments').select('*').eq('user_id', userId),
      supabase.from('comment_votes').select('*').eq('user_id', userId),
      supabase.from('watched').select('*').eq('user_id', userId)
    ])
    return {
      data: {
        exported_at: new Date().toISOString(),
        project: 'pulse-civic',
        user_id: userId,
        profile: profile.data || null,
        posts: posts.data || [],
        post_votes: votes.data || [],
        comments: comments.data || [],
        comment_votes: commentVotes.data || [],
        watched: watched.data || []
      },
      error: null
    }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Upload a single media file (image or short video) attached to a Pulse.
// Returns { url, error } where url is the public CDN URL.
export const uploadPostMedia = async (userId, file) => {
  if (!supabase || !file) return { url: null, error: new Error('No file') }
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('post-media').getPublicUrl(path)
  return { url: data?.publicUrl || null, error: null }
}

// Upload an avatar file to the public 'avatars' bucket under <userId>/<filename>.
// Returns { url, error } where url is the public CDN URL. The caller is
// responsible for then patching profiles.avatar with the returned url.
export const uploadAvatar = async (userId, file) => {
  if (!supabase || !file) return { url: null, error: new Error('No file') }
  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  // Cache-bust by timestamp so the same path returns the new image immediately.
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: false, contentType: file.type || 'image/jpeg' })
  if (error) return { url: null, error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data?.publicUrl || null, error: null }
}

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

// Atomic vote toggle via SQL function — tap same direction = remove, opposite
// = flip, new = insert. RPC serializes concurrent calls (FOR UPDATE lock) so
// rapid double-taps can't race. Returns { data: resultingUserVote, error }
// where resultingUserVote is 1, -1, or 0.
export const voteOnPost = (postId, direction) =>
  supabase?.rpc('toggle_post_vote', { p_post_id: postId, p_direction: direction })

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

// Atomic comment-vote toggle via SQL function. Returns { data: resultingUserVote, error }.
export const voteOnComment = (commentId, direction) =>
  supabase?.rpc('toggle_comment_vote', { p_comment_id: commentId, p_direction: direction })

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

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const fetchMyNotifications = (userId, { limit = 30 } = {}) =>
  supabase?.from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

export const markNotificationRead = (notificationId) =>
  supabase?.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

export const markAllNotificationsRead = (userId) =>
  supabase?.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

// Subscribe to new notifications for the given user. Returns an unsubscribe fn.
export const subscribeToNotifications = (userId, onInsert) => {
  if (!supabase) return () => {}
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => { try { onInsert?.(payload.new) } catch {} }
    )
    .subscribe()
  return () => { try { supabase.removeChannel(channel) } catch {} }
}

// Subscribe to live changes on posts + comments tables. The feed uses this
// to tick vote/comment counts and surface new replies without a refresh.
//
// onPostUpdate fires for each post UPDATE (anyone votes or comments) with
// the new row. onCommentInsert fires for each new comment row.
//
// Returns an unsubscribe function. Caller must filter their own writes to
// avoid double-applying optimistic state.
export const subscribeToFeed = ({ onPostUpdate, onCommentInsert, onStatus } = {}) => {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('feed-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'posts' },
      (payload) => { try { onPostUpdate?.(payload.new) } catch {} }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comments' },
      (payload) => { try { onCommentInsert?.(payload.new) } catch {} }
    )
    .subscribe((status) => { try { onStatus?.(status) } catch {} })
  return () => { try { supabase.removeChannel(channel) } catch {} }
}

// Fetch a single comment with its profile join — used after a realtime
// INSERT event so we can render the new comment with its author display name.
export const fetchCommentById = (commentId) =>
  supabase?.from('comments')
    .select('*, profiles!comments_user_id_fkey(display_name, avatar, is_verified)')
    .eq('id', commentId)
    .single()
