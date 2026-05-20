import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { useAuth } from '../lib/auth'
import { submitVerification } from '../lib/supabase'
import { forwardGeocode } from '../lib/geocoding'
import { CITIES } from '../lib/cities'

// Maps a forward-geocoded result to the nearest CITY entry, if any are close.
const matchCity = ({ lat, lng }) => {
  let best = null
  let bestDist = Infinity
  for (const c of CITIES) {
    const dLat = c.center.lat - lat
    const dLng = c.center.lng - lng
    const dist = Math.sqrt(dLat * dLat + dLng * dLng)
    if (dist < bestDist) {
      bestDist = dist
      best = c
    }
  }
  // ~0.7° is roughly 50mi at this latitude. Beyond that, we don't claim a match.
  if (best && bestDist < 0.7) return best
  return null
}

export default function VerificationModal({ onClose, reason }) {
  const { user, refreshProfile } = useAuth()
  const [phone, setPhone] = useState('')
  const [zip, setZip] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [resolvedCity, setResolvedCity] = useState(null)
  const zipTimeoutRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // Debounced ZIP → city lookup. Once they type 5 digits we resolve their city
  // so they can confirm "you're verifying as a resident of Oshkosh, WI" before
  // submitting.
  useEffect(() => {
    clearTimeout(zipTimeoutRef.current)
    if (!/^\d{5}$/.test(zip.trim())) {
      setResolvedCity(null)
      setResolving(false)
      return
    }
    setResolving(true)
    zipTimeoutRef.current = setTimeout(async () => {
      const hit = await forwardGeocode(`${zip.trim()}, USA`)
      if (hit) {
        const city = matchCity(hit)
        if (city) {
          setResolvedCity({ name: city.name, state: city.state, label: city.label })
        } else {
          // No supported city nearby — surface a friendly note. Still allow
          // submit so we capture the request, but we won't change profile.city.
          setResolvedCity({
            name: null,
            state: null,
            label: hit.label?.split(',').slice(0, 2).join(',').trim() || 'Outside supported area'
          })
        }
      } else {
        setResolvedCity(null)
      }
      setResolving(false)
    }, 500)
    return () => clearTimeout(zipTimeoutRef.current)
  }, [zip])

  const canSubmit = !submitting
    && /^\d{5}$/.test(zip.trim())
    && confirmed
    && !!user

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await submitVerification({
        userId: user.id,
        phone: phone.trim() || null,
        zip: zip.trim(),
        city: resolvedCity?.name || null,
        state: resolvedCity?.state || null
      })
      if (res?.error) {
        setError(res.error.message || 'Could not submit verification')
      } else {
        await refreshProfile?.()
        onClose?.()
      }
    } catch (err) {
      setError(err?.message || 'Could not submit verification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-title"
        style={{ maxWidth: 460, padding: 0, overflow: 'hidden' }}
      >
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #FF3366 0%, #C2185B 60%, #8B1A47 100%)',
          padding: '28px 24px 24px',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.25)',
              border: 'none',
              color: 'white',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >✕</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              border: '2px solid rgba(255,255,255,0.5)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon name="ui-verified" size={18} />
            </div>
            <h2 id="verify-title" style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.01em'
            }}>Get verified</h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.45 }}>
            {reason || 'Pulse is for real residents. Verify your phone and ZIP to post, vote, and comment. Reading stays free.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '22px 22px 22px' }}>
          {/* ZIP */}
          <label htmlFor="verify-zip" style={fieldLabel}>ZIP code</label>
          <input
            id="verify-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="54901"
            disabled={submitting}
            onFocus={e => focusStyles(e.target, true)}
            onBlur={e => focusStyles(e.target, false)}
            style={fieldInput}
          />
          {/* Resolved city pill */}
          <div style={{ minHeight: 22, marginTop: 6, fontSize: 12 }}>
            {resolving && (
              <span style={{ color: 'var(--text-tertiary)' }}>Looking up ZIP…</span>
            )}
            {!resolving && resolvedCity?.name && (
              <span style={{ color: '#6EE7B7', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="ui-location" size={11} />
                Verifying as a resident of {resolvedCity.name}, {resolvedCity.state}
              </span>
            )}
            {!resolving && resolvedCity && !resolvedCity.name && (
              <span style={{ color: '#FCD34D' }}>
                ZIP resolves to <strong>{resolvedCity.label}</strong> — outside currently-supported cities. We'll still record your request.
              </span>
            )}
          </div>

          {/* Phone (optional for now while OTP is deferred) */}
          <label htmlFor="verify-phone" style={{ ...fieldLabel, marginTop: 12 }}>Phone <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>(optional pre-launch)</span></label>
          <input
            id="verify-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            disabled={submitting}
            onFocus={e => focusStyles(e.target, true)}
            onBlur={e => focusStyles(e.target, false)}
            style={fieldInput}
          />
          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
            At launch we'll text a 6-digit code to confirm your number. For now this is recorded but not challenged.
          </div>

          {/* Confirm */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              disabled={submitting}
              style={{ marginTop: 2, accentColor: '#FF3366' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              I confirm I'm a real resident of this ZIP, that I'm 13 or older, and that I'll follow the community rules in the <a href="#" onClick={(e) => { e.preventDefault() }} style={{ color: '#FF7C9E' }}>Terms of Service</a>.
            </span>
          </label>

          {error && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
              fontSize: 12
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              height: 46,
              marginTop: 18,
              borderRadius: 12,
              background: canSubmit ? 'linear-gradient(135deg, #FF3366, #C2185B)' : 'rgba(255,255,255,0.06)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.55,
              fontFamily: 'var(--font)',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Submitting…' : 'Verify and continue'}
          </button>

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.5 }}>
            Pulse never sells your data. Your phone is used only to confirm you're a real person.
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldLabel = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6
}

const fieldInput = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--text-primary)',
  fontSize: 16,
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
}

const focusStyles = (el, focused) => {
  el.style.borderColor = focused ? '#FF3366' : 'var(--border)'
  el.style.boxShadow = focused ? '0 0 0 3px rgba(255,51,102,0.18)' : 'none'
}
