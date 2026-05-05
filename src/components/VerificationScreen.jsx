import { useState } from 'react'
import Icon from './Icon'

export default function VerificationScreen({ onVerify }) {
  const [step, setStep] = useState(0)

  return (
    <div className="verification-screen">
      <div className="verification-inner">
        {/* Animated Icon */}
        <div className="verification-emoji" style={{ display: 'flex', justifyContent: 'center' }}>
          {step === 0 ? (
            <Icon name="ui-brand-pulse" size={56} />
          ) : step === 1 ? (
            <Icon name="ui-verified" size={56} />
          ) : (
            <Icon name="ui-verified" size={56} style={{ color: '#22C55E' }} />
          )}
        </div>

        {/* Brand */}
        <h1 className="verification-title">Pulse</h1>

        {/* Step Content */}
        <p className="verification-subtitle">
          {step === 0 && 'The voice of your city. Real citizens. Real issues. Real change.'}
          {step === 1 && 'To keep Pulse authentic, we verify every user with a real ID.'}
          {step === 2 && "You're verified! Welcome to Pulse."}
        </p>

        {/* Step 0: Get Started */}
        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="btn-primary animate-pulse-glow"
            style={{ padding: '16px 48px', fontSize: 18 }}
          >
            Get Started
          </button>
        )}

        {/* Step 1: Verify Identity */}
        {step === 1 && (
          <div className="animate-slide-up">
            <div className="verification-info">
              <div className="verification-info-title">How verification works:</div>
              <div className="verification-info-steps">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name="ui-camera" size={14} /> Scan your government-issued ID
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name="ui-eye" size={14} /> Quick selfie to confirm it's you
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon name="ui-lock" size={14} /> Your data is encrypted and never shared
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="ui-verified" size={14} style={{ color: '#22C55E' }} /> Takes less than 2 minutes
                </span>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="btn-primary full-width"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Icon name="ui-verified" size={18} /> Verify My Identity
            </button>
          </div>
        )}

        {/* Step 2: Verified */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="verification-success">
              <div className="verification-success-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="ui-verified" size={16} style={{ color: '#22C55E' }} /> Identity Verified
              </div>
              <div className="verification-success-sub">Verified resident · Oshkosh, WI</div>
            </div>
            <button
              onClick={onVerify}
              className="btn-primary full-width"
            >
              Enter Pulse
            </button>
          </div>
        )}

        {/* Step indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginTop: 40
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: step === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: step >= i
                  ? 'var(--indigo)'
                  : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
