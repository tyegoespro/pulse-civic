import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, STATE_CATEGORIES } from '../constants'
import { findSimilarPosts } from '../lib/similarity'
import { analyzePostImpact, isGeminiConfigured } from '../lib/gemini'
import { reverseGeocode } from '../lib/geocoding'
import SimilarPostCard from './SimilarPostCard'
import LeafletMap from './LeafletMap'
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
  const [locationAutoFilled, setLocationAutoFilled] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const geocodeTimeoutRef = useRef(null)
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

  // Reverse geocode the dropped pin → auto-fill location text
  useEffect(() => {
    if (pinLat == null || pinLng == null) return
    if (!locationAutoFilled) return
    clearTimeout(geocodeTimeoutRef.current)
    setGeocoding(true)
    geocodeTimeoutRef.current = setTimeout(async () => {
      const address = await reverseGeocode(pinLat, pinLng)
      if (address) setLocation(address)
      setGeocoding(false)
    }, 600)
    return () => clearTimeout(geocodeTimeoutRef.current)
  }, [pinLat, pinLng, locationAutoFilled])

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
        <label className="form-label">What's your Pulse?</label>
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
              Similar voices already posted:
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
          placeholder={isState ? "Describe your statewide Pulse in detail..." : "Describe your Pulse in detail..."}
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
                Visual evidence helps verify your Pulse · Max 4 files
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
          onChange={e => { setLocation(e.target.value); setLocationAutoFilled(false) }}
          placeholder={
            geocoding
              ? 'Finding location…'
              : isState
                ? 'e.g. Statewide, Madison, WI…'
                : 'Drop a pin or type — e.g. Main St & 9th Ave'
          }
          className="form-input"
          style={{ marginBottom: 8 }}
        />

        {/* Pin Drop Map */}
        {!isState && (
          <div className="create-leaflet-map">
            <LeafletMap
              center={{ lat: 44.024, lng: -88.543 }}
              zoom={14}
              interactive={true}
              dropPin={pinLat && pinLng ? { lat: pinLat, lng: pinLng } : null}
              onDropPinMove={({ lat, lng }) => {
                setPinLat(lat)
                setPinLng(lng)
              }}
              onMapClick={({ lat, lng }) => {
                setPinLat(lat)
                setPinLng(lng)
              }}
            />
            {!pinLat && !pinLng && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 12,
                pointerEvents: 'none',
                zIndex: 500
              }}>
                <Icon name="ui-location" size={18} style={{ marginBottom: 4, opacity: 0.4 }} />
                <div>Tap to drop a pin</div>
              </div>
            )}
            {pinLat && pinLng && (
              <div style={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'rgba(15, 15, 26, 0.8)',
                padding: '2px 8px',
                borderRadius: 6,
                zIndex: 500,
                pointerEvents: 'none'
              }}>
                {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
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
