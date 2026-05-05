import Icon from './Icon'

const TABS = [
  { id: 'feed', label: 'Feed', icon: 'ui-feed' },
  { id: 'explore', label: 'Explore', icon: 'ui-explore' },
  { id: 'trending', label: 'Trending', icon: 'ui-trending' },
  { id: 'insights', label: 'Insights', icon: 'ui-insights' },
  { id: 'activity', label: 'Activity', icon: 'ui-activity' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="tab-bar">
      {TABS.map(tab => (
        <button
          key={tab.id}
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
