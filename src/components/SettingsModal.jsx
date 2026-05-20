import { useState, useEffect } from 'react'
import Icon from './Icon'
import { useAuth } from '../lib/auth'
import { updateProfile } from '../lib/supabase'
import { CITIES } from '../lib/cities'

const DEFAULT_INCOGNITO_KEY = 'pulse_default_incognito'

export default function SettingsModal({ onClose }) {
  const { user, profile, refreshProfile } = useAuth()
  const [defaultIncognito, setDefaultIncognito] = useState(() => {
    try { return localStorage.getItem(DEFAULT_INCOGNITO_KEY) === 'true' } catch { return false }
  })
  const [citySaving, setCitySaving] = useState(false)
  const [cityError, setCityError] = useState(null)

  // Esc to close + body scroll lock.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const toggleDefaultIncognito = () => {
    const next = !defaultIncognito
    setDefaultIncognito(next)
    try { localStorage.setItem(DEFAULT_INCOGNITO_KEY, next ? 'true' : 'false') } catch {}
  }

  const city = profile?.city || 'Oshkosh'
  const state = profile?.state || 'WI'
  const currentCityId = CITIES.find(c => c.name === city && c.state === state)?.id

  const handleCityChange = async (cityId) => {
    if (!user) return
    const next = CITIES.find(c => c.id === cityId)
    if (!next || (next.name === city && next.state === state)) return
    setCityError(null)
    setCitySaving(true)
    try {
      const res = await updateProfile(user.id, { city: next.name, state: next.state })
      if (res?.error) {
        setCityError(res.error.message || 'Could not switch city')
      } else {
        await refreshProfile?.()
      }
    } catch (err) {
      setCityError(err?.message || 'Could not switch city')
    } finally {
      setCitySaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        style={{ maxWidth: 460, padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(255,51,102,0.12)',
              border: '1px solid rgba(255,51,102,0.3)',
              color: '#FF3366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon name="ui-info" size={16} />
            </div>
            <h2 id="settings-title" style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >✕</button>
        </div>

        <div style={{ padding: '6px 0 18px' }}>
          {/* PREFERENCES */}
          <Section title="Preferences">
            <Row
              title="Default to incognito"
              description="Start every session anonymized. You can still toggle off in the header."
              control={<Toggle checked={defaultIncognito} onChange={toggleDefaultIncognito} />}
            />
            <Row
              title="Notifications"
              description="Push and email alerts for Pulses you're watching."
              control={<ComingSoon />}
            />
          </Section>

          {/* LOCATION */}
          <Section title="Location">
            <Row
              title="Your city"
              description={cityError || `Pulses you post and your profile location reflect this city.`}
              control={
                user ? (
                  <CitySelect
                    value={currentCityId}
                    disabled={citySaving}
                    onChange={handleCityChange}
                  />
                ) : (
                  <Mono>{city}, {state}</Mono>
                )
              }
            />
          </Section>

          {/* ACCOUNT */}
          <Section title="Account">
            <Row
              title="Verification"
              description={profile?.is_verified ? 'Verified resident' : 'Not yet verified'}
              control={
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 10,
                  background: profile?.is_verified ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                  color: profile?.is_verified ? '#22C55E' : '#F59E0B',
                  border: `1px solid ${profile?.is_verified ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`
                }}>
                  {profile?.is_verified ? 'Verified' : 'Pending'}
                </span>
              }
            />
            <Row
              title="Export my data"
              description="Download everything Pulse has stored about you."
              control={<ComingSoon />}
            />
            <Row
              title="Delete my account"
              description="Permanently remove your profile, Pulses, and activity."
              control={<ComingSoon />}
            />
          </Section>

          {/* ABOUT */}
          <Section title="About">
            <Row title="App version" control={<Mono>v1.0.0</Mono>} />
            <Row
              title="Privacy policy"
              control={<LinkPlaceholder>Coming soon</LinkPlaceholder>}
            />
            <Row
              title="Terms of service"
              control={<LinkPlaceholder>Coming soon</LinkPlaceholder>}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Internal building blocks — kept local to the file since nothing else needs them.
// ---------------------------------------------------------------------------

function Section({ title, children }) {
  return (
    <div style={{ padding: '12px 24px 4px' }}>
      <div style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        marginBottom: 6
      }}>{title}</div>
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden'
      }}>
        {children}
      </div>
    </div>
  )
}

function Row({ title, description, control }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{description}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        border: 'none',
        background: checked ? 'linear-gradient(135deg, #FF3366, #C2185B)' : 'rgba(255,255,255,0.12)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        padding: 0
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: checked ? 21 : 3,
        width: 20,
        height: 20,
        borderRadius: 10,
        background: 'white',
        transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
      }} />
    </button>
  )
}

function ComingSoon({ label = 'Coming soon' }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      padding: '4px 10px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid var(--border)'
    }}>{label}</span>
  )
}

function Mono({ children }) {
  return (
    <span style={{
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 12,
      color: 'var(--text-secondary)'
    }}>{children}</span>
  )
}

function LinkPlaceholder({ children }) {
  return (
    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{children}</span>
  )
}

function CitySelect({ value, onChange, disabled }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      style={{
        height: 34,
        padding: '0 28px 0 12px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.06)',
        color: 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font)',
        cursor: disabled ? 'wait' : 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%276%27 viewBox=%270 0 10 6%27 fill=%27none%27><path d=%27M1 1l4 4 4-4%27 stroke=%27%23E5E7EB%27 stroke-width=%271.5%27 stroke-linecap=%27round%27/></svg>")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {!value && <option value="">Pick a city…</option>}
      {CITIES.map(c => (
        <option key={c.id} value={c.id} style={{ background: '#1A1A2E', color: '#E5E7EB' }}>
          {c.label}
        </option>
      ))}
    </select>
  )
}
