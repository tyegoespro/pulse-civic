import { useState, useRef, useEffect, useMemo } from 'react'
import { suggestPoliteComment, isGeminiConfigured } from '../lib/gemini'
import Icon from './Icon'
import CommentVoteButton from './CommentVoteButton'

export default function CommentsModal({ post, onClose, onAddComment, onVoteComment, incognito, onAuthorClick }) {
  const [text, setText] = useState('')
  const [polishing, setPolishing] = useState(false)
  const [polishResult, setPolishResult] = useState(null)
  const endRef = useRef(null)
  const isQuestion = post.type === 'question'
  const accent = post.scope === 'state' ? '#D97706' : '#6366F1'

  // For Question Pulses, sort answers by votes (desc). For Statements, keep chronological.
  const sortedComments = useMemo(() => {
    if (!post.comments) return []
    if (!isQuestion) return post.comments
    return [...post.comments].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  }, [post.comments, isQuestion])

  const topVoteCount = isQuestion && sortedComments[0] ? (sortedComments[0].votes || 0) : 0
  const runnerVoteCount = isQuestion && sortedComments[1] ? (sortedComments[1].votes || 0) : 0
  const hasVerdict = topVoteCount >= 30 && topVoteCount >= runnerVoteCount * 1.5

  useEffect(() => {
    // Don't auto-scroll to bottom for Question Pulses — top answer is the focus.
    if (!isQuestion) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [post.comments, isQuestion])

  const handleSend = () => {
    if (!text.trim()) return
    onAddComment(post.id, text.trim())
    setText('')
    setPolishResult(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePolish = async () => {
    if (!text.trim() || polishing) return
    setPolishing(true)
    try {
      const result = await suggestPoliteComment(text)
      setPolishResult(result)
    } catch {
      setPolishResult(null)
    } finally {
      setPolishing(false)
    }
  }

  const acceptPolish = () => {
    if (polishResult?.rewrittenText) {
      setText(polishResult.rewrittenText)
      setPolishResult(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', height: '80vh', padding: 0 }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isQuestion ? 'Answers' : 'Discussion'}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {isQuestion
                ? `${post.comments?.length || 0} ${(post.comments?.length || 0) === 1 ? 'answer' : 'answers'} · ranked by votes`
                : `${post.comments?.length || 0} comments`}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Original Post Context */}
        <div className="comments-header-post" style={{ margin: '16px 24px 0', flexShrink: 0 }}>
          {isQuestion && (
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: accent,
              textTransform: 'uppercase',
              marginBottom: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name="ui-comments" size={10} />
              Question Pulse
            </div>
          )}
          <p>"{post.title}"</p>
        </div>

        {/* Comments List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {(!post.comments || post.comments.length === 0) ? (
            <div className="comments-empty">
              <div className="comments-empty-icon" style={{ display: 'inline-flex', justifyContent: 'center', opacity: 0.5 }}>
                <Icon name="ui-comments" size={36} />
              </div>
              <p style={{ fontWeight: 500 }}>
                {isQuestion ? 'No answers yet.' : 'No comments yet.'}
              </p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                {isQuestion
                  ? 'Be the first to suggest an answer — the top-voted one becomes the community Verdict.'
                  : 'Be the first to share your thoughts!'}
              </p>
            </div>
          ) : (
            sortedComments.map((comment, idx) => {
              const isTopAnswer = isQuestion && idx === 0 && (comment.votes || 0) > 0
              return (
                <div
                  key={comment.id}
                  className="comment-bubble"
                  style={isTopAnswer ? {
                    background: `${accent}0d`,
                    border: `1px solid ${accent}33`,
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 12
                  } : {}}
                >
                  {/* Vote column for Question Pulses */}
                  {isQuestion && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        flexShrink: 0,
                        paddingTop: 4
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CommentVoteButton
                        direction="up"
                        active={comment.userVote === 1}
                        accent={accent}
                        onClick={() => onVoteComment && onVoteComment(post.id, comment.id, 1)}
                      />
                      <span style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: comment.userVote === 1
                          ? accent
                          : comment.userVote === -1
                            ? '#EF4444'
                            : ((comment.votes || 0) > 0 ? accent : 'var(--text-muted)'),
                        minWidth: 24,
                        textAlign: 'center',
                        transition: 'color 0.15s ease'
                      }}>
                        {comment.votes || 0}
                      </span>
                      <CommentVoteButton
                        direction="down"
                        active={comment.userVote === -1}
                        accent={accent}
                        onClick={() => onVoteComment && onVoteComment(post.id, comment.id, -1)}
                      />
                    </div>
                  )}

                  {!isQuestion && (
                    <div className="comment-avatar" style={
                      comment.incognito ? {
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: '#A78BFA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      } : { overflow: 'hidden' }
                    }>
                      {comment.incognito ? (
                        <Icon name="ui-incognito" size={16} />
                      ) : comment.authorAvatar && /^https?:\/\//.test(comment.authorAvatar) ? (
                        <img
                          src={comment.authorAvatar}
                          alt={comment.author || 'Author'}
                          referrerPolicy="no-referrer"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        comment.author?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isTopAnswer && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        color: accent,
                        textTransform: 'uppercase',
                        marginBottom: 4
                      }}>
                        <Icon name="ui-lightbulb" size={11} />
                        {hasVerdict ? 'Verdict' : 'Leading answer'}
                      </div>
                    )}
                    <div className="comment-body">
                      <p>{comment.text}</p>
                    </div>
                    <span className="comment-time">
                      {comment.incognito ? (
                        <><span style={{ color: '#A78BFA' }}>Anonymous</span> · </>
                      ) : (
                        <><span
                          className={comment.authorId && onAuthorClick ? 'author-link' : ''}
                          onClick={() => {
                            if (comment.authorId && onAuthorClick) {
                              onAuthorClick(comment.authorId)
                            }
                          }}
                        >{comment.author}</span> · </>
                      )}
                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Polish Result Banner */}
        {polishResult && (
          <div style={{
            margin: '0 24px',
            padding: '12px 16px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 12,
            animation: 'slide-up 0.3s ease'
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#A78BFA',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Icon name="ui-ai-spark" size={12} />
              Suggested rewrite
            </div>
            <p style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: '0 0 8px 0'
            }}>
              "{polishResult.rewrittenText}"
            </p>
            <p style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              margin: '0 0 10px 0',
              fontStyle: 'italic'
            }}>
              {polishResult.changesExplanation}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={acceptPolish}
                style={{
                  background: 'var(--gradient-brand)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)'
                }}
              >
                Use this
              </button>
              <button
                onClick={() => setPolishResult(null)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-secondary)',
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font)'
                }}
              >
                Keep mine
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div style={{ padding: '0 24px 24px', flexShrink: 0 }}>
          {/* Incognito Indicator (read-only — controlled by global toggle) */}
          {incognito && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              marginBottom: 10,
              borderRadius: 10,
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              color: '#C4B5FD'
            }}>
              <Icon name="ui-incognito" size={14} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>Commenting as Anonymous</span>
            </div>
          )}

          <div className="comment-input-row">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setPolishResult(null) }}
              onKeyDown={handleKeyDown}
              placeholder={isQuestion ? 'Suggest an answer...' : 'Share your perspective...'}
              rows={1}
            />
            {/* Polish Button */}
            {isGeminiConfigured() && text.trim().length > 10 && (
              <button
                onClick={handlePolish}
                disabled={polishing}
                title="AI: Make more constructive"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: polishing
                    ? 'rgba(167, 139, 250, 0.15)'
                    : 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  color: '#A78BFA',
                  cursor: polishing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon
                  name={polishing ? 'ui-refresh' : 'ui-ai-spark'}
                  size={18}
                  style={polishing ? { animation: 'spin 1s linear infinite' } : null}
                />
              </button>
            )}
            {/* Send Button */}
            <button
              className="comment-send-btn"
              onClick={handleSend}
              disabled={!text.trim()}
            >
              ↑
            </button>
          </div>
          <div style={{
            fontSize: 10,
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: 8,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            width: '100%'
          }}>
            {isGeminiConfigured() ? (
              <>
                Tip: Tap
                <Icon name="ui-ai-spark" size={11} />
                to get an AI-polished version of your comment.
              </>
            ) : (
              'We value constructive and respectful dialogue.'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
