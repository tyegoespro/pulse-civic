import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'
import { useAuth } from '../lib/auth'

export default function AuthModal({ onClose, reason }) {
  const { configured, signInWithGoogle, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState(null)
  const emailInputRef = useRef(null)

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

  // Autofocus email field for keyboard users on open.
  useEffect(() => {
    if (configured && !magicSent) emailInputRef.current?.focus()
  }, [configured, magicSent])

  const handleGoogle = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await signInWithGoogle()
      if (res?.error) setError(res.error.message || 'Google sign-in failed')
    } catch (e) {
      setError(e?.message || 'Google sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMagic = async (e) => {
    e?.preventDefault?.()
    setError(null)
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    setSubmitting(true)
    try {
      const res = await signInWithMagicLink(email.trim())
      if (res?.error) {
        setError(res.error.message || 'Could not send magic link')
      } else {
        setMagicSent(true)
      }
    } catch (e) {
      setError(e?.message || 'Could not send magic link')
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
        aria-labelledby="auth-modal-title"
        style={{ maxWidth: 420, padding: 0, overflow: 'hidden' }}
      >
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #FF3366 0%, #C2185B 60%, #8B1A47 100%)',
          padding: '28px 24px 22px',
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
            marginBottom: 6,
            display: 'flex',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.95)'
          }}>
            <Icon name="ui-brand-pulse" size={36} />
          </div>
          <h2 id="auth-modal-title" style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em'
          }}>Sign in to Pulse</h2>
          <p style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.4
          }}>
            {reason || 'Vote, post, and watch issues across your city and state.'}
          </p>
        </div>

        <div style={{ padding: '22px 22px 24px' }}>
          {!configured && (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#FCD34D',
              padding: '10px 12px',
              borderRadius: 10,
              fontSize: 12,
              marginBottom: 14,
              lineHeight: 1.45
            }}>
              Supabase isn't configured yet. Add <code style={codeStyle}>VITE_SUPABASE_URL</code> and <code style={codeStyle}>VITE_SUPABASE_ANON_KEY</code> to your <code style={codeStyle}>.env.local</code> and restart the dev server.
            </div>
          )}

          {magicSent ? (
            <div style={{
              padding: '14px 14px',
              borderRadius: 12,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#6EE7B7',
              fontSize: 13,
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Check your inbox.</div>
              We sent a magic link to <strong>{email}</strong>. Click it to sign in — this window will refresh automatically.
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                disabled={!configured || submitting}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 12,
                  background: 'white',
                  color: '#1F2937',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: configured && !submitting ? 'pointer' : 'not-allowed',
                  opacity: configured && !submitting ? 1 : 0.55,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  fontFamily: 'var(--font)'
                }}
              >
                <GoogleGlyph />
                Continue with Google
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '18px 0 14px',
                color: 'var(--text-tertiary)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                or
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <form onSubmit={handleMagic}>
                <label
                  htmlFor="auth-email"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6
                  }}>
                  Email magic link
                </label>
                <input
                  id="auth-email"
                  ref={emailInputRef}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#FF3366'; e.target.style.boxShadow = '0 0 0 3px rgba(255,51,102,0.18)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  placeholder="you@example.com"
                  disabled={!configured || submitting}
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-primary)',
                    fontSize: 16, /* 16px+ prevents iOS zoom on focus */
                    fontFamily: 'var(--font)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                />
                <button
                  type="submit"
                  disabled={!configured || submitting}
                  style={{
                    width: '100%',
                    height: 44,
                    marginTop: 10,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #FF3366, #C2185B)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: configured && !submitting ? 'pointer' : 'not-allowed',
                    opacity: configured && !submitting ? 1 : 0.55,
                    fontFamily: 'var(--font)'
                  }}
                >
                  {submitting ? 'Sending...' : 'Email me a link'}
                </button>
              </form>
            </>
          )}

          {error && (
            <div style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
              fontSize: 12,
              lineHeight: 1.45
            }}>
              {error}
            </div>
          )}

          <p style={{
            marginTop: 16,
            fontSize: 11,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            By continuing, you agree that your votes and posts may be shown to other users in your area.
          </p>
        </div>
      </div>
    </div>
  )
}

const codeStyle = {
  background: 'rgba(0,0,0,0.35)',
  padding: '1px 5px',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  color: '#FDE68A'
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.887-1.737 2.986-4.296 2.986-7.351z"/>
      <path fill="#34A853" d="M12 22c2.7 0 4.964-.895 6.614-2.422l-3.227-2.51c-.895.6-2.04.955-3.387.955-2.605 0-4.81-1.76-5.596-4.123H3.067v2.59A9.996 9.996 0 0 0 12 22z"/>
      <path fill="#FBBC05" d="M6.404 13.9a5.99 5.99 0 0 1 0-3.8V7.51H3.067a10.01 10.01 0 0 0 0 8.98l3.337-2.59z"/>
      <path fill="#EA4335" d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.96 2.99 14.695 2 12 2A9.996 9.996 0 0 0 3.067 7.51L6.404 10.1C7.19 7.737 9.395 5.977 12 5.977z"/>
    </svg>
  )
}
