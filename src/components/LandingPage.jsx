import { useState, useEffect, useRef } from 'react'
import iconSprite from '../icons/sprite.svg?raw'
import Icon from './Icon'

export default function LandingPage({ onLaunchApp }) {
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Intersection Observer for reveal animations
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]))
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('[data-section]').forEach(el => {
      observerRef.current.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observerRef.current?.disconnect()
    }
  }, [])

  const isVisible = (id) => visibleSections.has(id)

  return (
    <div className="landing-page">
      {/* Inlined icon sprite — landing page has its own root so we mount it here too */}
      <div dangerouslySetInnerHTML={{ __html: iconSprite }} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />

      {/* ═══ NAV ═══ */}
      <nav className="landing-nav" style={{
        background: scrollY > 60 ? 'rgba(10, 10, 26, 0.92)' : 'transparent',
        backdropFilter: scrollY > 60 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 60 ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent'
      }}>
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <span className="landing-brand-icon" style={{ display: 'inline-flex', alignItems: 'center', color: '#FF3366' }}>
              <Icon name="ui-brand-pulse" size={26} />
            </span>
            <span className="landing-brand-text">Pulse</span>
          </div>
          <div className="landing-nav-links">
            <a href="#why-pulse">Why Pulse</a>
            <a href="#privacy">Privacy</a>
            <button className="landing-cta-sm" onClick={onLaunchApp}>Open App</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            Now live in Oshkosh, WI
          </div>
          <h1 className="landing-hero-title">
            Your city listens<br />when you speak<br />
            <span className="landing-hero-gradient">as one voice.</span>
          </h1>
          <p className="landing-hero-sub">
            The same twelve people show up to every council meeting. The rest
            of us gave up. Pulse is for the rest of us.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-cta-primary" onClick={onLaunchApp}>
              Open Pulse
              <span className="landing-cta-arrow">→</span>
            </button>
            <a href="#why-pulse" className="landing-cta-secondary">
              See why
            </a>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM STATEMENT ═══ */}
      <section className="landing-section" data-section="problem">
        <div className={`landing-section-inner ${isVisible('problem') ? 'visible' : ''}`}>
          <div className="landing-problem-text" style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <span className="landing-section-tag center">The gap</span>
            <h2 className="landing-section-title">
              Policy is shaped by<br />whoever shows up.
            </h2>
            <p className="landing-section-body" style={{ maxWidth: 640, margin: '0 auto' }}>
              You've seen it. The room's half empty. The same three people speak.
              Everyone else gave up at meeting three — the people who actually
              live with the potholes, the noise, the rent. That's not democracy.
              That's a participation gap.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FOUNDER NOTE ═══ */}
      <section className="landing-section" data-section="founder">
        <div className={`landing-section-inner ${isVisible('founder') ? 'visible' : ''}`} style={{ maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <span className="landing-section-tag">From the founder</span>
          <h2 className="landing-section-title" style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>
            I built this in Oshkosh, for Oshkosh first.
          </h2>
          <p className="landing-section-body" style={{ marginBottom: 16 }}>
            I studied design in New York. Lived abroad for a while. Came back to
            Wisconsin to take care of my grandmother — and ran straight into the
            gap between what residents say and what the city hears.
          </p>
          <p className="landing-section-body" style={{ marginBottom: 16 }}>
            I tried building something else here first. A micromobility company
            called Pixel Rides. Watched it stall on coordination that felt like
            punishment for caring. The same twelve people kept showing up to
            council. Everyone else gave up.
          </p>
          <p className="landing-section-body">
            Pulse is the tool I needed then. It's the tool your city needs now.
          </p>
          <p style={{ marginTop: 18, fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            — Tye Moxon, Oshkosh, WI
          </p>
        </div>
      </section>

      {/* ═══ WHY PULSE / VS COMPARISON ═══ */}
      <section className="landing-section" id="why-pulse" data-section="why">
        <div className={`landing-section-inner ${isVisible('why') ? 'visible' : ''}`}>
          <span className="landing-section-tag center">Why Pulse</span>
          <h2 className="landing-section-title center">
            Not another social network.<br />
            A way to actually be heard.
          </h2>

          {/* Comparison Table */}
          <div className="landing-comparison">
            <div className="landing-comp-header">
              <div className="landing-comp-feature">Feature</div>
              <div className="landing-comp-others">Facebook / Nextdoor</div>
              <div className="landing-comp-pulse">Pulse</div>
            </div>
            {[
              { feature: 'Who can sign up', others: 'Anyone with an email', pulse: 'Verified residents only' },
              { feature: 'Verification', others: 'Email or phone', pulse: 'Phone + ZIP residency' },
              { feature: 'Bot accounts', others: 'Common', pulse: 'Gated by verification' },
              { feature: 'What rises to the top', others: 'Engagement algorithm', pulse: 'Vote count from real neighbors' },
              { feature: 'What comes out the other end', others: 'Rage threads', pulse: 'Structured signal for city hall' },
              { feature: 'How we make money', others: 'Ads, attention, your data', pulse: 'City partnerships. No ads, ever.' },
            ].map((row, i) => (
              <div className="landing-comp-row" key={i}>
                <div className="landing-comp-feature">{row.feature}</div>
                <div className="landing-comp-others">{row.others}</div>
                <div className="landing-comp-pulse">{row.pulse}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES BENTO ═══ */}
      <section className="landing-section dark" data-section="features">
        <div className={`landing-section-inner ${isVisible('features') ? 'visible' : ''}`}>
          <span className="landing-section-tag center">What's inside</span>
          <h2 className="landing-section-title center">
            Built for accountability,<br />not engagement.
          </h2>

          <div className="landing-bento">
            <div className="landing-bento-card large">
              <div className="landing-bento-icon" style={{ color: '#3B82F6' }}>
                <Icon name="ui-explore" size={32} />
              </div>
              <h3>Live city heatmap</h3>
              <p>
                Voices stack on the map where the problems are. The patterns
                show up that no single complaint ever could.
              </p>
            </div>
            <div className="landing-bento-card">
              <div className="landing-bento-icon" style={{ color: '#A78BFA' }}>
                <Icon name="ui-incognito" size={32} />
              </div>
              <h3>Incognito</h3>
              <p>
                One button. Your votes, posts, and comments go anonymous.
                You're still verified. Your boss can't tell.
              </p>
            </div>
            <div className="landing-bento-card">
              <div className="landing-bento-icon" style={{ color: '#EC4899' }}>
                <Icon name="ui-camera" size={32} />
              </div>
              <h3>Photo evidence</h3>
              <p>
                Up to four photos per Pulse. The pothole, the streetlight,
                the lot. Easier for the city to act when there's a picture.
              </p>
            </div>
            <div className="landing-bento-card">
              <div className="landing-bento-icon" style={{ color: '#22C55E' }}>
                <Icon name="ui-location" size={32} />
              </div>
              <h3>Proximity voting</h3>
              <p>
                Live or work in the city, you can vote. Outside the radius,
                you can't. Nobody in Madison gets to weigh in on what we do here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRIVACY ═══ */}
      <section className="landing-section" id="privacy" data-section="privacy">
        <div className={`landing-section-inner ${isVisible('privacy') ? 'visible' : ''}`}>
          <div className="landing-privacy-grid">
            <div>
              <span className="landing-section-tag">Privacy</span>
              <h2 className="landing-section-title">
                Verified doesn't<br />mean exposed.
              </h2>
              <p className="landing-section-body">
                You're verified so we can keep out bots. After that, what
                you do here stays yours.
              </p>
            </div>
            <div className="landing-privacy-cards">
              <div className="landing-privacy-card">
                <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
                  <Icon name="ui-lock" size={24} />
                </span>
                <div>
                  <strong>Phone + ZIP, not government ID</strong>
                  <p>We confirm you're real and you live here. That's it.</p>
                </div>
              </div>
              <div className="landing-privacy-card">
                <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA' }}>
                  <Icon name="ui-incognito" size={24} />
                </span>
                <div>
                  <strong>Incognito when you want it</strong>
                  <p>One button. Every action anonymous. Still counted.</p>
                </div>
              </div>
              <div className="landing-privacy-card">
                <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FF3366' }}>
                  <Icon name="ui-megaphone" size={24} />
                </span>
                <div>
                  <strong>No ads. No data selling. Ever.</strong>
                  <p>Our customer is the city, not an advertiser.</p>
                </div>
              </div>
              <div className="landing-privacy-card">
                <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                  <Icon name="ui-verified" size={24} />
                </span>
                <div>
                  <strong>Your votes are yours</strong>
                  <p>Who voted what stays private. Even from us.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOR CITIES ═══ */}
      <section className="landing-section dark" data-section="cities">
        <div className={`landing-section-inner ${isVisible('cities') ? 'visible' : ''}`}>
          <span className="landing-section-tag center">For city hall</span>
          <h2 className="landing-section-title center">
            You can't be at every<br />kitchen table.
          </h2>
          <p className="landing-section-body center" style={{ maxWidth: 580, margin: '0 auto 48px' }}>
            Pulse brings the kitchen tables to you — verified, ranked by
            consensus, sorted by department. No survey gymnastics. No
            shouting match on Facebook. Just signal.
          </p>
          <div className="landing-city-benefits">
            <div className="landing-city-card">
              <span className="landing-city-number">Verified</span>
              <p>Residents only. No anonymous trolling, no astroturfing.</p>
            </div>
            <div className="landing-city-card">
              <span className="landing-city-number">Ranked</span>
              <p>The community votes. The top issues sort themselves.</p>
            </div>
            <div className="landing-city-card">
              <span className="landing-city-number">Live</span>
              <p>Issues surface as they happen, not months later in a survey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="landing-section landing-final-cta" data-section="cta">
        <div className={`landing-section-inner ${isVisible('cta') ? 'visible' : ''}`}>
          <div className="landing-final-content">
            <span className="landing-final-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#FF3366' }}>
              <Icon name="ui-brand-pulse" size={48} />
            </span>
            <h2 className="landing-final-title">
              Your city is already talking.<br />
              Make sure it's being heard.
            </h2>
            <p className="landing-final-body">
              Live in Oshkosh now. Coming to the cities that ask for it next.
            </p>
            <div className="landing-hero-actions" style={{ justifyContent: 'center' }}>
              <button className="landing-cta-primary" onClick={onLaunchApp}>
                Open Pulse
                <span className="landing-cta-arrow">→</span>
              </button>
              <a href="mailto:tylere.moxon@gmail.com?subject=Bring%20Pulse%20to%20our%20city" className="landing-cta-secondary">
                Bring Pulse to your city
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <span style={{ display: 'inline-flex', alignItems: 'center', color: '#FF3366', marginRight: 6 }}>
              <Icon name="ui-brand-pulse" size={20} />
            </span> Pulse
          </div>
          <div className="landing-footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#why-pulse">Why Pulse</a>
            <a href="mailto:tylere.moxon@gmail.com">Contact</a>
          </div>
          <div className="landing-footer-legal">
            © {new Date().getFullYear()} Pulse Civic Technologies. Built in Oshkosh, WI.
          </div>
        </div>
      </footer>
    </div>
  )
}
