import { useEffect, useRef, useState } from 'react'

const FONT_MONO = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const THEME_KEY = 'pulse_landing_theme'

// Accent palette pulled from the in-app brand colors so the marketing
// surface feels like it belongs to the same product. Pulse pink is the
// star; secondary accents add life to numbered sections, kicker tags,
// and the City Hall stat columns.
const ACCENTS = {
  pink: '#FF3366',
  pinkSoft: '#FF6B8E',
  indigo: '#6366F1',
  green: '#22C55E',
  amber: '#F59E0B',
  purple: '#A855F7',
  blue: '#3B82F6'
}

const PALETTES = {
  light: {
    ink: '#09090B',
    inkSoft: '#27272A',
    inkMute: '#52525B',
    paper: '#FAFAF7',
    paperAlt: '#F2F1EC',
    paperHover: '#EAE9E2',
    inversePaper: '#09090B',
    inversePaperAlt: '#18181B',
    inverseInk: '#FAFAF7',
    inverseInkSoft: '#D4D4D8',
    inverseInkMute: '#A1A1AA'
  },
  dark: {
    ink: '#FAFAF7',
    inkSoft: '#E4E4E7',
    inkMute: '#A1A1AA',
    paper: '#0A0A12',
    paperAlt: '#15151F',
    paperHover: '#1E1E2A',
    inversePaper: '#FAFAF7',
    inversePaperAlt: '#F2F1EC',
    inverseInk: '#09090B',
    inverseInkSoft: '#27272A',
    inverseInkMute: '#52525B'
  }
}

