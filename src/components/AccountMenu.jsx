import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { useAuth } from '../lib/auth'
import { updateProfile } from '../lib/supabase'

export default function AccountMenu({ onClose, onSignOut, onOpenSettings }) {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState(null)
  const initials = (displayName || profile?.display_name || user?.email || '?').slice(0, 1).toUpperCase()
  const dirty = (displayName !== (profile?.display_name || '')) || (bio !== (profile?.bio || ''))

  // Esc to close + lock body scroll while open.
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

  // Sync local fields when the underlying profile loads.
  useEffect(() => {
    setDisplayName(profile?.display_name || '')
    setBio(profile?.bio || '')
  }, [profile?.display_name, profile?.bio])

  const handleSave = async (e) => {
    e?.preventDefault?.()
    if (!user || !dirty) return
    setError(null)
    setSaving(true)
    try {
      const trimmedName = displayName.trim()
      if (!trimmedName) {
        setError('Display name can\'t be empty')
        setSaving(false)
        return
      }
      const res = await updateProfile(user.id, {
        display_name: trimmedName,
        bio: bio.trim() || null
      })
      if (res?.error) {
        setError(res.error.message || 'Could not save')
      } else {
        setSavedAt(Date.now())
        await refreshProfile?.()
      }
    } catch (e) {
      setError(e?.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    if (window.confirm('Sign out of Pulse?')) {
      onSignOut?.()
      onClose?.()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-menu-title"
        style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}
      >
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #FF3366 0%, #C2185B 60%, #8B1A47 100%)',
          padding: '28px 24px 24px',
          textAlign: 'center',
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
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.5)',
            margin: '0 auto 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 26
          }}>
            {initials}
          </div>
          <h2 id="account-menu-title" style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em'
          }}>{displayName || profile?.display_name || 'Your account'}</h2>
          {user?.email && (
            <p style={{
              margin: '4px 0 0',
              fontSize: 12,
              color: 'rgba(255,255,255,0.85)'
            }}>{user.email}</p>
          )}
          {profile?.is_verified && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 10,
              padding: '4px 10px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700
            }}>
              <Icon name="ui-verified" size={11} />
              Verified
            </div>
          )}
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px 22px 18px' }}>
          <label
            htmlFor="account-display-name"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: 6
            }}
          >Display name</label>
          <input
            id="account-display-name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="How others see you"
            maxLength={48}
            disabled={saving}
            onFocus={e => { e.target.style.borderColor = '#FF3366'; e.target.style.boxShadow = '0 0 0 3px rgba(255,51,102,0.18)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            style={{
              width: '100%',
              height: 42,
              padding: '0 14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontSize: 16,
              fontFamily: 'var(--font)',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          />

          <label
            htmlFor="account-bio"
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginTop: 14,
              marginBottom: 6
            }}
          >Bio (optional)</label>
          <textarea
            id="account-bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A line or two about you"
            maxLength={160}
            rows={2}
            disabled={saving}
            onFocus={e => { e.target.style.borderColor = '#FF3366'; e.target.style.boxShadow = '0 0 0 3px rgba(255,51,102,0.18)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font)',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          />

          <button
            type="submit"
            disabled={!dirty || saving}
            style={{
              width: '100%',
              height: 42,
              marginTop: 14,
              borderRadius: 12,
              background: dirty && !saving ? 'linear-gradient(135deg, #FF3366, #C2185B)' : 'rgba(255,255,255,0.06)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              opacity: dirty && !saving ? 1 : 0.55,
              fontFamily: 'var(--font)',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? 'Saving…' : savedAt ? 'Saved ✓' : 'Save changes'}
          </button>

          {error && (
            <div style={{
              marginTop: 12,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
              fontSize: 12,
              lineHeight: 1.45
            }}>{error}</div>
          )}
        </form>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 22px' }} />

        <div style={{ padding: '14px 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => { onOpenSettings?.(); onClose?.() }}
            style={{
              width: '100%',
              height: 42,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            <Icon name="ui-info" size={14} />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              height: 42,
              borderRadius: 12,
              background: 'transparent',
              color: '#FCA5A5',
              border: '1px solid rgba(239,68,68,0.4)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'all 0.2s ease'
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
