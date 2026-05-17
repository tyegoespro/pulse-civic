import { useState } from 'react'

export default function CommentVoteButton({ direction, active, onClick, accent = '#6366F1' }) {
  const [pressed, setPressed] = useState(false)
  const isUp = direction === 'up'
  const activeColor = isUp ? accent : '#EF4444'

  const handleClick = (e) => {
    e.stopPropagation()
    setPressed(true)
    onClick && onClick()
    setTimeout(() => setPressed(false), 280)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isUp ? 'Upvote answer' : 'Downvote answer'}
      style={{
        width: 30,
        height: 26,
        borderRadius: 8,
        border: active ? `1.5px solid ${activeColor}` : '1px solid var(--border)',
        background: active ? `${activeColor}33` : 'rgba(255,255,255,0.04)',
        color: active ? activeColor : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 800,
        fontFamily: 'var(--font)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: active ? `0 0 0 3px ${activeColor}1f` : 'none',
        transform: pressed ? 'scale(0.88)' : (active ? 'scale(1.04)' : 'scale(1)'),
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0
      }}
    >
      {isUp ? '▲' : '▼'}
    </button>
  )
}
