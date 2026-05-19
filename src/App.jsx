import { useState, useEffect, useRef } from 'react'
import { SEED_POSTS, STATE_SEED_POSTS, CATEGORIES, STATE_CATEGORIES } from './constants'
import iconSprite from './icons/sprite.svg?raw'
import Icon from './components/Icon'
import Header from './components/Header'
import TabBar from './components/TabBar'
import CategoryFilter from './components/CategoryFilter'
import PostCard from './components/PostCard'
import CreatePostModal from './components/CreatePostModal'
import ActivityScreen from './components/ActivityScreen'
import CommentsModal from './components/CommentsModal'
import InsightsPanel from './components/InsightsPanel'
import ExploreView from './components/ExploreView'
import DemoBanner from './components/DemoBanner'
import InfoPage from './components/InfoPage'
import ProfileView from './components/ProfileView'
import PulseProModal from './components/PulseProModal'
import PostDetailModal from './components/PostDetailModal'
import OnboardingModal from './components/OnboardingModal'
import AuthModal from './components/AuthModal'
import { canVoteOnPost, canVoteOnStatePost } from './lib/proximity'
import { useAuth } from './lib/auth'
import {
  loadLivePosts,
  loadLiveWatched,
  liveVotePost,
  liveVoteComment,
  liveCreatePost,
  liveAddComment,
  liveStartWatching,
  liveStopWatching
} from './lib/posts'

const FREE_INCOGNITO_LIMIT = 3
const PRO_STORAGE_KEY = 'pulse-pro-state'

const monthKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const loadProState = () => {
  try {
    const raw = localStorage.getItem(PRO_STORAGE_KEY)
    if (!raw) return { isPro: false, plan: null, usage: 0, usageMonth: monthKey() }
    const parsed = JSON.parse(raw)
    // Reset usage if month rolled over
    if (parsed.usageMonth !== monthKey()) {
      return { ...parsed, usage: 0, usageMonth: monthKey() }
    }
    return parsed
  } catch {
    return { isPro: false, plan: null, usage: 0, usageMonth: monthKey() }
  }
}
const POSTS_STORAGE_KEY = 'pulse_posts_data'

// Load posts: merge seed data with any saved user modifications
const loadPosts = () => {
  const seed = [...SEED_POSTS, ...STATE_SEED_POSTS]
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY)
    if (!raw) return seed
    const saved = JSON.parse(raw)
    // saved = { overrides: { [postId]: { userVote, comments, ... } }, userPosts: [...] }
    const merged = seed.map(p => {
      const override = saved.overrides?.[p.id]
      if (!override) return p
      return {
        ...p,
        userVote: override.userVote ?? p.userVote,
        votes: override.votes ?? p.votes,
        userVoteIncognito: override.userVoteIncognito ?? p.userVoteIncognito,
        comments: override.comments ?? p.comments
      }
    })
    // Append user-created posts
    const userPosts = (saved.userPosts || []).map(p => ({ ...p }))
    return [...userPosts, ...merged]
  } catch {
    return seed
  }
}

