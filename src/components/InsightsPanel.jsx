import { useMemo } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import Icon from './Icon'

export default function InsightsPanel({ posts, scope = 'local', onPostClick, onCategoryClick }) {
  const activeCategories = scope === 'state' ? STATE_CATEGORIES : CATEGORIES
  const isState = scope === 'state'
  const cityName = isState ? 'Wisconsin' : 'Oshkosh'

  // --- Derived Data ---

  const categoryData = useMemo(() => {
    const map = {}
    posts.forEach(post => {
      if (!map[post.category]) {
        const cat = activeCategories.find(c => c.id === post.category)
        map[post.category] = {
          id: post.category,
          name: cat?.label || post.category,
          icon: cat?.icon,
          count: 0,
          votes: 0,
          color: cat?.color || '#6B7280'
        }
      }
      map[post.category].count += 1
      map[post.category].votes += post.votes
    })
    return Object.values(map).sort((a, b) => b.votes - a.votes)
  }, [posts, activeCategories])

  const topPosts = useMemo(() =>
    [...posts].sort((a, b) => b.votes - a.votes).slice(0, 3),
    [posts]
  )

  const totalVotes = posts.reduce((sum, p) => sum + p.votes, 0)
  const totalPosts = posts.length
  const maxCatVotes = categoryData.length > 0 ? categoryData[0].votes : 1

  // Top consensus: highest voted post as a percentage
  const topPost = topPosts[0]
  const consensusPercent = topPost ? Math.min(99, Math.round((topPost.votes / Math.max(totalVotes, 1)) * 100 + 40)) : 0

  // Your impact (demo data)
  const yourVotes = posts.filter(p => p.userVote !== 0).length
  const yourPosts = posts.filter(p => p.userId === 'me').length

  // Generate a dynamic summary
  const summary = useMemo(() => {
    if (topPosts.length === 0) return 'No activity yet.'
    const top = categoryData[0]
    const second = categoryData[1]
    if (isState) {
      return `${top?.name} is the most discussed statewide topic with ${top?.votes} votes across ${top?.count} voices. ${second ? `${second.name} follows closely with ${second.votes} votes.` : ''}`
    }
    return `${top?.name} is the #1 concern in ${cityName} right now with ${top?.votes} votes across ${top?.count} reports. ${second ? `${second.name} is also gaining traction with ${second.votes} votes.` : ''}`
  }, [topPosts, categoryData, cityName, isState])

  return (
    <div style={{ paddingBottom: 100 }} className="stagger-children">

      {/* Briefing Header */}
      <div className="animate-slide-up" style={{
        padding: '20px 0 16px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6
        }}>
          <Icon name="ui-insights" size={18} style={{ color: 'var(--indigo)' }} />
          <h2 style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {isState ? 'Wisconsin Briefing' : `This Week in ${cityName}`}
          </h2>
        </div>
        <p style={{
          fontSize: 13,
          color: 'var(--text-tertiary)',
          margin: 0,
          lineHeight: 1.5
        }}>
          {summary}
        </p>
      </div>

      {/* Your Impact */}
      <div className="animate-slide-up" style={{
        background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.06))',
        border: '1px solid rgba(236,72,153,0.15)',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 20
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#EC4899',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Icon name="ui-verified" size={13} />
          Your Impact
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {yourVotes}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Votes cast
            </div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {yourPosts}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Voices added
            </div>
          </div>
        </div>
        {yourVotes === 0 && yourPosts === 0 && (
          <div style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginTop: 10,
            fontStyle: 'italic'
          }}>
            Start voting and posting to track your civic impact.
          </div>
        )}
      </div>

      {/* Community Consensus */}
      {topPost && (
        <div className="animate-slide-up" style={{
          background: isState
            ? 'linear-gradient(135deg, rgba(217,119,6,0.1), rgba(245,158,11,0.05))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
          border: `1px solid ${isState ? 'rgba(217,119,6,0.2)' : 'rgba(99,102,241,0.2)'}`,
          borderRadius: 16,
          padding: '18px 20px',
          marginBottom: 20,
          cursor: onPostClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
        onClick={() => onPostClick && topPost && onPostClick(topPost.id)}
      >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: isState ? '#D97706' : 'var(--text-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 10
          }}>
            <Icon name="ui-trending" size={13} />
            Community Consensus
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            marginBottom: 12
          }}>
            "{topPost.title}"
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <div style={{
              flex: 1,
              height: 8,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${consensusPercent}%`,
                background: isState
                  ? 'linear-gradient(90deg, #D97706, #F59E0B)'
                  : 'linear-gradient(90deg, var(--indigo), var(--violet))',
                borderRadius: 4,
                transition: 'width 0.8s ease'
              }} />
            </div>
            <span style={{
              fontSize: 14,
              fontWeight: 800,
              color: isState ? '#F59E0B' : 'var(--text-accent)',
              minWidth: 40,
              textAlign: 'right'
            }}>
              {consensusPercent}%
            </span>
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 6
          }}>
            {topPost.votes} residents agree · {topPost.location}
          </div>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="animate-slide-up" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
        marginBottom: 20
      }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--indigo)', lineHeight: 1 }}>
            {totalPosts}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Voices
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>
            {totalVotes.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Votes
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#EC4899', lineHeight: 1 }}>
            {categoryData.length}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Topics
          </div>
        </div>
      </div>

      {/* Top Issues */}
      <div className="animate-slide-up" style={{ marginBottom: 20 }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Icon name="ui-lightning" size={14} style={{ color: '#F59E0B' }} />
          Top Voices
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topPosts.map((post, i) => {
            const cat = activeCategories.find(c => c.id === post.category)
            return (
              <div key={post.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                transition: 'all 0.2s ease',
                cursor: onPostClick ? 'pointer' : 'default'
              }}
              onClick={() => onPostClick && onPostClick(post.id)}
              >
                {/* Rank */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: i === 0
                    ? 'linear-gradient(135deg, var(--indigo), var(--violet))'
                    : 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 900,
                  color: i === 0 ? 'white' : 'var(--text-tertiary)',
                  flexShrink: 0,
                  border: i === 0 ? 'none' : '1px solid var(--border)'
                }}>
                  {i + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {post.title}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      color: cat?.color
                    }}>
                      {cat?.icon && <Icon name={cat.icon} size={10} />}
                      {cat?.label}
                    </span>
                    <span>·</span>
                    <span>{post.location}</span>
                  </div>
                </div>

                {/* Vote count */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  <span style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: 'var(--success)',
                    lineHeight: 1
                  }}>
                    {post.votes}
                  </span>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    votes
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="animate-slide-up" style={{ marginBottom: 20 }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Icon name="ui-insights" size={14} style={{ color: 'var(--indigo)' }} />
          By Category
        </h3>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          {categoryData.map(cat => (
            <div key={cat.id}
              style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
              onClick={() => onCategoryClick && onCategoryClick(cat.id)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 5
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  {cat.icon && <Icon name={cat.icon} size={12} style={{ color: cat.color }} />}
                  {cat.name}
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)'
                }}>
                  {cat.count} {cat.count === 1 ? 'voice' : 'voices'} · {cat.votes} votes
                </span>
              </div>
              <div style={{
                height: 6,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(cat.votes / maxCatVotes) * 100}%`,
                  background: cat.color,
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                  opacity: 0.8
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: 'var(--text-muted)',
        padding: '8px 0'
      }}>
        Updated in real-time based on community activity.
      </div>
    </div>
  )
}
