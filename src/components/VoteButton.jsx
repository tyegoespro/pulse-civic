import { useState } from 'react'

export default function VoteButton({ direction, active, onClick }) {
  const [animating, setAnimating] = useState(false)
  const isUp = direction === 'up'

  const handleClick = () => {
    setAnimating(true)
    onClick()
    setTimeout(() => setAnimating(false), 300)
  }

  const className = [
    'vote-btn',
    active && (isUp ? 'active-up' : 'active-down'),
    animating && 'pop'
  ].filter(Boolean).join(' ')

  return (
    <button onClick={handleClick} className={className}>
      {isUp ? '▲' : '▼'}
    </button>
  )
}