export default function LandingPage({ onLaunchApp }) {
  // Theme persistence — light editorial newsprint by default.
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'dark' || saved === 'light') return saved
    } catch {}
    return 'light'
  })
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme) } catch {}
  }, [theme])
  const c = PALETTES[theme]
  const isDark = theme === 'dark'

  // Scroll-reveal observer — opacity + small slide so sections drift in.
  const [seen, setSeen] = useState(new Set())
  const observerRef = useRef(null)
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setSeen(prev => new Set([...prev, e.target.dataset.r]))
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('[data-r]').forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const reveal = (id) => ({
    opacity: seen.has(id) ? 1 : 0,
    transform: seen.has(id) ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
  })

  // Hover state — single hovered key tracked so we don't keep a map per row.
  const [hover, setHover] = useState(null)

  // ─── style objects, computed against the live palette ──────────────────
  const primaryBtn = (hoverKey) => ({
    color: c.paper,
    border: 'none',
    padding: '16px 28px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: FONT_MONO,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: hover === hoverKey ? 14 : 10,
    transition: 'gap 0.25s ease, background 0.25s ease',
    background: hover === hoverKey ? ACCENTS.pink : c.ink
  })

  const secondaryBtn = (hoverKey) => ({
    background: 'transparent',
    color: hover === hoverKey ? ACCENTS.pink : c.ink,
    border: `1.5px solid ${hover === hoverKey ? ACCENTS.pink : c.ink}`,
    padding: '14.5px 26px',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: FONT_MONO,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: hover === hoverKey ? 14 : 10,
    transition: 'all 0.25s ease'
  })

  const tag = (color) => ({
    fontSize: 11,
    fontWeight: 700,
    color: color || c.inkMute,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontFamily: FONT_MONO
  })

  const navLink = (key) => ({
    fontSize: 12,
    fontWeight: 700,
    color: c.ink,
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    borderBottom: `1.5px solid ${hover === key ? ACCENTS.pink : 'transparent'}`,
    paddingBottom: 2,
    transition: 'border-color 0.25s ease, color 0.25s ease',
    cursor: 'pointer'
  })

  return (
    <div style={{
      fontFamily: FONT_MONO,
      background: c.paper,
      color: c.ink,
      minHeight: '100vh',
      fontFeatureSettings: '"ss01", "ss02"',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      <style>{`
        @keyframes pulse-live {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.55; }
        }
        @keyframes accent-shine {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* ─────────────── MASTHEAD ─────────────── */}
      <header style={{
        borderBottom: `2px solid ${c.ink}`,
        padding: '20px clamp(20px, 4vw, 40px)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        background: c.paper
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: c.ink
          }}>PULSE</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: c.inkMute,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            fontFamily: FONT_MONO,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}>
            Oshkosh, WI
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: ACCENTS.green,
                animation: 'pulse-live 1.6s ease-in-out infinite',
                display: 'inline-block'
              }} />
              Live
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <a
            href="#what"
            style={navLink('nav-what')}
            onMouseEnter={() => setHover('nav-what')}
            onMouseLeave={() => setHover(null)}
          >What it is</a>
          <a
            href="#why"
            style={navLink('nav-why')}
            onMouseEnter={() => setHover('nav-why')}
            onMouseLeave={() => setHover(null)}
          >The verdict</a>
          <a
            href="#privacy"
            style={navLink('nav-privacy')}
            onMouseEnter={() => setHover('nav-privacy')}
            onMouseLeave={() => setHover(null)}
          >Privacy</a>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            onMouseEnter={() => setHover('theme')}
            onMouseLeave={() => setHover(null)}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'transparent',
              border: `1.5px solid ${hover === 'theme' ? ACCENTS.pink : c.ink}`,
              color: hover === 'theme' ? ACCENTS.pink : c.ink,
              padding: '7px 11px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: FONT_MONO,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.25s ease'
            }}
          >
            <span style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: isDark ? c.ink : c.paper,
              border: `1.5px solid ${hover === 'theme' ? ACCENTS.pink : c.ink}`,
              display: 'inline-block'
            }} />
            {isDark ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={onLaunchApp}
            onMouseEnter={() => setHover('hero-cta')}
            onMouseLeave={() => setHover(null)}
            style={primaryBtn('hero-cta')}
          >
            Open the app
            <span style={{ transition: 'transform 0.25s ease', transform: hover === 'hero-cta' ? 'translateX(4px)' : 'none' }}>→</span>
          </button>
        </div>
      </header>

      {/* ─────────────── HERO ─────────────── */}
      <section style={{
        padding: 'clamp(56px, 9vw, 112px) clamp(20px, 4vw, 40px) clamp(48px, 7vw, 80px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(48px, 8.5vw, 116px)',
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.045em',
          margin: 0,
          color: c.ink,
          maxWidth: 1100
        }}>
          The same twelve<br />
          people show up to<br />
          every council meeting.
        </h1>

        <p style={{
          fontSize: 'clamp(17px, 1.6vw, 22px)',
          color: c.inkSoft,
          lineHeight: 1.5,
          marginTop: 'clamp(28px, 4vw, 44px)',
          marginBottom: 0,
          maxWidth: 720,
          fontWeight: 400
        }}>
          The rest of us stopped going. Pulse is for the rest of us.
          Verified residents post what's actually happening in their
          city, vote on what matters, and watch consensus form — live,
          in public, with no algorithm choosing for them.
        </p>

        <div style={{ marginTop: 'clamp(36px, 5vw, 56px)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button
            onClick={onLaunchApp}
            onMouseEnter={() => setHover('cta-main')}
            onMouseLeave={() => setHover(null)}
            style={primaryBtn('cta-main')}
          >
            Open Pulse
            <span style={{ transition: 'transform 0.25s ease', transform: hover === 'cta-main' ? 'translateX(4px)' : 'none' }}>→</span>
          </button>
          <a
            href="#what"
            onMouseEnter={() => setHover('cta-scroll')}
            onMouseLeave={() => setHover(null)}
            style={secondaryBtn('cta-scroll')}
          >
            See how it works
            <span style={{ transition: 'transform 0.25s ease', transform: hover === 'cta-scroll' ? 'translateY(2px)' : 'none' }}>↓</span>
          </a>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: `1px solid ${c.ink}`, margin: 0, opacity: 0.18 }} />

      {/* ─────────────── WHAT IT IS ─────────────── */}
      <section id="what" data-r="what" style={{
        ...reveal('what'),
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 280px) 1fr',
          gap: 'clamp(32px, 5vw, 80px)',
          alignItems: 'start'
        }}>
          <div>
            <div style={{ ...tag(ACCENTS.pink), marginBottom: 16 }}>§ One</div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.6vw, 44px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              margin: 0,
              color: c.ink
            }}>
              What Pulse<br />stands for.
            </h2>
          </div>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { n: '01', color: ACCENTS.pink, title: 'Residents only.', body: 'Phone and ZIP verification confirms you actually live here. No outside agitators, no astroturfing, no anonymous trolls.' },
              { n: '02', color: ACCENTS.indigo, title: 'One person, one vote.', body: "No engagement algorithm. Pulses with the most real-resident votes rise. The ones without don't." },
              { n: '03', color: ACCENTS.green, title: 'Public consensus, in public.', body: 'Watch the vote counts tick up in real time. See the categories. See where the city actually stands.' },
              { n: '04', color: ACCENTS.amber, title: 'No ads. Ever.', body: "Our customer is the city, not an advertiser. Your votes stay yours. Your data doesn't get sold." }
            ].map((item, i) => {
              const k = `plank-${item.n}`
              const isHovered = hover === k
              return (
                <li
                  key={item.n}
                  onMouseEnter={() => setHover(k)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr',
                    gap: 24,
                    padding: '28px 16px',
                    margin: '0 -16px',
                    borderTop: i === 0 ? `1px solid ${c.ink}` : `1px solid ${c.ink}22`,
                    background: isHovered ? c.paperHover : 'transparent',
                    transition: 'background 0.25s ease',
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: item.color,
                    letterSpacing: '0.05em',
                    paddingTop: 6,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <span style={{
                      width: isHovered ? 8 : 4,
                      height: 22,
                      background: item.color,
                      display: 'inline-block',
                      transition: 'width 0.25s ease'
                    }} />
                    {item.n}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 'clamp(22px, 2.4vw, 30px)',
                      fontWeight: 700,
                      letterSpacing: '-0.015em',
                      margin: 0,
                      color: c.ink
                    }}>{item.title}</h3>
                    <p style={{
                      fontSize: 16,
                      color: c.inkSoft,
                      margin: '8px 0 0',
                      lineHeight: 1.55,
                      maxWidth: 580
                    }}>{item.body}</p>
                  </div>
                </li>
              )
            })}
            <li style={{ borderTop: `1px solid ${c.ink}22`, height: 0 }} />
          </ol>
        </div>
      </section>

      {/* ─────────────── THE VERDICT ─────────────── */}
      <section id="why" data-r="why" style={{
        ...reveal('why'),
        background: c.paperAlt,
        borderTop: `2px solid ${c.ink}`,
        borderBottom: `2px solid ${c.ink}`,
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ ...tag(ACCENTS.indigo), marginBottom: 18 }}>§ Two — The verdict</div>
          <h2 style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            margin: 0,
            color: c.ink,
            maxWidth: 940
          }}>
            Not another social network.<br />
            A way to actually be heard.
          </h2>

          <div style={{
            marginTop: 'clamp(40px, 5vw, 64px)',
            border: `2px solid ${c.ink}`,
            background: c.paper
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1.2fr',
              background: c.ink,
              color: c.paper,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: FONT_MONO
            }}>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${c.paper}22` }}>Item</div>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${c.paper}22` }}>Facebook / Nextdoor</div>
              <div style={{ padding: '14px 20px', color: ACCENTS.pink }}>Pulse</div>
            </div>
            {[
              { f: 'Who can sign up', o: 'Anyone with an email', p: 'Verified residents only' },
              { f: 'Verification', o: 'Email or phone', p: 'Phone + ZIP residency' },
              { f: 'Bot accounts', o: 'Common', p: 'Gated by verification' },
              { f: 'What rises to the top', o: 'Engagement algorithm', p: 'Vote count from real neighbors' },
              { f: 'What comes out the other end', o: 'Rage threads', p: 'Structured signal for city hall' },
              { f: 'How we make money', o: 'Ads, attention, your data', p: 'City partnerships. No ads, ever.' }
            ].map((row, i) => {
              const k = `row-${i}`
              const isHovered = hover === k
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover(k)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1.2fr',
                    borderTop: `1px solid ${c.ink}22`,
                    fontSize: 14,
                    background: isHovered ? `${ACCENTS.pink}0D` : c.paper,
                    transition: 'background 0.25s ease',
                    cursor: 'default'
                  }}
                >
                  <div style={{ padding: '18px 20px', fontWeight: 700, borderRight: `1px solid ${c.ink}11`, color: c.ink }}>{row.f}</div>
                  <div style={{
                    padding: '18px 20px',
                    color: c.inkMute,
                    borderRight: `1px solid ${c.ink}11`,
                    textDecoration: 'line-through',
                    textDecorationColor: `${c.inkMute}55`
                  }}>{row.o}</div>
                  <div style={{
                    padding: '18px 20px',
                    fontWeight: 700,
                    color: isHovered ? ACCENTS.pink : c.ink,
                    transition: 'color 0.25s ease'
                  }}>{row.p}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── INSIDE ─────────────── */}
      <section data-r="inside" style={{
        ...reveal('inside'),
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <div style={{ ...tag(ACCENTS.green), marginBottom: 18 }}>§ Three — Inside</div>
        <h2 style={{
          fontSize: 'clamp(32px, 4.4vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          margin: 0,
          color: c.ink,
          maxWidth: 860
        }}>
          Designed for accountability,<br />
          not engagement.
        </h2>

        <div style={{
          marginTop: 'clamp(36px, 5vw, 56px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 0,
          borderTop: `1px solid ${c.ink}`
        }}>
          {[
            { kicker: 'Heatmap', color: ACCENTS.blue, title: 'Voices stack where the problems are.', body: 'The patterns show up that no single complaint ever could on its own.' },
            { kicker: 'Incognito', color: ACCENTS.purple, title: 'One button. Anonymous, still counted.', body: "Your votes, posts, and comments go anonymous. You're still verified. Your boss can't tell." },
            { kicker: 'Evidence', color: ACCENTS.pink, title: 'Photos with every Pulse.', body: "Up to four. The pothole, the streetlight, the lot — easier for the city to act when there's a picture." },
            { kicker: 'Proximity', color: ACCENTS.green, title: 'You live here, you vote here.', body: "Outside the radius, you can't. Nobody in Madison gets to weigh in on what we do here." }
          ].map((card, i) => {
            const k = `card-${i}`
            const isHovered = hover === k
            return (
              <div
                key={i}
                onMouseEnter={() => setHover(k)}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: 'clamp(24px, 3vw, 36px) clamp(20px, 2.5vw, 32px) clamp(28px, 3.5vw, 40px)',
                  borderRight: `1px solid ${c.ink}22`,
                  borderBottom: `1px solid ${c.ink}22`,
                  position: 'relative',
                  background: isHovered ? `${card.color}10` : 'transparent',
                  transition: 'background 0.3s ease',
                  cursor: 'default'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: card.color,
                  transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
                <div style={{
                  ...tag(card.color),
                  fontSize: 10,
                  marginBottom: 14
                }}>{card.kicker}</div>
                <h3 style={{
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  margin: 0,
                  color: c.ink
                }}>{card.title}</h3>
                <p style={{
                  fontSize: 14,
                  color: c.inkSoft,
                  margin: '10px 0 0',
                  lineHeight: 1.55
                }}>{card.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─────────────── PRIVACY ─────────────── */}
      <section id="privacy" data-r="privacy" style={{
        ...reveal('privacy'),
        borderTop: `2px solid ${c.ink}`,
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)'
        }}>
          <div>
            <div style={{ ...tag(ACCENTS.purple), marginBottom: 16 }}>§ Four — Privacy</div>
            <h2 style={{
              fontSize: 'clamp(32px, 4.8vw, 60px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 0.98,
              margin: 0,
              color: c.ink
            }}>
              Verified<br />doesn't mean<br />exposed.
            </h2>
            <p style={{
              fontSize: 17,
              color: c.inkSoft,
              marginTop: 24,
              lineHeight: 1.55,
              maxWidth: 460
            }}>
              You're verified so we can keep bots out. After that, what
              you do here stays yours.
            </p>
          </div>
          <div>
            {[
              { color: ACCENTS.green, title: 'Phone + ZIP. Not government ID.', body: "We confirm you're real and you live here. That's it." },
              { color: ACCENTS.purple, title: 'Incognito if you want it.', body: 'One button. Every action anonymous. Still counted.' },
              { color: ACCENTS.pink, title: 'No ads. No data sale. Ever.', body: 'Our customer is the city, not an advertiser.' },
              { color: ACCENTS.indigo, title: 'Your votes are yours.', body: 'Who voted what stays private. Even from us.' }
            ].map((row, i) => {
              const k = `priv-${i}`
              const isHovered = hover === k
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover(k)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    borderTop: i === 0 ? `1px solid ${c.ink}` : `1px solid ${c.ink}22`,
                    padding: '22px 16px 22px 22px',
                    margin: '0 -16px',
                    position: 'relative',
                    cursor: 'default'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: 22,
                    bottom: 22,
                    width: 3,
                    background: row.color,
                    transform: isHovered ? 'scaleY(1)' : 'scaleY(0.4)',
                    transformOrigin: 'top',
                    transition: 'transform 0.3s ease'
                  }} />
                  <strong style={{
                    display: 'block',
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 6,
                    letterSpacing: '-0.005em',
                    color: isHovered ? row.color : c.ink,
                    transition: 'color 0.25s ease'
                  }}>{row.title}</strong>
                  <p style={{ fontSize: 14, color: c.inkSoft, margin: 0, lineHeight: 1.55 }}>{row.body}</p>
                </div>
              )
            })}
            <div style={{ borderTop: `1px solid ${c.ink}22`, height: 0 }} />
          </div>
        </div>
      </section>

      {/* ─────────────── FOR CITY HALL — always inverted ─────────────── */}
      <section data-r="city" style={{
        ...reveal('city'),
        background: c.inversePaper,
        color: c.inverseInk,
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            ...tag(ACCENTS.amber),
            marginBottom: 18
          }}>§ Five — For city hall</div>
          <h2 style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            margin: 0,
            color: c.inverseInk,
            maxWidth: 900
          }}>
            You can't be at every<br />
            kitchen table.
          </h2>
          <p style={{
            fontSize: 'clamp(17px, 1.6vw, 21px)',
            color: c.inverseInkSoft,
            marginTop: 32,
            lineHeight: 1.55,
            maxWidth: 660
          }}>
            Pulse brings the kitchen tables to you. Verified, ranked by
            consensus, sorted by department. No survey gymnastics. No
            Facebook shouting match. Just signal.
          </p>

          <div style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 0,
            borderTop: `1px solid ${c.inverseInk}33`
          }}>
            {[
              { color: ACCENTS.green, label: 'Verified', body: 'Residents only. No anonymous trolling, no astroturf.' },
              { color: ACCENTS.indigo, label: 'Ranked', body: 'The community votes. The top issues sort themselves.' },
              { color: ACCENTS.pink, label: 'Live', body: 'Issues surface as they happen, not months later in a survey.' }
            ].map((card, i) => {
              const k = `city-${i}`
              const isHovered = hover === k
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover(k)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    padding: '28px clamp(20px, 2.5vw, 32px) 28px 16px',
                    margin: '0 -16px',
                    borderBottom: `1px solid ${c.inverseInk}22`,
                    position: 'relative',
                    cursor: 'default',
                    background: isHovered ? `${card.color}1A` : 'transparent',
                    transition: 'background 0.3s ease'
                  }}
                >
                  <div style={{
                    ...tag(card.color),
                    marginBottom: 10
                  }}>{card.label}</div>
                  <p style={{ fontSize: 14, color: c.inverseInkSoft, margin: 0, lineHeight: 1.5, maxWidth: 280 }}>{card.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────── FINAL CTA ─────────────── */}
      <section data-r="cta" style={{
        ...reveal('cta'),
        padding: 'clamp(72px, 10vw, 128px) clamp(20px, 4vw, 40px)',
        textAlign: 'left',
        maxWidth: 1100,
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: 'clamp(40px, 7vw, 96px)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 0.94,
          margin: 0,
          color: c.ink
        }}>
          Your city<br />
          is already talking.<br />
          Make sure it's<br />
          <span style={{
            display: 'inline-block',
            background: `linear-gradient(120deg, ${ACCENTS.pink}, ${ACCENTS.purple}, ${ACCENTS.pink})`,
            backgroundSize: '200% 200%',
            animation: 'accent-shine 6s ease-in-out infinite',
            color: '#FFFFFF',
            padding: '0 18px'
          }}>being heard.</span>
        </h2>
        <p style={{
          fontSize: 17,
          color: c.inkSoft,
          marginTop: 32,
          maxWidth: 540,
          lineHeight: 1.55
        }}>
          Live in Oshkosh today. Coming to the cities that ask for it next.
        </p>
        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <button
            onClick={onLaunchApp}
            onMouseEnter={() => setHover('final-cta')}
            onMouseLeave={() => setHover(null)}
            style={primaryBtn('final-cta')}
          >
            Open Pulse
            <span style={{ transition: 'transform 0.25s ease', transform: hover === 'final-cta' ? 'translateX(4px)' : 'none' }}>→</span>
          </button>
          <a
            href="mailto:tylere.moxon@gmail.com?subject=Bring%20Pulse%20to%20our%20city"
            onMouseEnter={() => setHover('final-mail')}
            onMouseLeave={() => setHover(null)}
            style={secondaryBtn('final-mail')}
          >Bring Pulse to your city</a>
        </div>
      </section>

      {/* ─────────────── COLOPHON ─────────────── */}
      <footer style={{
        borderTop: `2px solid ${c.ink}`,
        padding: '28px clamp(20px, 4vw, 40px)',
        fontSize: 11,
        color: c.inkMute,
        textTransform: 'uppercase',
        letterSpacing: '0.16em'
      }}>
        <div style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <span>Pulse — Civic Technologies</span>
          <span>Set in Space Mono — Made in Oshkosh, WI — © {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
