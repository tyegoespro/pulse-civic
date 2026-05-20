import { useState } from 'react'
import Icon from './Icon'
import { useAuth } from '../lib/auth'

const buildSteps = ({ city, state, signedIn }) => [
  {
    title: 'Welcome to Pulse',
    subtitle: 'Your city. Your voice. Verified.',
    body: 'Pulse is where neighbors weigh in on what\'s happening in their city — and the consensus is visible in real time.',
    icon: 'ui-brand-pulse',
    accent: '#FF3366'
  },
  {
    title: 'Two ways to be heard',
    subtitle: 'Statement Pulses and Question Pulses.',
    bullets: [
      { icon: 'ui-megaphone', text: 'Speak — flag a problem, share a compliment, or report what you\'re seeing.', color: '#FF3366' },
      { icon: 'ui-lightbulb', text: 'Ask — pose a question to the community; the top-voted answer becomes the Verdict.', color: '#F59E0B' },
      { icon: 'ui-trending', text: 'Vote — every vote carries equal weight, and counts tick up live.', color: '#22C55E' }
    ]
  },
  {
    title: 'Watch, share, stay in it',
    subtitle: 'Pulses you care about stay close.',
    bullets: [
      { icon: 'ui-eye', text: 'Watch a Pulse to get notified when someone replies or the consensus shifts.', color: '#3B82F6' },
      { icon: 'ui-activity', text: 'In-app notifications when comments land on your Pulses or ones you\'re watching.', color: '#A855F7' },
      { icon: 'ui-megaphone', text: 'Share any Pulse — it links to a rich preview in iMessage, Slack, anywhere.', color: '#EC4899' }
    ]
  },
  {
    title: signedIn ? `Welcome to ${city || 'your city'}` : 'Your community',
    subtitle: signedIn ? `You\'re live in ${city}, ${state}.` : 'Pulse starts local.',
    body: signedIn
      ? 'Posts, votes, and comments all sync to the live community — and updates tick in without a refresh.'
      : 'Sign in to post, vote, and watch Pulses. Or browse around as a guest first — your view of the city is read-only until you sign in.',
    icon: signedIn ? 'ui-location' : 'ui-lock',
    accent: signedIn ? '#22C55E' : '#FF3366',
    footer: signedIn ? null : 'More cities launching soon.'
  }
]

export default function OnboardingModal({ onComplete }) {
  const { user, profile, configured } = useAuth()
  const signedIn = !!(user && configured)
  const city = profile?.city || 'Oshkosh'
  const state = profile?.state || 'WI'
  const STEPS = buildSteps({ city, state, signedIn })

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
            {isLast ? (signedIn ? 'Jump in' : 'Get started') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
