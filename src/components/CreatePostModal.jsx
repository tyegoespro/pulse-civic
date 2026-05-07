import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { findSimilarPosts } from '../lib/similarity'
import { analyzePostImpact, isGeminiConfigured } from '../lib/gemini'
import SimilarPostCard from './SimilarPostCard'
import Icon from './Icon'

export default function CreatePostModal({ onClose, onSubmit, existingPosts, incognito, scope = 'local' }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(null)
  const [location, setLocation] = useState('')
  const [similarPosts, setSimilarPosts] = useState([])
  const [media, setMedia] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [pinLat, setPinLat] = useState(null)
  const [pinLng, setPinLng] = useState(null)
  const fileInputRef = useRef(null)

  // AI Impact Analysis state
  const [impact, setImpact] = useState(null)
  const [analyzingImpact, setAnalyzingImpact] = useState(false)
  const debounceRef = useRef(null)

  const activeCategories = scope === 'state' ? STATE_CATEGORIES : CATEGORIES
  const isState = scope === 'state'

  // Real-time duplicate detection (keyword)
  useEffect(() => {
    if (title.length > 10) {
      const scopedPosts = existingPosts.filter(p => p.scope === scope)
      const matches = findSimilarPosts(title, scopedPosts)
      setSimilarPosts(matches)
    } else {
      setSimilarPosts([])
    }
  }, [title, existingPosts, scope])

  // Debounced AI impact analysis
  useEffect(() => {
    if (!isGeminiConfigured()) return
    if (!title || title.length < 15 || !category) {
      setImpact(null)
      return
    }

    clearTimeout(debounceRef.current)
    setAnalyzingImpact(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await analyzePostImpact(title, description, category)
        setImpact(result)
      } catch {
        setImpact(null)
      } finally {
        setAnalyzingImpact(false)
      }
    }, 1500)

    return () => clearTimeout(debounceRef.current)
  }, [title, description, category])

  const canSubmit = title && category && location

  const handleMediaAdd = (files) => {
    const newMedia = Array.from(files)
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .slice(0, 4 - media.length)
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name
      }))
    setMedia(prev => [...prev, ...newMedia].slice(0, 4))
  }

  const handleMediaRemove = (index) => {
    setMedia(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleMediaAdd(e.dataTransfer.files)
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      title, description, category, location, impact, media, scope,
      lat: pinLat,
      lng: pinLng
    })
  }

  const getScoreColor = (score) => {
    if (score >= 75) return '#22C55E'
    if (score >= 50) return '#F59E0B'
    if (score >= 25) return '#FB923C'
    return '#EF4444'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {isState && <Icon name="ui-scope-state" size={20} color="#D97706" />}
            {isState ? 'Create a State Pulse' : 'Create a Pulse'}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Scope Badge */}
        {isState && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            marginBottom: 16,
            borderRadius: 20,
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            fontSize: 12,
            fontWeight: 600,
            color: '#D97706'
          }}>
            <Icon name="ui-scope-state" size={14} />
            Posting to Wisconsin Statewide
          </div>
        )}

        {/* Category Selection */}
        <label className="form-label">Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {activeCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="category-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                ...(category === cat.id ? {
                  background: `${cat.color}22`,
                  borderColor: cat.color,
                  color: cat.color,
                  '--highlight-color': cat.color,
                  '--highlight-bg': `${cat.color}22`
                } : {})
              }}
            >
              <Icon name={cat.icon} size={14} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <label className="form-label">What's the issue?</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={isState ? "e.g. Wisconsin school funding needs reform..." : "e.g. Potholes on Main Street..."}
          className="form-input"
          style={{ fontSize: 15, marginBottom: 8 }}
        />

        {/* Similar Posts Alert */}
        {similarPosts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 12,
              color: '#A78BFA',
              marginBottom: 8,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}>
              <Icon name="ui-lightning" size={13} />
              Similar issues already posted:
            </div>
            {similarPosts.map(p => (
              <SimilarPostCard key={p.id} post={p} onMerge={() => onClose()} />
            ))}
          </div>
        )}

        {/* Description */}
        <label className="form-label" style={{ marginTop: 12 }}>Details</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={isState ? "Describe the statewide issue in detail..." : "Describe the issue in detail..."}
          rows={4}
          className="form-input"
          style={{ marginBottom: 16 }}
        />

        {/* Media Upload */}
        <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="ui-camera" size={14} />
          Evidence (photos/videos)
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--indigo)' : 'var(--border)'}`,
            borderRadius: 14,
            padding: media.length > 0 ? '12px' : '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 16,
            background: dragOver ? 'rgba(99,102,241,0.05)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={e => handleMediaAdd(e.target.files)}
            style={{ display: 'none' }}
          />
          {media.length === 0 ? (
            <>
              <div style={{
                marginBottom: 6,
                opacity: 0.4,
                display: 'flex',
                justifyContent: 'center',
                color: 'var(--text-tertiary)'
              }}>
                <Icon name="ui-camera" size={32} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Tap to add photos or videos
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Visual evidence helps verify issues · Max 4 files
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-start' }} onClick={e => e.stopPropagation()}>
              {media.map((m, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
                  {m.type === 'video' ? (
                    <video
                      src={m.preview}
                      style={{ width: 100, height: 80, objectFit: 'cover', display: 'block', borderRadius: 10, border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <img
                      src={m.preview}
                      alt={m.name}
                      style={{ width: 100, height: 80, objectFit: 'cover', display: 'block', borderRadius: 10, border: '1px solid var(--border)' }}
                    />
                  )}
                  {/* Type badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: 4,
                    padding: '3px 5px',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}>
                    <Icon name={m.type === 'video' ? 'ui-play' : 'ui-camera'} size={10} />
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMediaRemove(i) }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      color: 'white',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font)'
                    }}
                  >✕</button>
                </div>
              ))}
              {media.length < 4 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 100,
                    height: 80,
                    borderRadius: 10,
                    border: '1px dashed var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: 24,
                    color: 'var(--text-muted)'
                  }}
                >
                  +
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Impact Analysis Card */}
        {(analyzingImpact || impact) && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 16,
            animation: 'slide-up 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
              fontSize: 13,
              fontWeight: 700,
              color: '#A78BFA'
            }}>
              <Icon name="ui-ai-spark" size={16} />
              AI Impact Analysis
              {analyzingImpact && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  marginLeft: 'auto'
                }}>
                  Analyzing...
                </span>
              )}
            </div>
            {impact && !analyzingImpact && (
              <>
                {/* Score Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: getScoreColor(impact.score),
                    lineHeight: 1,
                    minWidth: 50
                  }}>
                    {impact.score}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: 6,
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${impact.score}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(impact.score)}, ${getScoreColor(impact.score)}88)`,
                        borderRadius: 3,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
                      CIVIC IMPACT SCORE
                    </div>
                  </div>
                </div>

                {/* Analysis */}
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                  {impact.analysis}
                </p>

                {/* Constructive Feedback */}
                {impact.constructiveFeedback && (
                  <div style={{
                    fontSize: 12,
                    color: '#F59E0B',
                    background: 'rgba(245, 158, 11, 0.08)',
                    padding: '8px 12px',
                    borderRadius: 8,
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6
                  }}>
                    <Icon name="ui-lightbulb" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    {impact.constructiveFeedback}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Location */}
        <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="ui-location" size={14} />
          Location
        </label>
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder={isState ? "e.g. Statewide, Madison, WI..." : "e.g. Main St & 9th Ave"}
          className="form-input"
          style={{ marginBottom: 8 }}
        />

        {/* Pin Drop Map */}
        {!isState && (
          <div
            className={`create-map-container ${pinLat ? 'has-pin' : ''}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width
              const y = (e.clientY - rect.top) / rect.height
              // Map to Oshkosh area coordinates
              const lat = 44.024 + (0.5 - y) * 0.03
              const lng = -88.543 + (x - 0.5) * 0.04
              setPinLat(lat)
              setPinLng(lng)
            }}
          >
            {/* Grid */}
            <svg className="detail-map-grid" viewBox="0 0 300 200" preserveAspectRatio="none">
              {[40, 80, 120, 160].map(y => (
                <line key={`h${y}`} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              ))}
              {[60, 120, 180, 240].map(x => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              ))}
              <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            </svg>

            {pinLat && pinLng ? (
              <>
                <div
                  className="detail-map-pin"
                  style={{
                    left: `${Math.max(5, Math.min(95, 50 + ((pinLng - (-88.543)) / 0.04) * 100))}%`,
                    top: `${Math.max(5, Math.min(95, 50 - ((pinLat - 44.024) / 0.03) * 100))}%`
                  }}
                >
                  <div className="detail-map-pin-dot" />
                  <div className="detail-map-pin-pulse" />
                </div>
                <div className="create-map-coords">
                  {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
                </div>
              </>
            ) : (
              <div className="create-map-hint">
                <Icon name="ui-location" size={18} style={{ marginBottom: 4, opacity: 0.4 }} />
                <div>Tap to drop a pin</div>
              </div>
            )}
          </div>
        )}

        {/* Incognito Indicator (read-only — controlled by global toggle) */}
        {incognito && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            marginBottom: 20,
            borderRadius: 12,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            color: '#C4B5FD'
          }}>
            <Icon name="ui-incognito" size={22} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD' }}>Posting Incognito</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Your identity is hidden. Toggle off in the header.
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary full-width"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            ...(incognito ? {
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
            } : isState ? {
              background: 'linear-gradient(135deg, #D97706, #B45309)'
            } : {})
          }}
        >
          {incognito ? (
            <>
              <Icon name="ui-incognito" size={16} />
              Post Incognito
            </>
          ) : isState ? (
            <>
              <Icon name="ui-scope-state" size={16} />
              Post to Wisconsin Pulse
            </>
          ) : 'Post to Pulse'}
        </button>
      </div>
    </div>
  )
}
