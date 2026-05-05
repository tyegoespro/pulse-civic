import { useMemo } from 'react'
import { CATEGORIES } from '../constants'
import Icon from './Icon'

const CategoryInline = ({ cat }) => cat ? (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: cat.color }}>
    <Icon name={cat.icon} size={11} />
    {cat.label}
  </span>
) : null

const IncognitoInline = ({ size = 11 }) => (
  <span className="post-incognito" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
    <Icon name="ui-incognito" size={size} />
    Incognito
  </span>
)

export default function ActivityScreen({ posts }) {
  const myPosts = posts.filter(p => p.userId === 'me')
  const myVoted = posts.filter(p => p.userVote !== 0)

  // Extract all comments the user made across all posts
  const myComments = useMemo(() => {
    const comments = []
    posts.forEach(post => {
      (post.comments || []).forEach(c => {
        if (c.author === 'You' || c.author === 'Anonymous') {
          comments.push({ ...c, postTitle: post.title, postId: post.id, postCategory: post.category })
        }
      })
    })
    return comments.sort((a, b) => b.timestamp - a.timestamp)
  }, [posts])

  const regularComments = myComments.filter(c => !c.incognito)
  const incognitoComments = myComments.filter(c => c.incognito)
  const regularPosts = myPosts.filter(p => !p.incognito)
  const incognitoPosts = myPosts.filter(p => p.incognito)
  const regularVoted = myVoted.filter(p => !p.userVoteIncognito)
  const incognitoVoted = myVoted.filter(p => p.userVoteIncognito)

  const hasAny = myPosts.length > 0 || myVoted.length > 0 || myComments.length > 0

  return (
    <div style={{ paddingBottom: 100 }}>
      <h2 className="activity-header">Your Activity</h2>
      <p className="activity-subtext" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="ui-lock" size={12} />
        Only visible to you — including all incognito activity.
      </p>

      {/* ─── Regular Activity ─── */}
      {(regularPosts.length > 0 || regularComments.length > 0 || regularVoted.length > 0) && (
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
            paddingLeft: 2
          }}>
            Public Activity
          </div>

          {/* My Public Posts */}
          {regularPosts.length > 0 && (
            <>
              <h3 className="activity-section-title">Your Posts ({regularPosts.length})</h3>
              {regularPosts.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <div key={p.id} className="activity-item animate-slide-up">
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
                      <CategoryInline cat={cat} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {p.votes} votes · {p.createdAt}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Public Comments */}
          {regularComments.length > 0 && (
            <>
              <h3 className="activity-section-title" style={{ marginTop: regularPosts.length > 0 ? 20 : 0 }}>
                Your Comments ({regularComments.length})
              </h3>
              {regularComments.map(c => {
                const cat = CATEGORIES.find(ct => ct.id === c.postCategory)
                return (
                  <div key={c.id} className="activity-item animate-slide-up" style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: 'rgba(99, 102, 241, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#A78BFA'
                    }}>
                      <Icon name="ui-comments" size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                        marginBottom: 4
                      }}>
                        "{c.text.length > 80 ? c.text.slice(0, 80) + '...' : c.text}"
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        on
                        {cat?.icon && <Icon name={cat.icon} size={11} style={{ color: cat.color }} />}
                        {c.postTitle} · {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Posts I Voted On */}
          {regularVoted.length > 0 && (
            <>
              <h3 className="activity-section-title" style={{ marginTop: 20 }}>
                Posts You Voted On ({regularVoted.length})
              </h3>
              {regularVoted.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <div key={p.id} className="activity-item activity-vote-item animate-slide-up">
                    <span className={`activity-vote-icon ${p.userVote === 1 ? 'up' : 'down'}`}>
                      {p.userVote === 1 ? '▲' : '▼'}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {cat?.icon && <Icon name={cat.icon} size={13} style={{ color: cat.color }} />}
                        {p.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {p.votes} votes
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ─── Incognito Activity ─── */}
      {(incognitoPosts.length > 0 || incognitoComments.length > 0 || incognitoVoted.length > 0) && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.04)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          borderRadius: 16,
          padding: '16px 16px 8px'
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#A78BFA',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Icon name="ui-incognito" size={12} />
            Incognito Activity
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              color: 'var(--text-muted)',
              textTransform: 'none',
              letterSpacing: 'normal',
              marginLeft: 'auto'
            }}>
              Only you can see this
            </span>
          </div>

          {/* Incognito Posts */}
          {incognitoPosts.length > 0 && (
            <>
              <h3 className="activity-section-title" style={{ color: '#C4B5FD' }}>
                Incognito Posts ({incognitoPosts.length})
              </h3>
              {incognitoPosts.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <div key={p.id} className="activity-item animate-slide-up" style={{
                    borderColor: 'rgba(139, 92, 246, 0.15)'
                  }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12 }}>
                      <CategoryInline cat={cat} />
                      <IncognitoInline />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {p.votes} votes · {p.createdAt}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Incognito Comments */}
          {incognitoComments.length > 0 && (
            <>
              <h3 className="activity-section-title" style={{
                marginTop: incognitoPosts.length > 0 ? 16 : 0,
                color: '#C4B5FD'
              }}>
                Incognito Comments ({incognitoComments.length})
              </h3>
              {incognitoComments.map(c => {
                const cat = CATEGORIES.find(ct => ct.id === c.postCategory)
                return (
                  <div key={c.id} className="activity-item animate-slide-up" style={{
                    display: 'flex',
                    gap: 12,
                    borderColor: 'rgba(139, 92, 246, 0.15)'
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#A78BFA'
                    }}>
                      <Icon name="ui-incognito" size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 10 }}>
                        <IncognitoInline size={10} />
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                        marginBottom: 4
                      }}>
                        "{c.text.length > 80 ? c.text.slice(0, 80) + '...' : c.text}"
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        on
                        {cat?.icon && <Icon name={cat.icon} size={11} style={{ color: cat.color }} />}
                        {c.postTitle} · {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Incognito Votes */}
          {incognitoVoted.length > 0 && (
            <>
              <h3 className="activity-section-title" style={{
                marginTop: (incognitoPosts.length > 0 || incognitoComments.length > 0) ? 16 : 0,
                color: '#C4B5FD'
              }}>
                Incognito Votes ({incognitoVoted.length})
              </h3>
              {incognitoVoted.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <div key={p.id} className="activity-item activity-vote-item animate-slide-up" style={{
                    borderColor: 'rgba(139, 92, 246, 0.15)'
                  }}>
                    <span className={`activity-vote-icon ${p.userVote === 1 ? 'up' : 'down'}`} style={{ opacity: 0.7 }}>
                      {p.userVote === 1 ? '▲' : '▼'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          {cat?.icon && <Icon name={cat.icon} size={13} style={{ color: cat.color }} />}
                          {p.title}
                        </span>
                        <span className="post-incognito" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Icon name="ui-incognito" size={10} />
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {p.votes} votes
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasAny && (
        <div className="activity-empty">
          <div className="activity-empty-icon">🫥</div>
          <div>No activity yet. Start voting or post an issue!</div>
        </div>
      )}
    </div>
  )
}
