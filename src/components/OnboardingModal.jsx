import { useState } from 'react'
import Icon from './Icon'

const STEPS = [
  {
    title: 'Welcome to Pulse',
    subtitle: 'Your city. Your voice. Verified.',
    body: 'Pulse is a civic platform where verified residents post, discuss, and vote on the voices that shape their neighborhoods.',
    icon: 'ui-brand-pulse',
    accent: '#FF3366'
  },
  {
    title: 'How It Works',
    subtitle: 'Three simple actions that drive change.',
    bullets: [
      { icon: 'ui-feed', text: 'Post a Pulse — flag a problem, drop a compliment, or share an observation', color: '#6366F1' },
      { icon: 'ui-trending', text: 'Vote on what matters — your vote carries equal weight', color: '#22C55E' },
      { icon: 'ui-eye', text: 'Watch voices to stay updated on outcomes', color: '#3B82F6' }
    ]
  },
  {
    title: 'Your Community',
    subtitle: 'Pulse starts local.',
    body: 'You\'re connected to Oshkosh, WI — a real community with real voices. Everything you see is within your proximity.',
    icon: 'ui-location',
    accent: '#22C55E',
    footer: 'More cities launching soon.'
  }
]

export default function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0)
  const [slideDir, setSlideDir] = useState('none')
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const goNext = () => {
    if (isLast) {
      onComplete()
      return
    }
    setSlideDir('left')
    setTimeout(() => {
      setStep(s => s + 1)
      setSlideDir('entered')
    }, 50)
  }

  const goBack = () => {
    if (step === 0) return
    setSlideDir('right')
    setTimeout(() => {
      setStep(s => s - 1)
      setSlideDir('entered')
    }, 50)
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        {/* Skip */}
        {!isLast && (
          <button className="onboarding-skip" onClick={onComplete}>
            Skip
          </button>
        )}

        {/* Content */}
        <div
          className={`onboarding-content ${slideDir === 'left' ? 'slide-enter-left' : slideDir === 'right' ? 'slide-enter-right' : ''}`}
          key={step}
        >
          {/* Icon */}
          {current.icon && (
            <div className="onboarding-icon" style={{ color: current.accent || '#6366F1' }}>
              <Icon name={current.icon} size={48} />
            </div>
          )}

          <h2 className="onboarding-title">{current.title}</h2>
          <p className="onboarding-subtitle">{current.subtitle}</p>

          {current.body && (
            <p className="onboarding-body">{current.body}</p>
          )}

          {current.bullets && (
            <div className="onboarding-bullets">
              {current.bullets.map((b, i) => (
                <div key={i} className="onboarding-bullet">
                  <div className="onboarding-bullet-icon" style={{ color: b.color }}>
                    <Icon name={b.icon} size={20} />
                  </div>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          )}

          {current.footer && (
            <p className="onboarding-footer">{current.footer}</p>
          )}
        </div>

        {/* Dots */}
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="onboarding-nav">
          {step > 0 ? (
            <button className="onboarding-back" onClick={goBack}>
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button className="onboarding-next" onClick={goNext}>
            {isLast ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
