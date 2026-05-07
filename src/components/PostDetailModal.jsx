import { useState, useMemo } from 'react'
import Icon from './Icon'
import VoteButton from './VoteButton'
import LeafletMap from './LeafletMap'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { getDistanceToPost, canVoteOnPost, formatDistance } from '../lib/proximity'

// Real map showing the post's location
function LocationMap({ lat, lng, location, onExploreClick }) {
  if (!lat || !lng) return null

  const pins = [{ id: 'loc', lat, lng, color: '#FF3366', selected: true, label: location }]

  return (
    <div className="detail-map-section">
      <div className="detail-map-label">
        <Icon name="ui-location" size={13} />
        <span>Location</span>
      </div>
      <div className="detail-leaflet-map">
        <LeafletMap
          center={{ lat, lng }}
          zoom={15}
          pins={pins}
          interactive={false}
        />
      </div>

      {onExploreClick && (
        <button className="detail-map-explore-btn" onClick={onExploreClick}>
          <Icon name="ui-explore" size={14} />
          View on Explore Map
        </button>
      )}
    </div>
  )
}

export default function PostDetailModal({ post, onClose, onVote, onCommentClick, onAuthorClick, onExploreLocation, isWatched, onToggleWatch, onCategoryClick }) {
  const [commentText, setCommentText] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const allCategories = post.scope === 'state' ? STATE_CATEGORIES : CATEGORIES
  const cat = allCategories.find(c => c.id === post.category)
  const voteClass = post.userVote === 1 ? 'up' : post.userVote === -1 ? 'down' : 'neutral'
  const distance = useMemo(() => post.scope === 'state' ? 0 : getDistanceToPost(post.lat, post.lng), [post.lat, post.lng, post.scope])
  const canVote = useMemo(() => post.scope === 'state' ? true : canVoteOnPost(post.lat, post.lng), [post.lat, post.lng, post.scope])

  const handleExplore = () => {
    if (onExploreLocation) {
      onExploreLocation(post)
    }
  }

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-content" onClick={e => e.stopPropagation()}>

        {/* Image Lightbox */}
        {lightboxIndex !== null && post.media && post.media[lightboxIndex] && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="lightbox-close"
              onClick={() => setLightboxIndex(null)}
            >
              ✕
            </button>

            {post.media.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + post.media.length) % post.media.length)
                  }}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % post.media.length)
                  }}
                >
                  ›
                </button>
              </>
            )}

            <img
              src={post.media[lightboxIndex].preview}
              alt={`Photo ${lightboxIndex + 1}`}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />

            {post.media.length > 1 && (
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {post.media.length}
              </div>
            )}
          </div>
        )}
        {/* Header */}
        <div className="post-detail-header">
          <button className="post-detail-back" onClick={onClose}>
            <span style={{ fontSize: 20 }}>‹</span>
            <span>Back</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="post-category-tag"
              onClick={() => onCategoryClick && onCategoryClick(post.category)}
              style={{
                background: `${cat?.color}22`,
                color: cat?.color,
                borderColor: `${cat?.color}44`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: onCategoryClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
            >
              {cat?.icon && <Icon name={cat.icon} size={12} />}
              {cat?.label}
            </span>
            {isWatched && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#22C55E',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                padding: '2px 8px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3
              }}>
                <Icon name="ui-eye" size={10} />
                Watching
              </span>
            )}
          </div>
        </div>

        {/* Title & Meta */}
        <h2 className="post-detail-title">{post.title}</h2>

        <div className="post-detail-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="ui-location" size={12} />
            {post.location}
          </span>
          {post.scope !== 'state' && distance > 0 && (
            <span>· {formatDistance(distance)}</span>
          )}
          <span>· {post.createdAt}</span>
          {post.scope === 'state' && (
            <span style={{
              fontSize: 10,
              color: '#D97706',
              fontWeight: 600,
              background: 'rgba(217, 119, 6, 0.1)',
              padding: '1px 6px',
              borderRadius: 4
            }}>
              STATE
            </span>
          )}
          {post.incognito && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--violet)' }}>
              <Icon name="ui-incognito" size={11} />
              Incognito
            </span>
          )}
        </div>

        {/* Voting — compact centered */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 40
          }}>
            <VoteButton
              direction="up"
              active={post.userVote === 1}
              onClick={() => canVote && onVote(post.id, 1)}
              style={!canVote ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
            />
            <span className={`vote-count ${voteClass}`} style={{ fontSize: 24, fontWeight: 900, minWidth: 40, textAlign: 'center' }}>
              {post.votes}
            </span>
            <VoteButton
              direction="down"
              active={post.userVote === -1}
              onClick={() => canVote && onVote(post.id, -1)}
              style={!canVote ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
            />
          </div>
        </div>

        {/* Watch Issue Toggle */}
        {onToggleWatch && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <button
              onClick={onToggleWatch}
              className="watch-issue-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 40,
                border: isWatched
                  ? '1px solid rgba(34, 197, 94, 0.4)'
                  : '1px solid var(--border)',
                background: isWatched
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'var(--bg-card)',
                color: isWatched ? '#22C55E' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <Icon name="ui-eye" size={15} />
              {isWatched ? 'Watching' : 'Watch this Pulse'}
            </button>
          </div>
        )}

        {/* Share */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button
            className="watch-issue-btn"
            onClick={async () => {
              const shareData = {
                title: post.title,
                text: `Check out this pulse: "${post.title}" — ${post.location}`,
                url: window.location.origin
              }
              try {
                if (navigator.share) {
                  await navigator.share(shareData)
                } else {
                  await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
                  // Brief toast
                  const btn = document.getElementById('share-toast')
                  if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Share' }, 1500) }
                }
              } catch {}
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              borderRadius: 40,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <Icon name="ui-megaphone" size={15} />
            <span id="share-toast">Share</span>
          </button>
        </div>
        {/* Description */}
        {post.description && (
          <p className="post-detail-description">{post.description}</p>
        )}

        {/* Media Gallery — responsive, tappable */}
        {post.media && post.media.length > 0 && (
          <div className="post-detail-media" style={{
            display: 'grid',
            gridTemplateColumns: post.media.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 8,
            marginBottom: 16
          }}>
            {post.media.map((m, i) => (
              <div
                key={i}
                onClick={() => m.type !== 'video' && setLightboxIndex(i)}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  aspectRatio: post.media.length === 1 ? '16/10' : '4/3',
                  cursor: m.type !== 'video' ? 'zoom-in' : 'default'
                }}
              >
                {m.type === 'video' ? (
                  <video src={m.preview} controls style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }} />
                ) : (
                  <img
                    src={m.preview}
                    alt={`Evidence ${i + 1}`}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Impact Analysis */}
        {post.impact && (
          <div className="post-detail-impact">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>
              <Icon name="ui-ai-spark" size={14} />
              AI Impact Score: {post.impact.score}/100
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {post.impact.analysis}
            </p>
          </div>
        )}

        {/* Location Map */}
        <LocationMap
          lat={post.lat}
          lng={post.lng}
          location={post.location}
          onExploreClick={post.lat && post.lng ? handleExplore : null}
        />

        {/* Author */}
        {!post.incognito && post.author && (
          <div
            className="post-detail-author"
            style={{ cursor: post.authorId && onAuthorClick ? 'pointer' : 'default' }}
            onClick={() => post.authorId && onAuthorClick && onAuthorClick(post.authorId)}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0
            }}>
              {post.author.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)' }}>
                {post.author}
                <Icon name="ui-verified" size={12} style={{ color: 'var(--indigo)' }} />
              </span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified resident</div>
            </div>
            {post.authorId && onAuthorClick && (
              <span style={{ fontSize: 11, color: 'var(--text-accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                View Profile →
              </span>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="post-detail-comments">
          <div className="post-detail-comments-header">
            <Icon name="ui-comments" size={14} />
            Comments ({post.comments?.length || 0})
          </div>

          {post.comments && post.comments.length > 0 && (
            <div className="post-detail-comments-list">
              {post.comments.map(c => (
                <div key={c.id} className="post-detail-comment">
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.incognito ? (
                      <>
                        <Icon name="ui-incognito" size={11} />
                        <span style={{ color: '#A78BFA' }}>Anonymous</span>
                      </>
                    ) : (
                      <span
                        className={c.authorId && onAuthorClick ? 'author-link' : ''}
                        onClick={() => c.authorId && onAuthorClick && onAuthorClick(c.authorId)}
                        style={{ cursor: c.authorId && onAuthorClick ? 'pointer' : 'default' }}
                      >
                        {c.author}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Quick comment input */}
          <div className="post-detail-comment-input" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="form-input"
              style={{ flex: 1, fontSize: 13, padding: '10px 14px' }}
              onKeyDown={e => {
                if (e.key === 'Enter' && commentText.trim()) {
                  onCommentClick && onCommentClick(post.id, commentText.trim())
                  setCommentText('')
                }
              }}
            />
            <button
              className="comment-send-btn"
              onClick={() => {
                if (!commentText.trim()) return
                onCommentClick && onCommentClick(post.id, commentText.trim())
                setCommentText('')
              }}
              disabled={!commentText.trim()}
              aria-label="Post comment"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
