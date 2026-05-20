import Icon from './Icon'
import { useAuth } from '../lib/auth'

export default function Header({
  onBrandClick,
  incognito,
  onToggleIncognito,
  isPro = false,
  incognitoRemaining = 0,
  onShowPro,
  scope,
  onScopeChange,
  onInfoClick,
  activityBadge = 0,
  onActivityClick,
  onShowAuth,
  onSignOut
}) {
  const { user, profile, configured } = useAuth()
  const authReady = configured
  const initials = (profile?.display_name?.[0] || user?.email?.[0] || '?').toUpperCase()
  const avatarUrl = profile?.avatar && /^https?:\/\//.test(profile.avatar) ? profile.avatar : null
  return (
    <header className="app-header" style={incognito ? {
      background: 'rgba(139, 92, 246, 0.08)',
      borderBottomColor: 'rgba(139, 92, 246, 0.2)'
    } : {}}>
      <div className="app-header-inner">
        <div className="app-brand" onClick={onBrandClick}>
          <span className="app-brand-icon" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: incognito ? '#C4B5FD' : '#FF3366'
          }}>
            <Icon name={incognito ? 'ui-incognito' : 'ui-brand-pulse'} size={26} />
          </span>
          <h1 className="app-brand-name">{incognito ? 'Incognito' : 'Pulse'}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Info Button */}
          <button
            onClick={onInfoClick}
            className="header-action-btn"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease'
            }}
            title="About Pulse"
          >
            <Icon name="ui-info" size={16} />
          </button>
          {/* Activity Badge */}
          <button
            onClick={onActivityClick}
            className="header-action-btn"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.04)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              position: 'relative'
            }}
            title="Activity"
          >
            <Icon name="ui-activity" size={16} />
            {activityBadge > 0 && (
              <span className="tab-badge">{activityBadge > 9 ? '9+' : activityBadge}</span>
            )}
          </button>
          {/* Incognito Toggle */}
          <button
            onClick={onToggleIncognito}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: incognito
                ? '2px solid rgba(139, 92, 246, 0.5)'
                : '1px solid var(--border)',
              background: incognito
                ? 'rgba(139, 92, 246, 0.2)'
                : 'rgba(255,255,255,0.04)',
              color: incognito ? '#C4B5FD' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
              position: 'relative'
            }}
            title={
              incognito
                ? 'Exit incognito mode'
                : isPro
                  ? 'Enter incognito mode (Pro — unlimited posts)'
                  : `Enter incognito mode (${incognitoRemaining} of 3 free incognito posts left this month)`
            }
          >
            <Icon name="ui-incognito" size={18} />
            {incognito && (
              <div style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: '#8B5CF6',
                border: '2px solid var(--bg-primary)'
              }} />
            )}
            {!incognito && !isPro && (
              <div style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 14,
                height: 14,
                padding: '0 3px',
                borderRadius: 7,
                background: incognitoRemaining === 0 ? '#EF4444' : '#8B5CF6',
                border: '2px solid var(--bg-primary)',
                color: 'white',
                fontSize: 9,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                {incognitoRemaining}
              </div>
            )}
          </button>

          {/* Auth — only render when Supabase is configured */}
          {authReady && (user ? (
            <button
              onClick={onSignOut}
              title={`Account · ${user.email || 'Signed in'}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                border: '1px solid var(--border)',
                background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #FF3366, #C2185B)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                fontFamily: 'var(--font)',
                padding: 0,
                overflow: 'hidden'
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile?.display_name || 'Account'}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                initials || <Icon name="ui-verified" size={16} />
              )}
            </button>
          ) : (
            <button
              onClick={onShowAuth}
              style={{
                height: 36,
                padding: '0 12px',
                borderRadius: 10,
                background: 'rgba(255,51,102,0.12)',
                border: '1px solid rgba(255,51,102,0.4)',
                color: '#FF7C9E',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              title="Sign in to Pulse"
            >
              Sign in
            </button>
          ))}

          {/* Pro Pill / Upgrade CTA */}
          {isPro ? (
            <div
              onClick={onShowPro}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                height: 36,
                padding: '0 10px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.18))',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#FCD34D',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'default'
              }}
              title="You're a Pulse Pro member"
            >
              <Icon name="ui-ai-spark" size={13} />
              Pro
            </div>
          ) : (
            <button
              onClick={onShowPro}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                height: 36,
                padding: '0 10px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(109,40,217,0.18))',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#C4B5FD',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              title="Upgrade to Pulse Pro"
            >
              <Icon name="ui-ai-spark" size={13} />
              Pro
            </button>
          )}
        </div>
      </div>

      {/* User Badge — second row */}
      <div className="app-header-badge">
        <div className="app-user-badge">
          {incognito ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: '#A78BFA',
              fontWeight: 600,
              fontSize: 12
            }}>
              <Icon name="ui-lock" size={12} />
              Identity Hidden
            </span>
          ) : (
            (() => {
              // State scope always reads "Wisconsin". For local scope, prefer
              // the signed-in user's city/state from their profile; fall back
              // to Oshkosh, WI for demo / signed-out visitors.
              const isVerified = profile ? !!profile.is_verified : true
              const city = profile?.city || 'Oshkosh'
              const region = profile?.state || 'WI'
              const locationLabel = scope === 'state' ? 'Wisconsin' : `${city}, ${region}`
              return (
                <>
                  {isVerified && (
                    <span className="verified" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Icon name="ui-verified" size={12} />
                      Verified
                    </span>
                  )}
                  <span className="location">{isVerified ? '· ' : ''}{locationLabel}</span>
                </>
              )
            })()
          )}
        </div>
      </div>

      {/* Incognito Banner */}
      {incognito && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))',
          padding: '6px 20px',
          fontSize: 11,
          fontWeight: 600,
          color: '#C4B5FD',
          textAlign: 'center',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Icon name="ui-incognito" size={13} />
          Incognito Mode — your votes, comments, and posts are anonymous
        </div>
      )}

      {/* Scope Switcher */}
      <div className="scope-switcher">
        <div
          className="scope-indicator"
          style={{ transform: scope === 'state' ? 'translateX(100%)' : 'translateX(0)' }}
        />
        <button
          className={`scope-option ${scope === 'local' ? 'active' : ''}`}
          onClick={() => onScopeChange('local')}
        >
          <span className="scope-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Icon name="ui-scope-city" size={16} />
          </span>
          <span>My City</span>
        </button>
        <button
          className={`scope-option ${scope === 'state' ? 'active' : ''}`}
          onClick={() => onScopeChange('state')}
        >
          <span className="scope-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Icon name="ui-scope-state" size={16} />
          </span>
          <span>My State</span>
        </button>
      </div>
    </header>
  )
}
