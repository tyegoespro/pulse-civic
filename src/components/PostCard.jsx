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
  const isQuestion = post.type === 'question'
  const accent = post.scope === 'state' ? '#D97706' : '#6366F1'

  // Compute top-voted answer (Verdict) and runner-up
  const { topAnswer, runnerUp, totalAnswers } = useMemo(() => {
    if (!isQuestion || !post.comments || post.comments.length === 0) {
      return { topAnswer: null, runnerUp: null, totalAnswers: 0 }
    }
    const sorted = [...post.comments].sort((a, b) => (b.votes || 0) - (a.votes || 0))
    return {
      topAnswer: sorted[0],
      runnerUp: sorted[1] || null,
      totalAnswers: sorted.length
    }
  }, [isQuestion, post.comments])

  // Verdict label logic — "Verdict" if there's clear consensus, "Leading" otherwise
  const verdictLabel = useMemo(() => {
    if (!topAnswer) return null
    const topVotes = topAnswer.votes || 0
    const runnerVotes = runnerUp?.votes || 0
    if (topVotes >= 30 && topVotes >= runnerVotes * 1.5) return 'Verdict'
    if (topVotes > 0) return 'Leading'
    return null
  }, [topAnswer, runnerUp])

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
            {isQuestion && (
              <span style={{
                fontSize: 10,
                color: accent,
                fontWeight: 700,
                background: `${accent}1a`,
                border: `1px solid ${accent}40`,
                padding: '1px 6px',
                borderRadius: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                letterSpacing: '0.04em'
              }}>
                <Icon name="ui-comments" size={9} />
                QUESTION
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

          {!compact && !isQuestion && post.description && (
            <p className="post-description">{post.description}</p>
          )}

          {/* Verdict block — Question Pulses only */}
          {!compact && isQuestion && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                if (onCommentClick) onCommentClick(post.id)
              }}
              style={{
                marginTop: 4,
                marginBottom: 12,
                padding: '12px 14px',
                borderRadius: 12,
                background: topAnswer ? `${accent}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${topAnswer ? `${accent}33` : 'var(--border)'}`,
                cursor: onCommentClick ? 'pointer' : 'default'
              }}
            >
              {topAnswer ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      color: accent,
                      textTransform: 'uppercase'
                    }}>
                      <Icon name="ui-lightbulb" size={11} />
                      {verdictLabel}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: accent,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      ▲ {topAnswer.votes || 0}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    margin: 0,
                    lineHeight: 1.45,
                    fontWeight: 500,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    "{topAnswer.text}"
                  </p>
                  <div style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>
                      — {topAnswer.incognito ? 'Anonymous' : topAnswer.author}
                      {totalAnswers > 1 && ` · ${totalAnswers} answers`}
                    </span>
                    <span style={{ color: accent, fontWeight: 600 }}>
                      See all →
                    </span>
                  </div>
                </>
              ) : (
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Icon name="ui-comments" size={13} />
                  No answers yet — be the first to weigh in.
                </div>
              )}
            </div>
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
