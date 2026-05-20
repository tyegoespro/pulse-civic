import { useEffect } from 'react'
import Icon from './Icon'
import { markNotificationRead, markAllNotificationsRead } from '../lib/supabase'

const formatRelative = (iso) => {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - t)
  const m = 60_000, h = 60 * m, d = 24 * h
  if (diff < m) return 'just now'
  if (diff < h) return `${Math.floor(diff / m)}m ago`
  if (diff < d) return `${Math.floor(diff / h)}h ago`
  return `${Math.floor(diff / d)}d ago`
}

export default function NotificationsPanel({ userId, notifications, onClose, onMarkRead, onMarkAllRead, onOpenPost }) {
  const unreadCount = notifications.filter(n => !n.read_at).length

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

  const handleClick = async (n) => {
    if (!n.read_at) {
      try { await markNotificationRead(n.id) } catch {}
      onMarkRead?.(n.id)
    }
    if (n.link_post_id) onOpenPost?.(n.link_post_id)
    onClose?.()
  }

  const handleMarkAll = async () => {
    if (!userId || unreadCount === 0) return
    try { await markAllNotificationsRead(userId) } catch {}
    onMarkAllRead?.()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        style={{ maxWidth: 480, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
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
              <Icon name="ui-activity" size={16} />
            </div>
            <h2 id="notifications-title" style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 8,
                background: '#FF3366',
                color: 'white'
              }}>{unreadCount} new</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  height: 28,
                  padding: '0 10px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)'
                }}
              >Mark all read</button>
            )}
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
        </div>

        {/* List */}
        <div style={{
          maxHeight: 460,
          overflowY: 'auto',
          padding: notifications.length === 0 ? '40px 20px' : '4px 0'
        }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, marginBottom: 8 }}>
                <Icon name="ui-activity" size={32} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>You're all caught up.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Replies to your Pulses and Pulses you're watching will show up here.
              </div>
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  width: '100%',
                  padding: '12px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  background: n.read_at ? 'transparent' : 'rgba(255,51,102,0.06)',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s ease'
                }}
              >
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: n.read_at ? 'transparent' : '#FF3366',
                  marginTop: 6,
                  flexShrink: 0
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.35
                  }}>{n.title}</div>
                  {n.body && (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginTop: 2,
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{n.body}</div>
                  )}
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginTop: 4
                  }}>{formatRelative(n.created_at)}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
