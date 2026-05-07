import { useState, useMemo } from 'react'
import { CATEGORIES, SEED_USERS } from '../constants'
import { CITIES, CITY_ISSUES } from '../lib/cities'
import Icon from './Icon'

export default function ProfileView({ userId, posts, onBack, onVote, onCommentClick, onAuthorClick, onPostClick }) {
  const [activeTab, setActiveTab] = useState('posts')
  const user = SEED_USERS[userId]

  // For city authors: gather all city posts and build a derived profile
  const allCityPosts = useMemo(() => {
    const all = []
    Object.entries(CITY_ISSUES).forEach(([cityId, issues]) => {
      const city = CITIES.find(c => c.id === cityId)
      issues.forEach(issue => {
        all.push({ ...issue, _cityId: cityId, _cityLabel: city?.label || cityId })
      })
    })
    return all
  }, [])

  const cityAuthorPosts = useMemo(() =>
    allCityPosts.filter(p => p.authorId === userId && !p.incognito),
    [allCityPosts, userId]
  )

  const cityUser = useMemo(() => {
    if (user) return null
    const firstPost = cityAuthorPosts[0]
    if (!firstPost) return null
    const city = CITIES.find(c => c.id === firstPost._cityId)
    return {
      displayName: firstPost.author,
      avatar: firstPost.author.charAt(0),
      city: city?.name || 'Unknown',
      state: city?.state || '',
      isVerified: true,
      joinedAt: 'Recently',
      bio: null,
      isPro: false
    }
  }, [user, cityAuthorPosts])

  // Derive public activity from all posts (local + city)
  const publicPosts = useMemo(() => {
    if (user) return posts.filter(p => p.authorId === userId && !p.incognito)
    return cityAuthorPosts
  }, [posts, userId, user, cityAuthorPosts])

  const publicComments = useMemo(() => {
    const comments = []
    const searchPosts = user ? posts : allCityPosts
    searchPosts.forEach(post => {
      (post.comments || []).forEach(c => {
        if (c.authorId === userId && !c.incognito) {
          comments.push({
            ...c,
            postTitle: post.title,
            postId: post.id,
            postCategory: post.category
          })
        }
      })
    })
    return comments.sort((a, b) => b.timestamp - a.timestamp)
  }, [posts, allCityPosts, userId, user])

  // Stats
  const totalUpvotes = publicPosts.reduce((sum, p) => sum + Math.max(0, p.votes), 0)

  // Watched pulses
  const watchedPosts = useMemo(() => {
    const ids = (user || cityUser)?.watching || []
    return posts.filter(p => ids.includes(p.id))
  }, [posts, user, cityUser])

  const activeUser = user || cityUser

  if (!activeUser) {
    return (
      <div style={{ paddingBottom: 100 }}>
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="activity-empty">
          <div className="activity-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><Icon name="ui-incognito" size={32} /></div>
          <div>User not found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-view" style={{ paddingBottom: 100 }}>
      {/* Back Button */}
      <button className="profile-back-btn" onClick={onBack}>
        <span>←</span>
        <span>Back to Feed</span>
      </button>

      {/* Profile Header Card */}
      <div className="profile-header">
        <div className="profile-header-bg" />
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <span>{activeUser.avatar}</span>
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-name-row">
            <h2 className="profile-display-name">{activeUser.displayName}</h2>
            {activeUser.isVerified && (
              <span className="profile-verified-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon name="ui-verified" size={11} />
                Verified
              </span>
            )}
            {activeUser.isPro && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.18))',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#FCD34D',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                <Icon name="ui-ai-spark" size={10} />
                Pro
              </span>
            )}
          </div>
          <div className="profile-location" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="ui-location" size={12} />
            {activeUser.city}, {activeUser.state}
          </div>
          <div className="profile-joined" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="ui-calendar" size={12} />
            Joined {activeUser.joinedAt}
          </div>
          {activeUser.bio && (
            <p className="profile-bio">{activeUser.bio}</p>
          )}
        </div>

        {/* Stats Row */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="profile-stat-value">{publicPosts.length}</span>
            <span className="profile-stat-label">Posts</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">{totalUpvotes}</span>
            <span className="profile-stat-label">Upvotes</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-value">{publicComments.length}</span>
            <span className="profile-stat-label">Comments</span>
          </div>
        </div>
      </div>

      {/* Profile Tab Bar */}
      <div className="profile-tab-bar">
        <button
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="ui-feed" size={14} />
          Posts ({publicPosts.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="ui-comments" size={14} />
          Comments ({publicComments.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'watching' ? 'active' : ''}`}
          onClick={() => setActiveTab('watching')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icon name="ui-eye" size={14} />
          Watching ({watchedPosts.length})
        </button>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="stagger-children">
          {publicPosts.length === 0 ? (
            <div className="profile-empty-tab">
              <span style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}><Icon name="ui-feed" size={28} /></span>
              <p>No public posts yet.</p>
            </div>
          ) : (
            publicPosts.map(post => {
              const cat = CATEGORIES.find(c => c.id === post.category)
              return (
                <div key={post.id} className="profile-post-card animate-slide-up"
                  style={{ cursor: onPostClick ? 'pointer' : 'default' }}
                  onClick={() => onPostClick && onPostClick(post.id)}
                >
                  <div className="profile-post-meta">
                    <span
                      className="post-category-tag"
                      style={{
                        background: `${cat?.color}22`,
                        color: cat?.color,
                        borderColor: `${cat?.color}44`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {cat?.icon && <Icon name={cat.icon} size={11} />}
                      {cat?.label}
                    </span>
                    <span className="post-location" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="ui-location" size={11} />
                      {post.location}
                    </span>
                  </div>
                  <h3 className="profile-post-title">{post.title}</h3>
                  {post.description && (
                    <p className="profile-post-desc">
                      {post.description.length > 120
                        ? post.description.slice(0, 120) + '...'
                        : post.description}
                    </p>
                  )}
                  <div className="profile-post-footer">
                    <span className="profile-post-stat">
                      ▲ {post.votes}
                    </span>
                    <span className="profile-post-stat" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="ui-comments" size={11} />
                      {post.comments?.length || 0}
                    </span>
                    <span className="profile-post-time">{post.createdAt}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="stagger-children">
          {publicComments.length === 0 ? (
            <div className="profile-empty-tab">
              <span style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}><Icon name="ui-comments" size={28} /></span>
              <p>No public comments yet.</p>
            </div>
          ) : (
            publicComments.map(c => {
              const cat = CATEGORIES.find(ct => ct.id === c.postCategory)
              const clickable = onPostClick && c.postId
              return (
                <div
                  key={c.id}
                  className="profile-comment-card animate-slide-up"
                  onClick={() => clickable && onPostClick(c.postId)}
                  style={clickable ? { cursor: 'pointer' } : undefined}
                >
                  <div className="profile-comment-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="ui-comments" size={16} />
                  </div>
                  <div className="profile-comment-body">
                    <div className="profile-comment-text">
                      "{c.text.length > 100 ? c.text.slice(0, 100) + '...' : c.text}"
                    </div>
                    <div className="profile-comment-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      on
                      {cat?.icon && <Icon name={cat.icon} size={11} style={{ color: cat.color }} />}
                      <span style={{ color: 'var(--text-muted)' }}>{c.postTitle}</span> · {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Watching Tab */}
      {activeTab === 'watching' && (
        <div className="stagger-children">
          {watchedPosts.length === 0 ? (
            <div className="profile-empty-tab">
              <span style={{ display: 'flex', justifyContent: 'center', opacity: 0.5 }}><Icon name="ui-eye" size={28} /></span>
              <p>Not watching any voices yet.</p>
            </div>
          ) : (
            watchedPosts.map(post => {
              const cat = CATEGORIES.find(c => c.id === post.category)
              return (
                <div
                  key={post.id}
                  className="profile-post-card animate-slide-up"
                  style={{ cursor: onPostClick ? 'pointer' : 'default' }}
                  onClick={() => onPostClick && onPostClick(post.id)}
                >
                  <div className="profile-post-meta">
                    <span
                      className="post-category-tag"
                      style={{
                        background: `${cat?.color}22`,
                        color: cat?.color,
                        borderColor: `${cat?.color}44`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {cat?.icon && <Icon name={cat.icon} size={11} />}
                      {cat?.label}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#22C55E',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      <Icon name="ui-eye" size={10} />
                      Watching
                    </span>
                  </div>
                  <h3 className="profile-post-title">{post.title}</h3>
                  <div className="profile-post-footer">
                    <span className="profile-post-stat">
                      ▲ {post.votes}
                    </span>
                    <span className="profile-post-stat" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name="ui-comments" size={11} />
                      {post.comments?.length || 0}
                    </span>
                    <span className="profile-post-stat" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="ui-location" size={11} />
                      {post.location}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
