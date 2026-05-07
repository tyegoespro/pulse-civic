import { useState } from 'react'
import Icon from './Icon'

export default function DemoBanner({ onLearnMore, onGetStarted }) {
  const [dismissed, setDismissed] = useState(false)
  const [animatingOut, setAnimatingOut] = useState(false)

  const handleDismiss = () => {
    setAnimatingOut(true)
    setTimeout(() => setDismissed(true), 400)
  }

  const handleGetStarted = () => {
    handleDismiss()
    if (onGetStarted) onGetStarted()
  }

  if (dismissed) return null

  return (
    <div className={`demo-banner ${animatingOut ? 'dismissing' : ''}`}>
      <div className="demo-banner-glow" />
      <div className="demo-banner-inner">
        <div className="demo-banner-content">
          <div className="demo-banner-headline">
            <span className="demo-banner-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon name="ui-brand-pulse" size={28} />
            </span>
            <h2 className="demo-banner-title">
              Your city's pulse.{' '}
              <span className="demo-banner-gradient">Real residents. Real voices. Real change.</span>
            </h2>
          </div>
          <p className="demo-banner-subtitle">
            This is a live demo of Pulse — a verified civic engagement platform where every voice is verified 
            and every vote counts. Check the Pulse, see consensus form, and discover how your city could work differently.
          </p>
          <div className="demo-banner-actions">
            <button className="demo-banner-cta" onClick={handleGetStarted}>
              Explore the Demo
              <span className="demo-banner-cta-arrow">→</span>
            </button>
            <button className="demo-banner-learn" onClick={onLearnMore}>
              Learn More
              <span style={{ opacity: 0.5 }}>→</span>
            </button>
          </div>
        </div>
        <button className="demo-banner-close" onClick={handleDismiss} title="Dismiss">
          ✕
        </button>
      </div>

      {/* Proof points strip */}
      <div className="demo-banner-proof">
        <div className="demo-banner-proof-item">
          <span className="demo-banner-proof-dot green" />
          <span>100% Verified Residents</span>
        </div>
        <div className="demo-banner-proof-divider" />
        <div className="demo-banner-proof-item">
          <span className="demo-banner-proof-dot red" />
          <span>0 Bot Accounts</span>
        </div>
        <div className="demo-banner-proof-divider" />
        <div className="demo-banner-proof-item">
          <span className="demo-banner-proof-dot blue" />
          <span>No Ads. No Algorithms. Ever.</span>
        </div>
      </div>
    </div>
  )
}
