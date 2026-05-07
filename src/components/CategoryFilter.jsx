import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

export default function CategoryFilter({ filter, onFilterChange, categories }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open])

  const activeCat = filter === 'all' ? null : categories.find(c => c.id === filter)
  const label = activeCat ? activeCat.label : 'All'
  const activeColor = activeCat ? activeCat.color : '#A78BFA'

  return (
    <div className="category-dropdown" ref={ref}>
      <button
        className="category-dropdown-trigger"
        onClick={() => setOpen(!open)}
        style={{ '--active-color': activeColor }}
      >
        {activeCat && <Icon name={activeCat.icon} size={14} color={activeColor} />}
        <span>{label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="category-dropdown-menu">
          <button
            className={`category-dropdown-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { onFilterChange('all'); setOpen(false) }}
          >
            <span className="category-dropdown-dot" style={{ background: '#A78BFA' }} />
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-dropdown-item ${filter === cat.id ? 'active' : ''}`}
              onClick={() => { onFilterChange(cat.id); setOpen(false) }}
            >
              <Icon name={cat.icon} size={14} color={cat.color} />
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
