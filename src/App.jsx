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
import { canVoteOnPost, canVoteOnStatePost } from './lib/proximity'

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

export default function App() {
  // Core State
  const [posts, setPosts] = useState([...SEED_POSTS, ...STATE_SEED_POSTS])
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

  const incognitoRemaining = Math.max(0, FREE_INCOGNITO_LIMIT - proState.usage)

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

  // Info Page (replaces old landing page)
  const [showInfoPage, setShowInfoPage] = useState(false)

  // Post Detail View
  const [detailPostId, setDetailPostId] = useState(null)

  // Watched Issues — persisted to localStorage
  const [watchedIds, setWatchedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pulse_watched') || '[]')
    } catch { return [] }
  })

  const toggleWatch = (postId) => {
    setWatchedIds(prev => {
      const next = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
      localStorage.setItem('pulse_watched', JSON.stringify(next))
      return next
    })
  }

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
      // Reset transition after enter animation
      setTimeout(() => setIsTransitioning(false), 350)
    }, 80)
  }

  const handleVote = (postId, direction) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      // State posts: no proximity check. Local posts: use proximity.
      if (p.scope !== 'state' && !canVoteOnPost(p.lat, p.lng)) return p
      const newVote = p.userVote === direction ? 0 : direction
      return {
        ...p,
        userVote: newVote,
        votes: p.votes + (newVote - p.userVote),
        userVoteIncognito: newVote !== 0 ? incognito : false
      }
    }))
  }

  const handleCreatePost = ({ title, description, category, location, impact, media, scope: postScope, lat, lng }) => {
    // Quota gate: free users get FREE_INCOGNITO_LIMIT incognito POSTS per month.
    if (incognito && !proState.isPro && proState.usage >= FREE_INCOGNITO_LIMIT) {
      setProModalReason(`You've used all ${FREE_INCOGNITO_LIMIT} free incognito posts this month. Go Pro for unlimited.`)
      setShowProModal(true)
      return
    }

    const isState = postScope === 'state'
    const newPost = {
      id: Date.now().toString(),
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
      userId: 'me',
      media: media || [],
      impact: impact || null,
      lat: lat != null ? lat : (isState ? null : 44.024 + (Math.random() - 0.5) * 0.01),
      lng: lng != null ? lng : (isState ? null : -88.543 + (Math.random() - 0.5) * 0.01)
    }
    setPosts(prev => [newPost, ...prev])

    // Decrement quota only when an incognito post is actually submitted.
    if (incognito && !proState.isPro) {
      setProState(prev => ({ ...prev, usage: prev.usage + 1, usageMonth: monthKey() }))
    }

    setShowCreate(false)
    setActiveTab('feed')
  }

  const handleAddComment = (postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        comments: [
          ...(p.comments || []),
          {
            id: Date.now().toString(),
            author: incognito ? 'Anonymous' : 'You', // uses global incognito
            text,
            timestamp: Date.now(),
            incognito // uses global incognito state
          }
        ]
      }
    }))
  }

  // --- Derived Data ---

  const scopedPosts = posts.filter(p => p.scope === scope)
  const activeCategories = scope === 'state' ? STATE_CATEGORIES : CATEGORIES

  const filteredPosts = scopedPosts
    .filter(p => filter === 'all' || p.category === filter)

  const feedPosts = [...filteredPosts].sort((a, b) => {
    if (a.createdAt === 'Just now') return -1
    if (b.createdAt === 'Just now') return 1
    return 0
  })

  const trendingPosts = [...filteredPosts].sort((a, b) => b.votes - a.votes)

  const commentPost = posts.find(p => p.id === commentPostId)
  const detailPost = posts.find(p => p.id === detailPostId)

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
        onGetStarted={() => {}}
      />

      <Header
        onBrandClick={() => setShowInfoPage(true)}
        incognito={incognito}
        onToggleIncognito={tryToggleIncognito}
        isPro={proState.isPro}
        incognitoRemaining={incognitoRemaining}
        onShowPro={openProModal}
        scope={scope}
        onScopeChange={handleScopeChange}
        onInfoClick={() => setShowInfoPage(true)}
      />

      <div className="app-content">
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

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
                      ? 'No statewide issues found in this category.'
                      : 'No issues found in this category.'
                    }
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Explore / Heatmap View */}
        {!viewingProfile && activeTab === 'explore' && (
          <ExploreView posts={scopedPosts} onVote={handleVote} scope={scope} />
        )}

        {/* Insights View */}
        {!viewingProfile && activeTab === 'insights' && (
          <InsightsPanel posts={scopedPosts} scope={scope} onPostClick={(postId) => setDetailPostId(postId)} />
        )}

        {/* Activity View */}
        {!viewingProfile && activeTab === 'activity' && (
          <ActivityScreen posts={posts} />
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
          onClose={() => setDetailPostId(null)}
          onVote={handleVote}
          onCommentClick={handleDetailComment}
          onAuthorClick={(authorId) => {
            setDetailPostId(null)
            setViewingProfile(authorId)
          }}
          onExploreLocation={handleExploreLocation}
          isWatched={watchedIds.includes(detailPostId)}
          onToggleWatch={() => toggleWatch(detailPostId)}
        />
      )}
    </div>
  )
}
