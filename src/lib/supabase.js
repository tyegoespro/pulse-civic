import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client — returns null gracefully if not configured
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => !!supabase

// Auth helpers
export const signUp = (email, password) => supabase?.auth.signUp({ email, password })
export const signIn = (email, password) => supabase?.auth.signInWithPassword({ email, password })
export const signOut = () => supabase?.auth.signOut()
export const getUser = () => supabase?.auth.getUser()

// Posts
export const getPosts = (category = null) => {
  if (!supabase) return null
  let query = supabase
    .from('posts')
    .select('*, profiles(display_name, is_verified)')
    .order('vote_count', { ascending: false })
  if (category) query = query.eq('category', category)
  return query
}

export const createPost = (post) =>
  supabase?.from('posts').insert([post]).select().single()

// Votes
export const vote = async (postId, userId, direction) => {
  if (!supabase) return null

  const { data: existing } = await supabase
    .from('votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    if (existing.direction === direction) {
      return supabase.from('votes').delete().eq('id', existing.id)
    } else {
      return supabase.from('votes').update({ direction }).eq('id', existing.id)
    }
  }
  return supabase.from('votes').insert([{ post_id: postId, user_id: userId, direction }])
}

// User activity (includes incognito — only called for own profile)
export const getUserActivity = (userId) =>
  supabase?.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const getUserVotes = (userId) =>
  supabase?.from('votes').select('*, posts(title, category)').eq('user_id', userId)
