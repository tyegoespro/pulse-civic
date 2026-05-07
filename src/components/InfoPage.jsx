import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export default function InfoPage({ onClose, onLaunchApp }) {
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden'

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]))
        }
      })
    }, { threshold: 0.15, root: contentRef.current })

    const content = contentRef.current
    if (content) {
      content.querySelectorAll('[data-section]').forEach(el => {
        observerRef.current.observe(el)
      })
    }

    return () => {
      document.body.style.overflow = ''
      observerRef.current?.disconnect()
    }
  }, [])

  const isVisible = (id) => visibleSections.has(id)

  return (
    <div className="info-page-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="info-page" ref={contentRef}>
        {/* Close Button */}
        <button className="info-page-close" onClick={onClose} title="Close">
          ✕
        </button>

        {/* ═══ HERO ═══ */}
        <section className="info-hero">
          <div className="info-hero-bg" />
          <div className="info-hero-content">
            <span className="info-hero-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="ui-brand-pulse" size={48} /></span>
            <h1 className="info-hero-title">
              The civic platform your<br />
              city actually <span className="landing-hero-gradient">needs.</span>
            </h1>
            <p className="info-hero-sub">
              Pulse turns resident feedback into structured, data-backed 
              consensus that city councils can't ignore. Every user verified. 
              Every vote counted. No bots, no noise, no algorithms.
            </p>
          </div>
        </section>

        {/* ═══ PROBLEM STATEMENT ═══ */}
        <section className="landing-section" data-section="problem">
          <div className={`landing-section-inner ${isVisible('problem') ? 'visible' : ''}`}>
            <div className="landing-problem-grid">
              <div className="landing-problem-text">
                <span className="landing-section-tag">The Problem</span>
                <h2 className="landing-section-title">
                  Policy is shaped by whoever<br />
                  shows up — not by what the<br />
                  community actually wants.
                </h2>
                <p className="landing-section-body">
                  Public comment periods draw the same 12 people. Facebook groups 
                  amplify rage, not consensus. Municipal surveys get 3% response rates.
                  The residents who care most gave up navigating the system. That's 
                  not democracy — it's a participation gap.
                </p>
              </div>
              <div className="landing-problem-stats">
                <div className="landing-stat-card">
                  <span className="landing-stat-number">3%</span>
                  <span className="landing-stat-desc">Average municipal survey response rate</span>
                </div>
                <div className="landing-stat-card accent">
                  <span className="landing-stat-number">67%</span>
                  <span className="landing-stat-desc">of residents want to engage but don't know how</span>
                </div>
                <div className="landing-stat-card">
                  <span className="landing-stat-number">0</span>
                  <span className="landing-stat-desc">tools built for verified, local consensus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="landing-section dark" data-section="how">
          <div className={`landing-section-inner ${isVisible('how') ? 'visible' : ''}`}>
            <span className="landing-section-tag center">How Pulse Works</span>
            <h2 className="landing-section-title center">
              Three steps between a pothole<br />and a city council agenda item.
            </h2>

            <div className="landing-steps">
              <div className="landing-step">
                <div className="landing-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-verified" size={28} /></div>
                <h3 className="landing-step-title">Verify once</h3>
                <p className="landing-step-body">
                  Government ID verification confirms you're a real resident of your 
                  city. Takes under 2 minutes. Never shared; encrypted at rest. One and done.
                </p>
              </div>
              <div className="landing-step-connector" />
              <div className="landing-step">
                <div className="landing-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-feed" size={28} /></div>
                <h3 className="landing-step-title">Raise or vote</h3>
                <p className="landing-step-body">
                  Post a Pulse, attach photos for evidence, and vote on the voices that
                  matter to you. Duplicates are detected automatically — your voice
                  adds weight to existing ones instead of getting lost.
                </p>
              </div>
              <div className="landing-step-connector" />
              <div className="landing-step">
                <div className="landing-step-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-insights" size={28} /></div>
                <h3 className="landing-step-title">Consensus forms</h3>
                <p className="landing-step-body">
                  When enough verified residents back a Pulse, it crosses the
                  threshold. Structured reports — categorized, geo-tagged, and
                  ranked — get delivered to the relevant city departments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHY PULSE ═══ */}
        <section className="landing-section" data-section="why">
          <div className={`landing-section-inner ${isVisible('why') ? 'visible' : ''}`}>
            <span className="landing-section-tag center">Why Pulse</span>
            <h2 className="landing-section-title center">
              Not another social network.<br />
              A civic infrastructure layer.
            </h2>
            <p className="landing-section-body center" style={{ maxWidth: 620, margin: '0 auto 48px' }}>
              Facebook groups were designed to sell ads. Nextdoor was designed to 
              engage users. Pulse was designed for one thing: to make city government 
              hear its residents. Every design decision flows from that.
            </p>

            <div className="landing-comparison">
              <div className="landing-comp-header">
                <div className="landing-comp-feature">Feature</div>
                <div className="landing-comp-others">Facebook / Nextdoor</div>
                <div className="landing-comp-pulse">Pulse</div>
              </div>
              {[
                { feature: 'User verification', others: 'Email or phone', pulse: 'Government ID' },
                { feature: 'Who participates', others: 'Anyone, anywhere', pulse: 'Verified local residents only' },
                { feature: 'Voting radius', others: 'No geographic limits', pulse: 'Verified residents within 15mi only' },
                { feature: 'Bot accounts', others: 'Widespread', pulse: 'Structurally impossible' },
                { feature: 'Content ranking', others: 'Engagement algorithm', pulse: 'Democratic vote count' },
                { feature: 'Pulse tracking', others: 'Buried in feed', pulse: 'Categorized, geo-tagged, persistent' },
                { feature: 'Privacy model', others: 'Data harvested for ads', pulse: 'Encrypted identity, incognito mode' },
                { feature: 'Output', others: 'Rage threads', pulse: 'Structured reports for city hall' },
                { feature: 'Business model', others: 'Attention → Ads', pulse: 'Civic SaaS, no ads ever' },
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
            <span className="landing-section-tag center">Built Different</span>
            <h2 className="landing-section-title center">
              Features designed for<br />accountability, not engagement.
            </h2>

            <div className="landing-bento">
              <div className="landing-bento-card large">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-explore" size={28} /></div>
                <h3>Live City Heatmap</h3>
                <p>
                  See where voices cluster across your city in real time. Potholes
                  downtown. Safety concerns on the south side. The map reveals patterns
                  that single voices never could.
                </p>
              </div>
              <div className="landing-bento-card">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-incognito" size={28} /></div>
                <h3>Incognito Mode</h3>
                <p>
                  One toggle hides your identity across every interaction — votes, 
                  posts, comments. You're still verified. You're still counted. 
                  You're just anonymous.
                </p>
              </div>
              <div className="landing-bento-card">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-camera" size={28} /></div>
                <h3>Photo & Video Evidence</h3>
                <p>
                  Attach up to 4 photos or videos per Pulse. Visual proof eliminates
                  ambiguity and gives city departments what they need to act.
                </p>
              </div>
              <div className="landing-bento-card">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-location" size={28} /></div>
                <h3>Proximity Voting</h3>
                <p>
                  Live or commute in the city? Your vote counts — same as everyone 
                  else. Outside the radius? You can't vote, period. No brigading, 
                  no astroturfing, just verified local voices.
                </p>
              </div>
              <div className="landing-bento-card">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-refresh" size={28} /></div>
                <h3>Duplicate Detection</h3>
                <p>
                  AI-powered semantic matching ensures your voice adds weight to
                  existing voices rather than fragmenting the conversation.
                  20 people, one thread, one vote count.
                </p>
              </div>
              <div className="landing-bento-card large">
                <div className="landing-bento-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ui-ai-spark" size={28} /></div>
                <h3>AI-Assisted Civic Discourse</h3>
                <p>
                  Every post gets an impact score measuring actionability. Comments 
                  can be refined for constructive tone — preserving your opinion while 
                  improving delivery. The goal: make every citizen sound like they 
                  belong at the podium.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRIVACY ═══ */}
        <section className="landing-section" data-section="privacy">
          <div className={`landing-section-inner ${isVisible('privacy') ? 'visible' : ''}`}>
            <div className="landing-privacy-grid">
              <div>
                <span className="landing-section-tag">Privacy by Design</span>
                <h2 className="landing-section-title">
                  Verified doesn't mean<br />exposed.
                </h2>
                <p className="landing-section-body">
                  We verify your identity to keep out bots and bad actors. Then we 
                  protect it like it's our own. Your ID is never stored — only a 
                  cryptographic proof that you're a real, local resident.
                </p>
              </div>
              <div className="landing-privacy-cards">
                <div className="landing-privacy-card">
                  <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="ui-lock" size={20} /></span>
                  <div>
                    <strong>Zero-knowledge verification</strong>
                    <p>We confirm you're real without storing your documents.</p>
                  </div>
                </div>
                <div className="landing-privacy-card">
                  <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="ui-incognito" size={20} /></span>
                  <div>
                    <strong>Incognito by default if you want it</strong>
                    <p>One button. Every action anonymous. Still counted.</p>
                  </div>
                </div>
                <div className="landing-privacy-card">
                  <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center', color: '#EF4444' }}><Icon name="ui-eye" size={20} /></span>
                  <div>
                    <strong>No ads. No data selling. Ever.</strong>
                    <p>Our customer is the city, not an advertiser.</p>
                  </div>
                </div>
                <div className="landing-privacy-card">
                  <span className="landing-privacy-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="ui-scope-state" size={20} /></span>
                  <div>
                    <strong>Row-level security</strong>
                    <p>Your votes and incognito posts are invisible — even to us.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOR CITIES ═══ */}
        <section className="landing-section dark" data-section="cities">
          <div className={`landing-section-inner ${isVisible('cities') ? 'visible' : ''}`}>
            <span className="landing-section-tag center">For City Government</span>
            <h2 className="landing-section-title center">
              Stop guessing what your<br />residents actually want.
            </h2>
            <p className="landing-section-body center" style={{ maxWidth: 600, margin: '0 auto 48px' }}>
              Pulse gives municipal leaders a real-time, verified dashboard of 
              citizen sentiment — categorized by department, ranked by consensus, 
              and backed by data that can withstand public scrutiny.
            </p>
            <div className="landing-city-benefits">
              <div className="landing-city-card">
                <span className="landing-city-number">10×</span>
                <p>Higher participation than traditional public comment periods</p>
              </div>
              <div className="landing-city-card">
                <span className="landing-city-number">100%</span>
                <p>Verified — no anonymous trolling or astroturfing campaigns</p>
              </div>
              <div className="landing-city-card">
                <span className="landing-city-number">Real-time</span>
                <p>Voices surface as they happen, not months later in a survey</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="landing-section landing-final-cta" data-section="cta">
          <div className={`landing-section-inner ${isVisible('cta') ? 'visible' : ''}`}>
            <div className="landing-final-content">
              <span className="landing-final-icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Icon name="ui-brand-pulse" size={48} /></span>
              <h2 className="landing-final-title">
                Your city is already talking.<br />
                Make sure it's being heard.
              </h2>
              <p className="landing-final-body">
                Pulse is live in Oshkosh, WI. Expanding to cities that want to 
                listen — not just broadcast.
              </p>
              <div className="landing-hero-actions" style={{ justifyContent: 'center' }}>
                <button className="landing-cta-primary" onClick={() => { onLaunchApp?.(); onClose() }}>
                  Try Pulse Now
                  <span className="landing-cta-arrow">→</span>
                </button>
                <a href="mailto:hello@getpulse.city" className="landing-cta-secondary">
                  Bring Pulse to your city
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="landing-footer">
          <div className="landing-footer-inner">
            <div className="landing-footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="ui-brand-pulse" size={18} /> Pulse
            </div>
            <div className="landing-footer-links">
              <a href="mailto:hello@getpulse.city">Contact</a>
            </div>
            <div className="landing-footer-legal">
              © {new Date().getFullYear()} Pulse Civic Technologies. Built in Oshkosh, WI.
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, opacity: 0.6 }}>
              Icons by <a href="https://www.streamlinehq.com/icons/plump-line" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Streamline Plump</a> — licensed <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>CC BY 4.0</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
