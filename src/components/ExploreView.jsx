import { useState, useMemo } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { CITIES, CITY_ISSUES } from '../lib/cities'
import Icon from './Icon'

function latLngToXY(lat, lng, bounds, width, height) {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height
  return { x: Math.max(10, Math.min(width - 10, x)), y: Math.max(10, Math.min(height - 10, y)) }
}

function PostPin({ post, x, y, isSelected, onClick, categories }) {
  const cat = categories.find(c => c.id === post.category)
  const size = Math.min(18 + (post.votes / 20), 36)

  return (
    <g onClick={() => onClick(post)} style={{ cursor: 'pointer' }}>
      {post.votes > 100 && (
        <circle cx={x} cy={y} r={size + 6} fill={`${cat?.color}15`} stroke={`${cat?.color}30`} strokeWidth="1">
          <animate attributeName="r" from={size + 4} to={size + 10} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        cx={x} cy={y} r={size / 2}
        fill={cat?.color || '#6366F1'}
        stroke={isSelected ? '#fff' : `${cat?.color}88`}
        strokeWidth={isSelected ? 3 : 1.5}
        opacity={0.9}
      />
      {cat?.icon && (
        <use
          href={`#${cat.icon}`}
          x={x - size * 0.25}
          y={y - size * 0.25}
          width={size * 0.5}
          height={size * 0.5}
          style={{ color: '#fff' }}
        />
      )}
      <text x={x} y={y + size / 2 + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#E5E7EB">
        {post.votes}
      </text>
    </g>
  )
}

// Wisconsin state map region data — major cities/regions positioned on a simplified state outline
const WI_STATE_REGIONS = [
  { id: 'milwaukee', label: 'Milwaukee', x: 480, y: 340, population: '577K' },
  { id: 'madison', label: 'Madison', x: 350, y: 355, population: '270K' },
  { id: 'green-bay', label: 'Green Bay', x: 430, y: 155, population: '107K' },
  { id: 'oshkosh', label: 'Oshkosh', x: 395, y: 235, population: '67K', isHome: true },
  { id: 'appleton', label: 'Appleton', x: 410, y: 210, population: '75K' },
  { id: 'eau-claire', label: 'Eau Claire', x: 180, y: 200, population: '70K' },
  { id: 'la-crosse', label: 'La Crosse', x: 140, y: 320, population: '52K' },
  { id: 'superior', label: 'Superior', x: 130, y: 40, population: '27K' },
  { id: 'wausau', label: 'Wausau', x: 310, y: 155, population: '39K' },
  { id: 'racine', label: 'Racine', x: 475, y: 385, population: '78K' },
]

// Simplified Wisconsin state outline path
const WI_STATE_PATH = "M 90 20 L 160 15 Q 200 20 250 15 L 350 20 Q 400 18 450 25 L 510 40 Q 520 60 515 100 L 510 150 Q 505 200 510 250 L 515 300 Q 520 340 510 380 L 500 405 Q 490 415 470 410 L 440 405 Q 420 408 400 405 L 350 398 Q 300 395 270 400 L 230 405 Q 200 410 170 405 L 140 395 Q 120 385 110 370 L 100 340 Q 95 310 90 280 L 85 240 Q 80 200 85 160 L 90 120 Q 88 80 90 50 Z"

function StateMapView({ posts, onSelectPost, selectedPost, categories }) {
  // Distribute state posts to regions based on location text
  const regionData = useMemo(() => {
    return WI_STATE_REGIONS.map(region => {
      const regionPosts = posts.filter(p => {
        const loc = (p.location || '').toLowerCase()
        const title = (p.title || '').toLowerCase()
        // Match posts by location text
        if (loc === 'statewide' || loc === 'multiple counties') return true
        if (loc.includes(region.label.toLowerCase())) return true
        if (title.includes(region.label.toLowerCase())) return true
        return false
      })
      const totalVotes = regionPosts.reduce((sum, p) => sum + p.votes, 0)
      return { ...region, posts: regionPosts, totalVotes, issueCount: regionPosts.length }
    })
  }, [posts])

  // Assign some posts to regions that don't have direct matches (statewide posts go to all)
  const statewidePosts = posts.filter(p =>
    (p.location || '').toLowerCase() === 'statewide' ||
    (p.location || '').toLowerCase() === 'multiple counties'
  )

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      position: 'relative'
    }}>
      {/* Map Label */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 16,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{
          background: 'rgba(15, 15, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          color: '#D97706',
          border: '1px solid rgba(217, 119, 6, 0.25)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon name="ui-scope-state" size={13} />
            Wisconsin Statewide
          </span>
        </span>
        <span style={{
          background: 'rgba(15, 15, 26, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)'
        }}>
          {posts.length} issues
        </span>
      </div>

      <svg viewBox="0 0 600 440" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <pattern id="state-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="state-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(217, 119, 6, 0.06)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.02)" />
          </linearGradient>
          {/* Lake Michigan glow */}
          <radialGradient id="lake-glow" cx="90%" cy="40%" r="30%">
            <stop offset="0%" stopColor="rgba(56, 130, 246, 0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="600" height="440" fill="#0a0a18" />
        <rect width="600" height="440" fill="url(#state-grid)" />

        {/* State outline */}
        <path d={WI_STATE_PATH} fill="url(#state-fill)" stroke="rgba(217, 119, 6, 0.2)" strokeWidth="1.5" />

        {/* Lake Michigan hint (east side) */}
        <rect x="520" y="40" width="80" height="380" fill="url(#lake-glow)" opacity="0.5" />
        <text x="555" y="200" fontSize="9" fill="rgba(56, 130, 246, 0.25)" fontWeight="600" transform="rotate(-90 555 200)">
          LAKE MICHIGAN
        </text>

        {/* Lake Superior hint (north) */}
        <text x="180" y="12" fontSize="8" fill="rgba(56, 130, 246, 0.2)" fontWeight="600">
          LAKE SUPERIOR
        </text>

        {/* Region dots with vote-based sizing */}
        {regionData.map(region => {
          const baseSize = 12
          const voteScale = Math.min(region.totalVotes / 200, 3)
          const size = baseSize + voteScale * 6
          const hasIssues = region.issueCount > 0

          return (
            <g key={region.id}>
              {/* Outer glow for regions with issues */}
              {hasIssues && (
                <circle cx={region.x} cy={region.y} r={size + 8} fill="rgba(217, 119, 6, 0.06)">
                  <animate attributeName="r" from={size + 6} to={size + 14} dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Main dot */}
              <circle
                cx={region.x} cy={region.y}
                r={size}
                fill={hasIssues ? 'rgba(217, 119, 6, 0.3)' : 'rgba(255, 255, 255, 0.05)'}
                stroke={hasIssues ? 'rgba(217, 119, 6, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
                strokeWidth={region.isHome ? 2 : 1}
              />
              {/* Inner dot */}
              <circle
                cx={region.x} cy={region.y}
                r={4}
                fill={region.isHome ? '#D97706' : hasIssues ? '#D97706' : 'rgba(255, 255, 255, 0.2)'}
                opacity={0.9}
              />
              {/* Label */}
              <text
                x={region.x}
                y={region.y + size + 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={region.isHome ? '#D97706' : 'var(--text-secondary)'}
              >
                {region.label}
                {region.isHome ? ' ●' : ''}
              </text>
              {/* Issue count badge */}
              {hasIssues && (
                <text
                  x={region.x}
                  y={region.y + size + 26}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="500"
                  fill="var(--text-muted)"
                >
                  {region.totalVotes.toLocaleString()} votes
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: 10,
        color: 'var(--text-muted)',
        fontWeight: 500
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(217, 119, 6, 0.3)', border: '1px solid rgba(217, 119, 6, 0.5)' }} />
          Active Region
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#D97706' }} />
          Your City
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)' }} />
          No Issues
        </span>
      </div>
    </div>
  )
}

export default function ExploreView({ posts, onVote, scope = 'local' }) {
  const [search, setSearch] = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedCityId, setSelectedCityId] = useState('oshkosh')
  const [citySearchOpen, setCitySearchOpen] = useState(false)
  const [cityQuery, setCityQuery] = useState('')

  const isState = scope === 'state'
  const activeCategories = isState ? STATE_CATEGORIES : CATEGORIES

  const selectedCity = CITIES.find(c => c.id === selectedCityId) || CITIES[0]
  const isHomeCity = selectedCity.isHome

  // Get posts for the selected city (local scope only)
  const cityPosts = useMemo(() => {
    if (selectedCityId === 'oshkosh') return posts.filter(p => p.lat && p.lng)
    return CITY_ISSUES[selectedCityId] || []
  }, [selectedCityId, posts])

  // For state scope, all posts are available
  const activePosts = isState ? posts : cityPosts

  const mapWidth = 600
  const mapHeight = 420

  const filteredPosts = useMemo(() =>
    activePosts
      .filter(p => filterCategory === 'all' || p.category === filterCategory)
      .filter(p => {
        if (!search) return true
        const q = search.toLowerCase()
        return p.title.toLowerCase().includes(q) ||
               p.location.toLowerCase().includes(q) ||
               p.description?.toLowerCase().includes(q)
      }),
    [activePosts, search, filterCategory]
  )

  const heatmapGradients = useMemo(() => {
    if (isState) return [] // State map doesn't use pin-level heatmap
    const clusters = []
    filteredPosts.forEach(post => {
      if (!post.lat || !post.lng) return
      const { x, y } = latLngToXY(post.lat, post.lng, selectedCity.bounds, mapWidth, mapHeight)
      const existing = clusters.find(c => Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 40)
      if (existing) {
        existing.intensity += post.votes
        existing.count += 1
      } else {
        clusters.push({ x, y, intensity: post.votes, count: 1 })
      }
    })
    return clusters
  }, [filteredPosts, selectedCity, isState])

  const selectedCat = selectedPost ? activeCategories.find(c => c.id === selectedPost.category) : null

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(cityQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(cityQuery.toLowerCase()) ||
    c.label.toLowerCase().includes(cityQuery.toLowerCase())
  )

  const switchCity = (cityId) => {
    setSelectedCityId(cityId)
    setCitySearchOpen(false)
    setCityQuery('')
    setSelectedPost(null)
    setFilterCategory('all')
    setSearch('')
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* City Selector — only for local scope */}
      {!isState && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button
            onClick={() => setCitySearchOpen(!citySearchOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)' }}><Icon name="ui-globe" size={18} /></span>
              <div style={{ textAlign: 'left' }}>
                <div>{selectedCity.label}</div>
                <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 1 }}>
                  {selectedCity.population} residents · {cityPosts.length} issues
                </div>
              </div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {citySearchOpen ? '▲' : '▼'}
            </span>
          </button>

          {/* City Dropdown */}
          {citySearchOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: 4,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              animation: 'slide-up 0.2s ease'
            }}>
              {/* Search Cities */}
              <div style={{ padding: '12px 12px 8px' }}>
                <input
                  value={cityQuery}
                  onChange={e => setCityQuery(e.target.value)}
                  placeholder="Search cities..."
                  autoFocus
                  className="form-input"
                  style={{ fontSize: 13, padding: '10px 14px' }}
                />
              </div>
              {/* City List */}
              <div style={{ maxHeight: 240, overflowY: 'auto', padding: '0 4px 8px' }}>
                {filteredCities.map(city => (
                  <button
                    key={city.id}
                    onClick={() => switchCity(city.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: city.id === selectedCityId ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font)',
                      fontSize: 14,
                      textAlign: 'left',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: city.isHome ? '#22C55E' : 'var(--text-muted)' }}><Icon name={city.isHome ? 'cat-housing' : 'ui-location'} size={16} /></span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{city.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {city.population} · {city.id === 'oshkosh' ? posts.filter(p => p.lat && p.lng).length : (CITY_ISSUES[city.id]?.length || 0)} issues
                        </div>
                      </div>
                    </div>
                    {city.isHome && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#22C55E',
                        background: 'rgba(34, 197, 94, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 4
                      }}>Home</span>
                    )}
                    {city.id === selectedCityId && (
                      <span style={{ color: 'var(--indigo)', fontSize: 14 }}>✓</span>
                    )}
                  </button>
                ))}
                {filteredCities.length === 0 && (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13
                  }}>
                    No cities found. Pulse is expanding soon!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* State scope header */}
      {isState && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(217, 119, 6, 0.06)',
          border: '1px solid rgba(217, 119, 6, 0.15)',
          marginBottom: 16
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', color: '#D97706' }}><Icon name="ui-scope-state" size={20} /></span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Wisconsin Statewide Issues</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
              All verified residents can vote · {posts.length} active issues
            </div>
          </div>
        </div>
      )}

      {/* Read-Only Banner for Other Cities (local scope only) */}
      {!isState && !isHomeCity && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          marginBottom: 16,
          fontSize: 12
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', color: '#F59E0B' }}><Icon name="ui-eye" size={16} /></span>
          <div>
            <span style={{ fontWeight: 600, color: '#F59E0B' }}>Browsing Mode</span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>
              You can view issues in {selectedCity.name} but can't vote — you're verified in Oshkosh.
            </span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.5,
          display: 'flex',
          alignItems: 'center'
        }}><Icon name="ui-search" size={16} /></span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isState ? 'Search statewide issues...' : `Search issues in ${selectedCity.name}...`}
          className="form-input"
          style={{ paddingLeft: 42, fontSize: 14 }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none' }}>
        <button
          className={`category-chip ${filterCategory === 'all' ? 'active' : ''}`}
          style={filterCategory === 'all' ? {
            '--highlight-color': isState ? '#D97706' : '#A78BFA',
            '--highlight-bg': isState ? 'rgba(217,119,6,0.2)' : 'rgba(99,102,241,0.2)'
          } : {}}
          onClick={() => setFilterCategory('all')}
        >
          All ({activePosts.length})
        </button>
        {activeCategories.map(cat => {
          const count = activePosts.filter(p => p.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              className={`category-chip ${filterCategory === cat.id ? 'active' : ''}`}
              style={{ '--highlight-color': cat.color, '--highlight-bg': `${cat.color}22` }}
              onClick={() => setFilterCategory(cat.id)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name={cat.icon} size={13} /> {count}</span>
            </button>
          )
        })}
      </div>

      {/* Map — State vs Local */}
      {isState ? (
        <StateMapView
          posts={filteredPosts}
          onSelectPost={setSelectedPost}
          selectedPost={selectedPost}
          categories={activeCategories}
        />
      ) : (
        /* Local City Map */
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          position: 'relative'
        }}>
          {/* Map Label */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 16,
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{
              background: 'rgba(15, 15, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}>
              <Icon name="ui-location" size={12} /> {selectedCity.label}
            </span>
            <span style={{
              background: 'rgba(15, 15, 26, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)'
            }}>
              {filteredPosts.length} issues
            </span>
            {!isHomeCity && (
              <span style={{
                background: 'rgba(245, 158, 11, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="ui-eye" size={11} /> View Only</span>
              </span>
            )}
          </div>

          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </pattern>
              {heatmapGradients.map((cluster, i) => (
                <radialGradient key={i} id={`heat-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={
                    cluster.intensity > 200 ? '#EF4444' :
                    cluster.intensity > 100 ? '#F59E0B' :
                    '#6366F1'
                  } stopOpacity="0.3" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            <rect width={mapWidth} height={mapHeight} fill="#0a0a18" rx="0" />
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

            {/* Road grid */}
            <line x1="0" y1={mapHeight * 0.35} x2={mapWidth} y2={mapHeight * 0.35} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <line x1="0" y1={mapHeight * 0.55} x2={mapWidth} y2={mapHeight * 0.55} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <line x1={mapWidth * 0.3} y1="0" x2={mapWidth * 0.3} y2={mapHeight} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <line x1={mapWidth * 0.6} y1="0" x2={mapWidth * 0.6} y2={mapHeight} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <line x1={mapWidth * 0.45} y1="0" x2={mapWidth * 0.45} y2={mapHeight} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            <line x1="0" y1={mapHeight * 0.7} x2={mapWidth * 0.5} y2={mapHeight * 0.2} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

            {/* City-specific water feature */}
            {selectedCityId === 'oshkosh' && (
              <>
                <path
                  d={`M ${mapWidth * 0.85} 0 Q ${mapWidth * 0.88} ${mapHeight * 0.3} ${mapWidth * 0.82} ${mapHeight * 0.5} Q ${mapWidth * 0.86} ${mapHeight * 0.7} ${mapWidth * 0.83} ${mapHeight} L ${mapWidth} ${mapHeight} L ${mapWidth} 0 Z`}
                  fill="rgba(56, 130, 246, 0.08)"
                  stroke="rgba(56, 130, 246, 0.15)"
                  strokeWidth="1"
                />
                <text x={mapWidth * 0.89} y={mapHeight * 0.45} fontSize="10" fill="rgba(56, 130, 246, 0.3)" fontWeight="600" transform={`rotate(-90 ${mapWidth * 0.89} ${mapHeight * 0.45})`}>
                  LAKE WINNEBAGO
                </text>
              </>
            )}
            {selectedCityId === 'santa-barbara' && (
              <>
                <path
                  d={`M 0 ${mapHeight * 0.85} Q ${mapWidth * 0.3} ${mapHeight * 0.9} ${mapWidth * 0.5} ${mapHeight * 0.82} Q ${mapWidth * 0.7} ${mapHeight * 0.88} ${mapWidth} ${mapHeight * 0.8} L ${mapWidth} ${mapHeight} L 0 ${mapHeight} Z`}
                  fill="rgba(56, 130, 246, 0.08)"
                  stroke="rgba(56, 130, 246, 0.15)"
                  strokeWidth="1"
                />
                <text x={mapWidth * 0.4} y={mapHeight * 0.92} fontSize="10" fill="rgba(56, 130, 246, 0.3)" fontWeight="600">
                  PACIFIC OCEAN
                </text>
              </>
            )}
            {selectedCityId === 'madison' && (
              <>
                <path
                  d={`M 0 ${mapHeight * 0.15} Q ${mapWidth * 0.15} ${mapHeight * 0.25} ${mapWidth * 0.25} ${mapHeight * 0.1} L ${mapWidth * 0.15} 0 L 0 0 Z`}
                  fill="rgba(56, 130, 246, 0.08)"
                  stroke="rgba(56, 130, 246, 0.15)"
                  strokeWidth="1"
                />
                <text x={mapWidth * 0.06} y={mapHeight * 0.12} fontSize="9" fill="rgba(56, 130, 246, 0.3)" fontWeight="600">
                  LAKE MENDOTA
                </text>
                <path
                  d={`M ${mapWidth * 0.7} ${mapHeight} Q ${mapWidth * 0.75} ${mapHeight * 0.85} ${mapWidth * 0.85} ${mapHeight * 0.9} L ${mapWidth} ${mapHeight * 0.85} L ${mapWidth} ${mapHeight} Z`}
                  fill="rgba(56, 130, 246, 0.08)"
                  stroke="rgba(56, 130, 246, 0.15)"
                  strokeWidth="1"
                />
                <text x={mapWidth * 0.78} y={mapHeight * 0.95} fontSize="9" fill="rgba(56, 130, 246, 0.3)" fontWeight="600">
                  LAKE MONONA
                </text>
              </>
            )}

            {/* Heatmap blobs */}
            {heatmapGradients.map((cluster, i) => (
              <circle
                key={i}
                cx={cluster.x}
                cy={cluster.y}
                r={30 + cluster.intensity / 5}
                fill={`url(#heat-${i})`}
              />
            ))}

            {/* Post pins */}
            {filteredPosts.map(post => {
              if (!post.lat || !post.lng) return null
              const { x, y } = latLngToXY(post.lat, post.lng, selectedCity.bounds, mapWidth, mapHeight)
              return (
                <PostPin
                  key={post.id}
                  post={post}
                  x={x}
                  y={y}
                  isSelected={selectedPost?.id === post.id}
                  onClick={setSelectedPost}
                  categories={activeCategories}
                />
              )
            })}
          </svg>

          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            fontSize: 10,
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#6366F1' }} />
              Low
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#F59E0B' }} />
              Medium
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#EF4444' }} />
              Hot
            </span>
          </div>
        </div>
      )}

      {/* Selected Post Detail */}
      {selectedPost && (
        <div style={{
          background: isState ? 'rgba(217, 119, 6, 0.08)' : 'rgba(99, 102, 241, 0.08)',
          border: `1px solid ${isState ? 'rgba(217, 119, 6, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          animation: 'slide-up 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <span
              className="post-category-tag"
              style={{
                background: `${selectedCat?.color}22`,
                color: selectedCat?.color,
                borderColor: `${selectedCat?.color}44`
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{selectedCat?.icon && <Icon name={selectedCat.icon} size={14} />} {selectedCat?.label}</span>
            </span>
            <button
              onClick={() => setSelectedPost(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                width: 28,
                height: 28,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font)'
              }}
            >✕</button>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {selectedPost.title}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
            {selectedPost.description}
          </p>

          {/* Media preview */}
          {selectedPost.media && selectedPost.media.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto' }}>
              {selectedPost.media.map((m, i) => (
                <img
                  key={i}
                  src={m.preview}
                  alt={`Evidence ${i + 1}`}
                  style={{
                    width: 120,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="ui-location" size={11} /> {selectedPost.location} · {selectedPost.votes} votes · {selectedPost.createdAt}
            </div>
            {isState || isHomeCity ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onVote(selectedPost.id, 1)}
                  className={`vote-btn ${selectedPost.userVote === 1 ? 'active-up' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 14 }}
                >▲</button>
                <button
                  onClick={() => onVote(selectedPost.id, -1)}
                  className={`vote-btn ${selectedPost.userVote === -1 ? 'active-down' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 14 }}
                >▼</button>
              </div>
            ) : (
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '4px 10px',
                borderRadius: 6
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="ui-eye" size={11} /> View only</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Issues List */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        {search
          ? `Results for "${search}"`
          : isState
            ? 'Statewide Issues'
            : `Issues in ${selectedCity.name}`
        }
      </h3>
      {filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', opacity: 0.5 }}><Icon name={isState ? 'ui-scope-state' : 'ui-explore'} size={32} /></div>
          <div>No issues found{search ? ` matching "${search}"` : ''}.</div>
        </div>
      )}
      {filteredPosts.map(post => {
        const cat = activeCategories.find(c => c.id === post.category)
        return (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="activity-item"
            style={{
              cursor: 'pointer',
              borderColor: selectedPost?.id === post.id ? (isState ? 'rgba(217,119,6,0.4)' : 'rgba(99,102,241,0.4)') : undefined,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${cat?.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: cat?.color
            }}>
              {cat?.icon && <Icon name={cat.icon} size={18} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {post.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ui-location" size={10} /> {post.location} · {post.votes} votes
              </div>
            </div>
            {post.media && post.media.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon name="ui-camera" size={11} /> {post.media.length}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
