import { useState } from 'react'
import Icon from './Icon'

const PERKS = [
  {
    icon: 'ui-incognito',
    title: 'Unlimited Incognito',
    desc: 'Post, vote, and comment anonymously without limits.'
  },
  {
    icon: 'ui-ai-spark',
    title: 'Pulse Pro Badge',
    desc: 'Show your support for civic engagement on your profile.'
  },
  {
    icon: 'ui-explore',
    title: 'Advanced Heatmap Layers',
    desc: 'Filter the map by time, category, and impact score.'
  },
  {
    icon: 'ui-lightning',
    title: 'Early Access',
    desc: 'New features and city expansions before everyone else.'
  }
]

export default function PulseProModal({ onClose, onUpgrade, reason }) {
  const [plan, setPlan] = useState('yearly')

  const handleUpgrade = () => {
    onUpgrade(plan)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }}
      >
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)',
          padding: '32px 24px 28px',
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
          >✕</button>
          <div style={{
            marginBottom: 6,
            display: 'flex',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.95)'
          }}>
            <Icon name="ui-ai-spark" size={40} />
          </div>
          <h2 style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em'
          }}>
            Pulse Pro
          </h2>
          <p style={{
            margin: '6px 0 0',
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.4
          }}>
            {reason || 'Speak up without limits. Support civic tech.'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 20px' }}>
          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
            {PERKS.map(p => (
              <div key={p.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#C4B5FD'
                }}>
                  <Icon name={p.icon} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.45, marginTop: 2 }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <button
              onClick={() => setPlan('yearly')}
              style={{
                position: 'relative',
                padding: '14px 16px',
                borderRadius: 14,
                border: plan === 'yearly' ? '2px solid #8B5CF6' : '1px solid var(--border)',
                background: plan === 'yearly' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Yearly</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#C4B5FD' }}>$29<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}> / yr</span></div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Just $2.42/mo · Save ~19%
              </div>
              <div style={{
                position: 'absolute',
                top: -8,
                right: 12,
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: 'white',
                fontSize: 9,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 10,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Best Value
              </div>
            </button>

            <button
              onClick={() => setPlan('monthly')}
              style={{
                padding: '14px 16px',
                borderRadius: 14,
                border: plan === 'monthly' ? '2px solid #8B5CF6' : '1px solid var(--border)',
                background: plan === 'monthly' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Monthly</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>$2.99<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}> / mo</span></div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Cancel anytime
              </div>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            className="btn-primary full-width"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              padding: '14px 16px'
            }}
          >
            Upgrade to Pulse Pro
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: 10,
            color: 'var(--text-muted)',
            marginTop: 10,
            lineHeight: 1.5
          }}>
            Demo mode — no payment required. Stripe integration coming soon.
          </div>
        </div>
      </div>
    </div>
  )
}
