import { useMemo } from 'react'
import VoteButton from './VoteButton'
import Icon from './Icon'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { getDistanceToPost, canVoteOnPost, canVoteOnStatePost, formatDistance } from '../lib/proximity'

export default function PostCard({ post, onVote, onCommentClick, onAuthorClick, onPostClick, onCategoryClick, isWatched = false, compact = false }) {
  const allCategories = post.scope === 'state' ? STATE_CATEGORIES : CATEGORIES
  const cat = allCategories.find(c => c.id === post.category)
  const voteClass = post.userVote === 1 ? 'up' : post.userVote === -1 ? 'down' : 'neutral'
  const distance = useMemo(() => post.scope === 'state' ? 0 : getDistanceToPost(post.lat, post.lng), [post.lat, post.lng, post.scope])
  const canVote = useMemo(() => post.scope === 'state' ? canVoteOnStatePost() : canVoteOnPost(post.lat, post.lng), [post.lat, post.lng, post.scope])

  return (
    <div className={`post-card ${compact ? 'compact' : ''}`} onClick={() => onPostClick && onPostClick(post.id)}>
      <div className="post-card-inner">
        {/* Vote Column */}
        <div className="vote-column" onClick={e => e.stopPropagation()}>
          <VoteButton
            direction="up"
            active={post.userVote === 1}
            onClick={() => canVote && onVote(post.id, 1)}
            style={!canVote ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
          />
          <span className={`vote-count ${voteClass}`}>{post.votes}</span>
          <VoteButton
            direction="down"
            active={post.userVote === -1}
            onClick={() => canVote && onVote(post.id, -1)}
            style={!canVote ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
          />
        </div>

        {/* Content */}
        <div className="post-content">
          <div className="post-meta">
            <span
              className="post-category-tag"
              onClick={(e) => {
                if (onCategoryClick) {
                  e.stopPropagation()
                  onCategoryClick(post.category)
                }
              }}
              style={{
                background: `${cat?.color}22`,
                color: cat?.color,
                borderColor: `${cat?.color}44`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: onCategoryClick ? 'pointer' : 'default'
              }}
            >
              {cat?.icon && <Icon name={cat.icon} size={12} />}
              {cat?.label}
            </span>
            <span className="post-location" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Icon name="ui-location" size={11} />
              {post.location}
            </span>
            {!compact && post.scope !== 'state' && distance > 0 && (
              <span style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontWeight: 500
              }}>
                · {formatDistance(distance)}
              </span>
            )}
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
              <span className="post-incognito" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon name="ui-incognito" size={11} />
                Incognito
              </span>
            )}
          </div>

          <h3 className="post-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {post.title}
            {isWatched && (
              <span style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                color: '#22C55E',
                opacity: 0.7
              }}>
                <Icon name="ui-eye" size={13} />
              </span>
            )}
          </h3>

          {!compact && post.description && (
            <p className="post-description">{post.description}</p>
          )}

          {/* Media Gallery */}
          {!compact && post.media && post.media.length > 0 && (
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 12,
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}>
              {post.media.map((m, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0, borderRadius: 10, overflow: 'hidden' }}>
                  {m.type === 'video' ? (
                    <>
                      <video
                        src={m.preview}
                        style={{
                          width: 140,
                          height: 100,
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: 10,
                          border: '1px solid var(--border)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: 10,
                        color: 'white'
                      }}>
                        <Icon name="ui-play" size={32} style={{ opacity: 0.9 }} />
                      </div>
                    </>
                  ) : (
                    <img
                      src={m.preview}
                      alt={`Evidence ${i + 1}`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement.style.display = 'none'
                      }}
                      style={{
                        width: 140,
                        height: 100,
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2, #1a1a1a)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="post-footer">
            <span
              onClick={(e) => { e.stopPropagation(); onCommentClick && onCommentClick(post.id) }}
              style={{
                cursor: onCommentClick ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Icon name="ui-comments" size={13} />
              {post.comments?.length || 0}
            </span>
            <span>{post.createdAt}</span>
            {!post.incognito && post.author && (
              <span
                className={post.authorId && onAuthorClick ? 'author-link' : ''}
                onClick={(e) => {
                  if (post.authorId && onAuthorClick) {
                    e.stopPropagation()
                    onAuthorClick(post.authorId)
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                {post.author}
                <Icon name="ui-verified" size={11} style={{ color: 'var(--indigo)' }} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
