import { useEffect } from 'react'
import Icon from './Icon'

const LAST_UPDATED = 'May 19, 2026'

const PRIVACY = {
  title: 'Privacy Policy',
  sections: [
    {
      heading: 'What we collect',
      bullets: [
        'Account info you provide: email, display name, optional bio and city.',
        'Content you post: Pulses (statements and questions), votes, comments, and which Pulses you’re watching.',
        'For Google sign-in: your name, email, and avatar URL from your Google account.'
      ]
    },
    {
      heading: 'What we don’t collect',
      bullets: [
        'We don’t collect or store your phone number, payment info, contact list, or device location unless you explicitly grant it.',
        'We don’t track you across other apps or websites.'
      ]
    },
    {
      heading: 'How we use it',
      bullets: [
        'To show your Pulses, votes, and comments in the feed.',
        'To send the magic-link email when you sign in.',
        'To aggregate community sentiment — your votes show up as numbers, not your name.',
        'We don’t sell your data. Ever.'
      ]
    },
    {
      heading: 'Public vs private',
      bullets: [
        'Public: your posts, comments, and the display name attached to them.',
        'Private: your votes, your watching list, your account email. Only you can see these.'
      ]
    },
    {
      heading: 'Posts marked Incognito',
      bullets: [
        'Posts you make in Incognito mode are stored without an author label visible to others.',
        'Internally, we still record which account created the post so we can enforce safety policies and so you can delete it later.'
      ]
    },
    {
      heading: 'Your control',
      bullets: [
        'Edit your display name, bio, avatar, and city anytime in Settings.',
        'Export everything we have about you (Settings → Export my data).',
        'Delete your account permanently — your profile and every Pulse, vote, comment, and watching record is removed via cascading database deletes (Settings → Delete my account).'
      ]
    },
    {
      heading: 'Contact',
      paragraph: 'Questions? Email tylere.moxon@gmail.com.'
    }
  ]
}

const TERMS = {
  title: 'Terms of Service',
  sections: [
    {
      heading: 'Who can use Pulse',
      paragraph: 'You must be 13 or older. Pulse is intended for civic engagement in your local community and your state.'
    },
    {
      heading: 'Be civil',
      paragraph: 'Pulse exists to surface real community voices. Don’t post:',
      bullets: [
        'Personal attacks, threats, harassment, or hate speech.',
        'Illegal content or content promoting illegal activity.',
        'Spam, ads, or commercial promotion.',
        'Content that doxes other users.'
      ],
      paragraphAfter: 'We reserve the right to remove content or accounts that violate these rules.'
    },
    {
      heading: 'Your content',
      paragraph: 'You own what you post. By posting on Pulse, you give us a non-exclusive license to display it within the app and in social-share previews (for example, when someone shares a Pulse link to iMessage).'
    },
    {
      heading: 'Verification',
      paragraph: '“Verified” status currently runs as an early-access placeholder. Once real verification (phone + ZIP) ships, only verified residents will be able to post and vote on local Pulses.'
    },
    {
      heading: 'No warranty',
      paragraph: 'Pulse is provided “as is.” We can’t guarantee that government officials will see, respond to, or act on the content posted here. Pulse is a tool for community signal, not a contract with anyone.'
    },
    {
      heading: 'Changes',
      paragraph: 'We may update these terms. We’ll note the “Last updated” date when we do. Continuing to use Pulse after a change means you accept the new terms.'
    },
    {
      heading: 'Contact',
      paragraph: 'Questions? Email tylere.moxon@gmail.com.'
    }
  ]
}

export default function LegalModal({ kind, onClose }) {
  const doc = kind === 'terms' ? TERMS : PRIVACY

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}
      >
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 id="legal-title" style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em'
            }}>{doc.title}</h2>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
              Last updated: {LAST_UPDATED}
            </div>
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

        <div style={{
          padding: '8px 24px 24px',
          overflowY: 'auto'
        }}>
          {doc.sections.map((s, i) => (
            <section key={i} style={{ paddingTop: 14 }}>
              <h3 style={{
                margin: '0 0 6px',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#FF7C9E'
              }}>{s.heading}</h3>
              {s.paragraph && (
                <p style={{
                  margin: '0 0 8px',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-secondary)'
                }}>{s.paragraph}</p>
              )}
              {s.bullets && (
                <ul style={{
                  margin: '0 0 8px',
                  paddingLeft: 20,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-secondary)'
                }}>
                  {s.bullets.map((b, j) => <li key={j} style={{ marginBottom: 4 }}>{b}</li>)}
                </ul>
              )}
              {s.paragraphAfter && (
                <p style={{
                  margin: '0',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-secondary)'
                }}>{s.paragraphAfter}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