export default function App() {
  // Core State
  const [posts, setPosts] = useState(loadPosts)
  const [activeTab, setActiveTab] = useState('feed')
  const [filter, setFilter] = useState('all')
  const [slideDirection, setSlideDirection] = useState('none')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevTabRef = useRef('feed')

  // Scope: 'local' or 'state'
  const [scope, setScope] = useState('local')

  // Global Incognito Mode
  const [incognito, setIncognito] = useState(false)

  // Pulse Pro state — persisted to localStorage
  const [proState, setProState] = useState(loadProState)
  const [showProModal, setShowProModal] = useState(false)
  const [proModalReason, setProModalReason] = useState(null)

  useEffect(() => {
    localStorage.setItem(PRO_STORAGE_KEY, JSON.stringify(proState))
  }, [proState])


  // Persist posts: save overrides for seed posts + full user-created posts.
  // Skipped in live mode — Supabase is the source of truth there.
  const seedIds = new Set([...SEED_POSTS, ...STATE_SEED_POSTS].map(p => p.id))

  const incognitoRemaining = Math.max(0, FREE_INCOGNITO_LIMIT - proState.usage)

  // Persist posts to localStorage — demo-mode only.
  // (Declared as an effect after liveMode is in scope; see further down.)

  const tryToggleIncognito = () => {
    // Toggle is free — quota only consumed when an incognito POST is submitted.
    setIncognito(prev => !prev)
  }

  const handleUpgrade = (plan) => {
    setProState(prev => ({ ...prev, isPro: true, plan }))
    setShowProModal(false)
    setProModalReason(null)
  }

  const openProModal = () => {
    setProModalReason(null)
    setShowProModal(true)
  }

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [commentPostId, setCommentPostId] = useState(null)

  // Profile Viewing
  const [viewingProfile, setViewingProfile] = useState(null)

  useEffect(() => {
    if (viewingProfile) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [viewingProfile])

  // Info Page (replaces old landing page)
  const [showInfoPage, setShowInfoPage] = useState(false)

  // Post Detail View
  const [detailPostId, setDetailPostId] = useState(null)
  const [detailPostData, setDetailPostData] = useState(null)

  // Deep-link from shared URL: ?post=<id> auto-opens that Pulse's detail view.
  // Strip the param from the URL after handling so refresh doesn't re-trigger it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedId = params.get('post')
    if (!sharedId) return
    setDetailPostId(sharedId)
    params.delete('post')
    const newSearch = params.toString()
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash
    window.history.replaceState({}, '', newUrl)
  }, [])

  // Auth — global gate to sign-in modal
  const { user, configured, signOut } = useAuth()
  const liveMode = !!(user && configured)
  const [showAuth, setShowAuth] = useState(false)
  const [authReason, setAuthReason] = useState(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const openAuth = (reason = null) => {
    setAuthReason(reason)
    setShowAuth(true)
  }
  const closeAuth = () => {
    setShowAuth(false)
    setAuthReason(null)
  }

  // Refresh live data from Supabase. Safe to call any time — no-op in demo mode.
  const refreshLive = async () => {
    if (!liveMode) return
    try {
      setLiveLoading(true)
      const [livePosts, liveWatched] = await Promise.all([
        loadLivePosts(user.id),
        loadLiveWatched(user.id)
      ])
      setPosts(livePosts)
      setWatchedIds(liveWatched.ids)
      setWatchedSnapshots(liveWatched.snapshots)
    } catch (err) {
      console.error('[Pulse] live refresh failed:', err)
    } finally {
      setLiveLoading(false)
    }
  }

  // When liveMode flips on (sign-in completes), pull from Supabase.
  useEffect(() => {
    if (!liveMode) return
    refreshLive()
  }, [liveMode, user?.id])

  // Demo-mode persistence: store overrides for seed posts + full user posts.
  // In live mode this is skipped — Supabase is the source of truth.
  useEffect(() => {
    if (liveMode) return
    const overrides = {}
    const userPosts = []
    posts.forEach(p => {
      if (seedIds.has(p.id)) {
        if (p.userVote !== 0 || (p.comments && p.comments.length > (SEED_POSTS.concat(STATE_SEED_POSTS).find(s => s.id === p.id)?.comments?.length || 0))) {
          overrides[p.id] = {
            userVote: p.userVote,
            votes: p.votes,
            userVoteIncognito: p.userVoteIncognito,
            comments: p.comments
          }
        }
      } else {
        userPosts.push(p)
      }
    })
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify({ overrides, userPosts }))
  }, [posts, liveMode])

  // Onboarding — first visit only
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('pulse_onboarded')
  })

  const handleOnboardingComplete = () => {
    localStorage.setItem('pulse_onboarded', 'true')
    setShowOnboarding(false)
  }

  // Watched Issues — persisted to localStorage
  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulse_watched') || '[]')
    } catch { return [] }
  })

  // Watched snapshots — frozen state at last view, used to compute "since you checked" deltas.
  // Shape: { [postId]: { votes, commentCount, topCommentId, topCommentVotes, takenAt } }
  const [watchedSnapshots, setWatchedSnapshots] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulse_watched_snapshots') || '{}')
    } catch { return {} }
  })

  useEffect(() => {
    if (liveMode) return
    localStorage.setItem('pulse_watched_snapshots', JSON.stringify(watchedSnapshots))
  }, [watchedSnapshots, liveMode])

  const buildSnapshot = (post) => {
    if (!post) return null
    let topComment = null
    if (post.type === 'question' && post.comments?.length) {
      topComment = post.comments.reduce(
        (max, c) => ((c.votes || 0) > (max?.votes || 0) ? c : max),
        null
      )
    }
    return {
      votes: post.votes || 0,
      commentCount: post.comments?.length || 0,
      topCommentId: topComment?.id || null,
      topCommentVotes: topComment?.votes || 0,
      takenAt: Date.now()
    }
  }

  const toggleWatch = async (postId) => {
    if (configured && !user) { openAuth('Sign in to watch a Pulse'); return }
    if (liveMode) {
      const isWatching = watchedIds.includes(postId)
      try {
        if (isWatching) {
          await liveStopWatching(postId, user.id)
        } else {
          await liveStartWatching(postId, user.id)
          setActivityBadge(b => b + 1)
        }
        const w = await loadLiveWatched(user.id)
        setWatchedIds(w.ids)
        setWatchedSnapshots(w.snapshots)
      } catch (err) {
        console.error('[Pulse] toggleWatch failed:', err)
      }
      return
    }

    const post = posts.find(p => p.id === postId)
    setWatchedIds(prev => {
      const next = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [postId, ...prev]
      localStorage.setItem('pulse_watched', JSON.stringify(next))
      if (!prev.includes(postId)) {
        setActivityBadge(b => b + 1)
        // Starting to watch — take a snapshot so future deltas are relative to now.
        if (post) {
          setWatchedSnapshots(s => ({ ...s, [postId]: buildSnapshot(post) }))
        }
      } else {
        // Stopped watching — drop the snapshot.
        setWatchedSnapshots(s => {
          const copy = { ...s }
          delete copy[postId]
          return copy
        })
      }
      return next
    })
  }

  // Activity badge — counts new actions since last Activity tab visit
  const [activityBadge, setActivityBadge] = useState(0)

  // --- Handlers ---

  const handleScopeChange = (newScope) => {
    setScope(newScope)
    setFilter('all') // Reset filter when switching scope
    setViewingProfile(null)
  }

  // Tab order for determining slide direction
  const TAB_ORDER = ['feed', 'explore', 'trending', 'insights', 'activity']

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return
    const oldIndex = TAB_ORDER.indexOf(activeTab)
    const newIndex = TAB_ORDER.indexOf(newTab)
    setSlideDirection(newIndex > oldIndex ? 'left' : 'right')
    setIsTransitioning(true)
    prevTabRef.current = activeTab

    // Brief delay for exit animation, then switch
    setTimeout(() => {
      setActiveTab(newTab)
      setViewingProfile(null)
      window.scrollTo({ top: 0, behavior: 'auto' })
      if (newTab === 'activity') {
        setActivityBadge(0)
      }
      // Reset transition after enter animation
      setTimeout(() => setIsTransitioning(false), 350)
    }, 80)
  }

  const handleVote = async (postId, direction) => {
    if (configured && !user) { openAuth('Sign in to vote on a Pulse'); return }
    if (liveMode) {
      // Proximity gate for local Pulses — state-scope votes are open to all.
      const target = posts.find(p => p.id === postId)
      if (target && target.scope !== 'state' && !canVoteOnPost(target.lat, target.lng)) return

      // Optimistic update so the UI reacts immediately.
      let oldUserVote = 0
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        oldUserVote = p.userVote || 0
        const newVote = oldUserVote === direction ? 0 : direction
        return {
          ...p,
          userVote: newVote,
          votes: p.votes + (newVote - oldUserVote)
        }
      }))
      if (activeTab !== 'activity') setActivityBadge(b => b + 1)
      try {
        await liveVotePost(postId, direction)
      } catch (err) {
        console.error('[Pulse] vote failed, rolling back:', err)
        // Roll back the optimistic update.
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          const current = p.userVote || 0
          return { ...p, userVote: oldUserVote, votes: p.votes + (oldUserVote - current) }
        }))
      }
      return
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      // State posts: no proximity check. Local posts: use proximity.
      if (p.scope !== 'state' && !canVoteOnPost(p.lat, p.lng)) return p
      const newVote = p.userVote === direction ? 0 : direction
      return {
        ...p,
        userVote: newVote,
        votes: p.votes + (newVote - p.userVote),
        userVoteIncognito: newVote !== 0 ? incognito : false,
        userVoteTimestamp: newVote !== 0 ? Date.now() : null
      }
    }))
    if (activeTab !== 'activity') setActivityBadge(b => b + 1)
  }

  const handleCreatePost = async ({ title, description, category, location, impact, media, scope: postScope, lat, lng, type }) => {
    if (configured && !user) { openAuth('Sign in to post a Pulse'); return }
    // Quota gate: free users get FREE_INCOGNITO_LIMIT incognito POSTS per month.
    if (incognito && !proState.isPro && proState.usage >= FREE_INCOGNITO_LIMIT) {
      setProModalReason(`You've used all ${FREE_INCOGNITO_LIMIT} free incognito posts this month. Go Pro for unlimited.`)
      setShowProModal(true)
      return
    }

    const isState = postScope === 'state'
    const resolvedLat = lat != null ? lat : (isState ? null : 44.024 + (Math.random() - 0.5) * 0.01)
    const resolvedLng = lng != null ? lng : (isState ? null : -88.543 + (Math.random() - 0.5) * 0.01)

    if (liveMode) {
      try {
        const created = await liveCreatePost({
          type: type || 'statement',
          title,
          description,
          category,
          location,
          scope: postScope || scope,
          incognito,
          media,
          impact,
          lat: resolvedLat,
          lng: resolvedLng
        }, user.id)
        if (created) setPosts(prev => [created, ...prev])
        if (incognito && !proState.isPro) {
          setProState(prev => ({ ...prev, usage: prev.usage + 1, usageMonth: monthKey() }))
        }
        setShowCreate(false)
        setActiveTab('feed')
        setActivityBadge(b => b + 1)
      } catch (err) {
        console.error('[Pulse] createPost failed:', err)
        alert('Could not publish your Pulse. Check console for details.')
      }
      return
    }

    const now = Date.now()
    const newPost = {
      id: now.toString(),
      type: type || 'statement',
      title,
      description,
      category,
      location,
      scope: postScope || scope,
      votes: 1,
      userVote: 1,
      comments: [],
      incognito, // uses global incognito state
      author: incognito ? null : 'Tye D.',
      authorVerified: true,
      createdAt: 'Just now',
      createdAtTs: now,
      userId: 'me',
      media: media || [],
      impact: impact || null,
      lat: resolvedLat,
      lng: resolvedLng
    }
    setPosts(prev => [newPost, ...prev])

    // Decrement quota only when an incognito post is actually submitted.
    if (incognito && !proState.isPro) {
      setProState(prev => ({ ...prev, usage: prev.usage + 1, usageMonth: monthKey() }))
    }

    setShowCreate(false)
    setActiveTab('feed')
    setActivityBadge(b => b + 1)
  }

  const handleAddComment = async (postId, text) => {
    if (configured && !user) { openAuth('Sign in to reply'); return }
    if (liveMode) {
      const post = posts.find(p => p.id === postId)
      const isQuestion = post?.type === 'question'
      try {
        const newComment = await liveAddComment({
          postId,
          text,
          userId: user.id,
          incognito,
          isQuestion
        })
        if (newComment) {
          setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p
            return { ...p, comments: [...(p.comments || []), newComment] }
          }))
        }
        if (activeTab !== 'activity') setActivityBadge(b => b + 1)
      } catch (err) {
        console.error('[Pulse] addComment failed:', err)
      }
      return
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const isQuestion = p.type === 'question'
      return {
        ...p,
        comments: [
          ...(p.comments || []),
          {
            id: Date.now().toString(),
            author: incognito ? 'Anonymous' : 'You', // uses global incognito
            authorId: incognito ? null : 'me',
            text,
            timestamp: Date.now(),
            incognito, // uses global incognito state
            // Question Pulse answers auto-upvote their author's vote
            votes: isQuestion ? 1 : 0,
            userVote: isQuestion ? 1 : 0
          }
        ]
      }
    }))
    if (activeTab !== 'activity') setActivityBadge(b => b + 1)
  }

  const handleVoteComment = async (postId, commentId, direction) => {
    if (configured && !user) { openAuth('Sign in to vote on a reply'); return }
    if (liveMode) {
      // Proximity gate — same rules as post voting.
      const target = posts.find(p => p.id === postId)
      if (target && target.scope !== 'state' && !canVoteOnPost(target.lat, target.lng)) return

      // Optimistic update
      let oldUserVote = 0
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          comments: (p.comments || []).map(c => {
            if (c.id !== commentId) return c
            oldUserVote = c.userVote || 0
            const newVote = oldUserVote === direction ? 0 : direction
            return { ...c, userVote: newVote, votes: (c.votes || 0) + (newVote - oldUserVote) }
          })
        }
      }))
      if (activeTab !== 'activity') setActivityBadge(b => b + 1)
      try {
        await liveVoteComment(commentId, direction)
      } catch (err) {
        console.error('[Pulse] voteComment failed, rolling back:', err)
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return {
            ...p,
            comments: (p.comments || []).map(c => {
              if (c.id !== commentId) return c
              const current = c.userVote || 0
              return { ...c, userVote: oldUserVote, votes: (c.votes || 0) + (oldUserVote - current) }
            })
          }
        }))
      }
      return
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      // Same scope-aware gating as post voting
      if (p.scope !== 'state' && !canVoteOnPost(p.lat, p.lng)) return p
      return {
        ...p,
        comments: (p.comments || []).map(c => {
          if (c.id !== commentId) return c
          const currentVote = c.userVote || 0
          const currentVotes = c.votes || 0
          const newVote = currentVote === direction ? 0 : direction
          return {
            ...c,
            userVote: newVote,
            votes: currentVotes + (newVote - currentVote)
          }
        })
      }
    }))
    if (activeTab !== 'activity') setActivityBadge(b => b + 1)
  }

  // --- Derived Data ---

  const scopedPosts = posts.filter(p => p.scope === scope)
  const activeCategories = scope === 'state' ? STATE_CATEGORIES : CATEGORIES

  const filteredPosts = scopedPosts
    .filter(p => filter === 'all' || p.category === filter)

  const feedPosts = [...filteredPosts].sort(
    (a, b) => (b.createdAtTs || 0) - (a.createdAtTs || 0)
  )

  const trendingPosts = [...filteredPosts].sort((a, b) => b.votes - a.votes)

  const commentPost = posts.find(p => p.id === commentPostId)
  const detailPost = detailPostData || posts.find(p => p.id === detailPostId)

  // Navigate from post detail → explore tab with location
  const handleExploreLocation = (post) => {
    setDetailPostId(null)
    setActiveTab('explore')
  }

  // Add comment from detail view
  const handleDetailComment = (postId, text) => {
    handleAddComment(postId, text)
  }

  // --- Main App (shown immediately) ---

  return (
    <div className={`app-shell ${incognito ? 'incognito-mode' : ''}`}>
      {/* Inlined Streamline Plump sprite — mounted once, all <Icon /> uses it */}
      <div dangerouslySetInnerHTML={{ __html: iconSprite }} />

      {/* Demo Banner — shown on first load */}
      <DemoBanner
        onLearnMore={() => setShowInfoPage(true)}
        onGetStarted={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      <Header
        onBrandClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        incognito={incognito}
        onToggleIncognito={tryToggleIncognito}
        isPro={proState.isPro}
        incognitoRemaining={incognitoRemaining}
        onShowPro={openProModal}
        scope={scope}
        onScopeChange={handleScopeChange}
        onInfoClick={() => setShowInfoPage(true)}
        activityBadge={activityBadge}
        onActivityClick={() => {
          setDetailPostId(null)
          setCommentPostId(null)
          setViewingProfile(null)
          handleTabChange('activity')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onShowAuth={() => openAuth()}
        onSignOut={() => {
          if (window.confirm('Sign out of Pulse?')) signOut()
        }}
      />

      <div className="app-content">
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} badges={{ activity: activityBadge }} />

        {/* Animated Tab Content */}
        <div
          className={`tab-content ${slideDirection !== 'none' ? `slide-enter-${slideDirection}` : ''}`}
          key={activeTab}
        >

        {/* Profile View */}
        {viewingProfile && (
          <ProfileView
            userId={viewingProfile}
            posts={posts}
            onBack={() => setViewingProfile(null)}
            onVote={handleVote}
            onCommentClick={setCommentPostId}
            onAuthorClick={(authorId) => setViewingProfile(authorId)}
            onPostClick={(postId) => setDetailPostId(postId)}
          />
        )}

        {/* Feed & Trending Views */}
        {!viewingProfile && (activeTab === 'feed' || activeTab === 'trending') && (
          <>
            <CategoryFilter filter={filter} onFilterChange={setFilter} categories={activeCategories} />
            <div className="stagger-children" style={{ paddingBottom: 100 }}>
              {(activeTab === 'feed' ? feedPosts : trendingPosts).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  onCommentClick={setCommentPostId}
                  onAuthorClick={(authorId) => setViewingProfile(authorId)}
                  onPostClick={(postId) => setDetailPostId(postId)}
                  onCategoryClick={(catId) => setFilter(catId)}
                  isWatched={watchedIds.includes(post.id)}
                  compact={activeTab === 'trending'}
                />
              ))}
              {filteredPosts.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--text-tertiary)'
                }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                    <Icon name={scope === 'state' ? 'ui-scope-state' : 'ui-search'} size={40} />
                  </div>
                  <div>
                    {scope === 'state'
                      ? 'No statewide voices found in this category.'
                      : 'No voices found in this category.'
                    }
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Explore / Heatmap View */}
        {!viewingProfile && activeTab === 'explore' && (
          <ExploreView posts={scopedPosts} onVote={handleVote} scope={scope} onPostClick={(postOrId) => {
            if (typeof postOrId === 'object') {
              setDetailPostData(postOrId)
              setDetailPostId(postOrId.id)
            } else {
              setDetailPostData(null)
              setDetailPostId(postOrId)
            }
          }} />
        )}

        {/* Insights View */}
        {!viewingProfile && activeTab === 'insights' && (
          <InsightsPanel
            posts={scopedPosts}
            scope={scope}
            onPostClick={(postId) => setDetailPostId(postId)}
            onCategoryClick={(catId) => {
              setFilter(catId)
              setActiveTab('feed')
            }}
          />
        )}

        {/* Activity View */}
        {!viewingProfile && activeTab === 'activity' && (
          <ActivityScreen
            posts={posts}
            watchedIds={watchedIds}
            watchedSnapshots={watchedSnapshots}
            scope={scope}
            onPostClick={(postId) => setDetailPostId(postId)}
          />
        )}
        </div> {/* end tab-content */}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowCreate(true)}
        style={incognito ? {
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
        } : scope === 'state' ? {
          background: 'linear-gradient(135deg, #D97706, #B45309)',
          boxShadow: '0 4px 20px rgba(217, 119, 6, 0.4)',
          animation: 'none'
        } : {}}
      >
        +
      </button>

      {/* Create Post Modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreatePost}
          existingPosts={posts}
          incognito={incognito}
          scope={scope}
        />
      )}

      {/* Comments Modal */}
      {commentPostId && commentPost && (
        <CommentsModal
          post={commentPost}
          onClose={() => setCommentPostId(null)}
          onAddComment={handleAddComment}
          onVoteComment={handleVoteComment}
          incognito={incognito}
          onAuthorClick={(authorId) => {
            setCommentPostId(null)
            setViewingProfile(authorId)
          }}
        />
      )}

      {/* Info Page Modal */}
      {showInfoPage && (
        <InfoPage
          onClose={() => setShowInfoPage(false)}
          onLaunchApp={() => setShowInfoPage(false)}
        />
      )}

      {/* Pulse Pro Upgrade Modal */}
      {showProModal && (
        <PulseProModal
          onClose={() => { setShowProModal(false); setProModalReason(null) }}
          onUpgrade={handleUpgrade}
          reason={proModalReason}
        />
      )}

      {/* Post Detail Modal */}
      {detailPostId && detailPost && (
        <PostDetailModal
          post={detailPost}
          watchedSnapshot={watchedSnapshots[detailPostId]}
          onClose={() => {
            setDetailPostId(null)
            setDetailPostData(null)
          }}
          onVote={handleVote}
          onVoteComment={handleVoteComment}
          onCommentClick={handleDetailComment}
          onAuthorClick={(authorId) => {
            setDetailPostId(null)
            setViewingProfile(authorId)
          }}
          onExploreLocation={handleExploreLocation}
          isWatched={watchedIds.includes(detailPostId)}
          onToggleWatch={() => toggleWatch(detailPostId)}
          onCategoryClick={(categoryId) => {
            setDetailPostId(null)
            setFilter(categoryId)
            setActiveTab('feed')
          }}
        />
      )}

      {/* Onboarding — first visit */}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal onClose={closeAuth} reason={authReason} />
      )}
    </div>
  )
}
