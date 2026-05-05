import Icon from './Icon'

export default function CategoryFilter({ filter, onFilterChange, categories }) {
  return (
    <div className="category-filter">
      <button
        className={`category-chip ${filter === 'all' ? 'active' : ''}`}
        style={filter === 'all' ? { '--highlight-color': '#A78BFA', '--highlight-bg': 'rgba(99,102,241,0.2)' } : {}}
        onClick={() => onFilterChange('all')}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`category-chip ${filter === cat.id ? 'active' : ''}`}
          style={{
            '--highlight-color': cat.color,
            '--highlight-bg': `${cat.color}22`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
          onClick={() => onFilterChange(cat.id)}
        >
          <Icon name={cat.icon} size={15} color={filter === cat.id ? cat.color : 'currentColor'} />
          {cat.label}
        </button>
      ))}
    </div>
  )
}
