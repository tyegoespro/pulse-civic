import { useState, useMemo } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { CITIES, CITY_ISSUES } from '../lib/cities'
import LeafletMap from './LeafletMap'
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

// Wisconsin state map region data — real lat/lng for Leaflet rendering
const WI_STATE_REGIONS = [
  { id: 'milwaukee', label: 'Milwaukee', lat: 43.0389, lng: -87.9065, population: '577K' },
  { id: 'madison', label: 'Madison', lat: 43.0731, lng: -89.4012, population: '270K' },
  { id: 'green-bay', label: 'Green Bay', lat: 44.5133, lng: -88.0133, population: '107K' },
  { id: 'oshkosh', label: 'Oshkosh', lat: 44.0247, lng: -88.5426, population: '67K', isHome: true },
  { id: 'appleton', label: 'Appleton', lat: 44.2619, lng: -88.4154, population: '75K' },
  { id: 'eau-claire', label: 'Eau Claire', lat: 44.8113, lng: -91.4985, population: '70K' },
  { id: 'la-crosse', label: 'La Crosse', lat: 43.8014, lng: -91.2396, population: '52K' },
  { id: 'superior', label: 'Superior', lat: 46.7208, lng: -92.1041, population: '27K' },
  { id: 'wausau', label: 'Wausau', lat: 44.9591, lng: -89.6301, population: '39K' },
  { id: 'racine', label: 'Racine', lat: 42.7261, lng: -87.7829, population: '78K' },
]

// Wisconsin map center + zoom for state-wide view
const WI_CENTER = { lat: 44.6, lng: -89.7 }
const WI_ZOOM = 6

function StateMapView({ posts, onSelectPost, selectedPost, categories }) {
  // Distribute state posts to regions based on location text
  const regionData = useMemo(() => {
    return WI_STATE_REGIONS.map(region => {
      const regionPosts = posts.filter(p => {
        const loc = (p.location || '').toLowerCase()
        const title = (p.title || '').toLowerCase()
        if (loc === 'statewide' || loc === 'multiple counties') return true
        if (loc.includes(region.label.toLowerCase())) return true
        if (title.includes(region.label.toLowerCase())) return true
        return false
      })
      const totalVotes = regionPosts.reduce((sum, p) => sum + p.votes, 0)
      return { ...region, posts: regionPosts, totalVotes, issueCount: regionPosts.length }
    })
  }, [posts])

  const pins = useMemo(() => regionData.map(region => {
    const hasIssues = region.issueCount > 0
    const color = region.isHome
      ? '#D97706'
      : hasIssues
        ? '#D97706'
        : 'rgba(180, 180, 200, 0.5)'
    const label = hasIssues
      ? `${region.label} · ${region.totalVotes.toLocaleString()} votes${region.isHome ? ' · Home' : ''}`
      : `${region.label}${region.isHome ? ' · Home' : ''}`
    return {
      id: region.id,
      lat: region.lat,
      lng: region.lng,
      color,
      selected: region.isHome || hasIssues,
      label
    }
  }), [regionData])

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
        zIndex: 500,
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
          {posts.length} voices
        </span>
      </div>

      <div className="state-leaflet-map">
        <LeafletMap
          center={WI_CENTER}
          zoom={WI_ZOOM}
          pins={pins}
          interactive={true}
        />
      </div>

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
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#D97706' }} />
          Active Region
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: '#D97706', boxShadow: '0 0 6px #D97706' }} />
          Your City
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'rgba(180, 180, 200, 0.5)' }} />
          Quiet
        </span>
      </div>
    </div>
  )
}

export default function ExploreView({ posts, onVote, scope = 'local', onPostClick }) {
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
                  {selectedCity.population} residents · {cityPosts.length} voices
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
                          {city.population} · {city.id === 'oshkosh' ? posts.filter(p => p.lat && p.lng).length : (CITY_ISSUES[city.id]?.length || 0)} voices
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#D97706' }}>Wisconsin Statewide Pulse</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
              All verified residents can vote · {posts.length} active voices
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
              You can check the Pulse in {selectedCity.name} but can't vote — you're verified in Oshkosh.
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
          placeholder={isState ? 'Search the statewide Pulse...' : `Search the Pulse in ${selectedCity.name}...`}
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
        /* Local City Map — Real Leaflet Map */
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {/* Map Label Overlay */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 16,
            zIndex: 500,
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
              {filteredPosts.length} voices
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

          <div className="explore-leaflet-map" style={{ height: 350 }}>
            <LeafletMap
              center={selectedCity.center}
              zoom={13}
              pins={filteredPosts.filter(p => p.lat && p.lng).map(post => {
                const cat = activeCategories.find(c => c.id === post.category)
                return {
                  id: post.id,
                  lat: post.lat,
                  lng: post.lng,
                  color: cat?.color || '#6366F1',
                  selected: selectedPost?.id === post.id,
                  label: post.title
                }
              })}
              onPinClick={(id) => {
                const post = filteredPosts.find(p => p.id === id)
                if (post) setSelectedPost(post)
              }}
              interactive={true}
            />
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            padding: '10px 16px',
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
          {onPostClick && (
            <button
              onClick={() => onPostClick(selectedPost)}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '10px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-accent)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                transition: 'all 0.2s ease'
              }}
            >
              View Full Details →
            </button>
          )}
        </div>
      )}

      {/* Issues List */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
        {search
          ? `Results for "${search}"`
          : isState
            ? 'Statewide Pulse'
            : `Pulse in ${selectedCity.name}`
        }
      </h3>
      {filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', opacity: 0.5 }}><Icon name={isState ? 'ui-scope-state' : 'ui-explore'} size={32} /></div>
          <div>No voices found{search ? ` matching "${search}"` : ''}.</div>
        </div>
      )}
      {filteredPosts.map(post => {
        const cat = activeCategories.find(c => c.id === post.category)
        return (
          <div
            key={post.id}
            onClick={() => {
              if (selectedPost?.id === post.id && onPostClick) {
                onPostClick(post)
              } else {
                setSelectedPost(post)
              }
            }}
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
            {selectedPost?.id === post.id && onPostClick ? (
              <span style={{ fontSize: 11, color: 'var(--text-accent)', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
                Details →
              </span>
            ) : post.media && post.media.length > 0 ? (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Icon name="ui-camera" size={11} /> {post.media.length}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
