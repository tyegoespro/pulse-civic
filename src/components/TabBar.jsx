import { useRef, useEffect, useState } from 'react'
import Icon from './Icon'

const TABS = [
  { id: 'feed', label: 'Feed', icon: 'ui-feed' },
  { id: 'explore', label: 'Explore', icon: 'ui-explore' },
  { id: 'trending', label: 'Trending', icon: 'ui-trending' },
  { id: 'insights', label: 'Insights', icon: 'ui-insights' },
  { id: 'activity', label: 'Activity', icon: 'ui-activity' },
]

export default function TabBar({ activeTab, onTabChange }) {
  const tabRefs = useRef({})
  const barRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  // Measure the active tab and position the indicator
  useEffect(() => {
    const el = tabRefs.current[activeTab]
    const bar = barRef.current
    if (el && bar) {
      const barRect = bar.getBoundingClientRect()
      const tabRect = el.getBoundingClientRect()
      setIndicator({
        left: tabRect.left - barRect.left,
        width: tabRect.width
      })
    }
  }, [activeTab])

  return (
    <div className="tab-bar" ref={barRef}>
      {/* Sliding indicator */}
      <div
        className="tab-indicator"
        style={{
          transform: `translateX(${indicator.left}px)`,
          width: indicator.width
        }}
      />
      {TABS.map(tab => (
        <button
          key={tab.id}
          ref={el => tabRefs.current[tab.id] = el}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={tab.icon} size={20} />
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
