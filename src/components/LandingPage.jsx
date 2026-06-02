import { useEffect, useRef, useState } from 'react'

// Editorial / civic palette — picked via ui-ux-pro-max skill for the
// "Accessible & Ethical" style (government/public/inclusive products,
// WCAG AAA). Light paper, near-black ink, pink only on the CTA. Anti-
// pattern explicitly avoided: AI purple/pink gradients.
const C = {
  ink: '#09090B',
  inkSoft: '#27272A',
  inkMute: '#52525B',
  paper: '#FAFAF7',       // slight warm off-white
  paperAlt: '#F2F1EC',    // alt panel
  rule: '#18181B',
  accent: '#EC4899',
  accentDeep: '#BE185D'
}

const FONT_MONO = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace"

const primaryBtn = {
  background: C.ink,
  color: C.paper,
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
  gap: 10,
  transition: 'background 0.2s ease'
}

const secondaryBtn = {
  background: 'transparent',
  color: C.ink,
  border: `1.5px solid ${C.ink}`,
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
  gap: 10,
  transition: 'all 0.2s ease'
}

const tag = {
  fontSize: 11,
  fontWeight: 700,
  color: C.inkMute,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  fontFamily: FONT_MONO
}

const ruleLine = {
  border: 'none',
  borderTop: `1px solid ${C.ink}`,
  margin: 0,
  opacity: 0.18
}

export default function LandingPage({ onLaunchApp }) {
  // Subtle reveal — opacity only, no transform tricks. Skill flagged motion
  // effects as an anti-pattern for this style.
  const [seen, setSeen] = useState(new Set())
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setSeen(prev => new Set([...prev, e.target.dataset.r]))
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('[data-r]').forEach(el => observerRef.current.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  const revealStyle = (id) => ({
    opacity: seen.has(id) ? 1 : 0,
    transition: 'opacity 0.6s ease'
  })

  return (
    <div style={{
      fontFamily: FONT_MONO,
      background: C.paper,
      color: C.ink,
      minHeight: '100vh',
      fontFeatureSettings: '"ss01", "ss02"'
    }}>
      {/* ─────────────────────────────────────────────────────────
          MASTHEAD — newspaper-style strip with issue line
         ───────────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: `2px solid ${C.ink}`,
        padding: '20px clamp(20px, 4vw, 40px)',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: C.ink
          }}>PULSE</span>
          <span style={{
            ...tag,
            fontSize: 10,
            letterSpacing: '0.22em'
          }}>Vol. I — Oshkosh, WI — Est. 2026</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#what" style={navLink}>What it is</a>
          <a href="#why" style={navLink}>The verdict</a>
          <a href="#privacy" style={navLink}>Privacy</a>
          <button onClick={onLaunchApp} style={primaryBtn}>Open the app →</button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────
          HERO — editorial, left-aligned, no center-hero template
         ───────────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(56px, 9vw, 112px) clamp(20px, 4vw, 40px) clamp(48px, 7vw, 80px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <div style={{ ...tag, marginBottom: 28 }}>
          A bulletin from the people who live here
        </div>
        <h1 style={{
          fontSize: 'clamp(48px, 8.5vw, 116px)',
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.045em',
          margin: 0,
          color: C.ink,
          maxWidth: 1100
        }}>
          The same twelve<br />
          people show up to<br />
          every council meeting.
        </h1>

        <div style={{
          marginTop: 'clamp(28px, 4vw, 44px)',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(20px, 3vw, 32px)',
          maxWidth: 720
        }}>
          <p style={{
            fontSize: 'clamp(17px, 1.6vw, 22px)',
            color: C.inkSoft,
            lineHeight: 1.5,
            margin: 0,
            fontWeight: 400
          }}>
            The rest of us stopped going. Pulse is for the rest of us.
            Verified residents post what's actually happening in their
            city, vote on what matters, and watch consensus form — live,
            in public, with no algorithm choosing for them.
          </p>
        </div>

        <div style={{ marginTop: 'clamp(36px, 5vw, 56px)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={onLaunchApp} style={primaryBtn}>Open Pulse →</button>
          <a href="#what" style={secondaryBtn}>Read the bulletin ↓</a>
        </div>
      </section>

      <hr style={ruleLine} />

      {/* ─────────────────────────────────────────────────────────
          WHAT IT IS — numbered manifesto, civic document feel
         ───────────────────────────────────────────────────────── */}
      <section id="what" data-r="what" style={{
        ...revealStyle('what'),
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
            <div style={{ ...tag, marginBottom: 16 }}>§ One</div>
            <h2 style={{
              fontSize: 'clamp(28px, 3.6vw, 44px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              margin: 0,
              color: C.ink
            }}>
              What Pulse<br />stands for.
            </h2>
          </div>

          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              {
                n: '01',
                title: 'Residents only.',
                body: 'Phone and ZIP verification confirms you actually live here. No outside agitators, no astroturfing, no anonymous trolls.'
              },
              {
                n: '02',
                title: 'One person, one vote.',
                body: 'No engagement algorithm. Pulses with the most real-resident votes rise. The ones without don\'t.'
              },
              {
                n: '03',
                title: 'Public consensus, in public.',
                body: 'Watch the vote counts tick up in real time. See the categories. See where the city actually stands.'
              },
              {
                n: '04',
                title: 'No ads. Ever.',
                body: 'Our customer is the city, not an advertiser. Your votes stay yours. Your data doesn\'t get sold.'
              }
            ].map((item, i) => (
              <li key={item.n} style={{
                display: 'grid',
                gridTemplateColumns: '72px 1fr',
                gap: 24,
                padding: '28px 0',
                borderTop: i === 0 ? `1px solid ${C.ink}` : `1px solid ${C.ink}22`
              }}>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: '0.05em',
                  paddingTop: 6
                }}>{item.n}</div>
                <div>
                  <h3 style={{
                    fontSize: 'clamp(22px, 2.4vw, 30px)',
                    fontWeight: 700,
                    letterSpacing: '-0.015em',
                    margin: 0,
                    color: C.ink
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: 16,
                    color: C.inkSoft,
                    margin: '8px 0 0',
                    lineHeight: 1.55,
                    maxWidth: 580
                  }}>{item.body}</p>
                </div>
              </li>
            ))}
            <li style={{ borderTop: `1px solid ${C.ink}22`, height: 0 }} />
          </ol>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          THE VERDICT — comparison as a printed document table
         ───────────────────────────────────────────────────────── */}
      <section id="why" data-r="why" style={{
        ...revealStyle('why'),
        background: C.paperAlt,
        borderTop: `2px solid ${C.ink}`,
        borderBottom: `2px solid ${C.ink}`,
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ ...tag, marginBottom: 18 }}>§ Two — The verdict</div>
          <h2 style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            margin: 0,
            color: C.ink,
            maxWidth: 940
          }}>
            Not another social network.<br />
            A way to actually be heard.
          </h2>

          {/* Header row */}
          <div style={{
            marginTop: 'clamp(40px, 5vw, 64px)',
            border: `2px solid ${C.ink}`,
            background: C.paper
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1.2fr',
              background: C.ink,
              color: C.paper,
              ...tag,
              color: C.paper,
              fontSize: 11
            }}>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${C.paper}22` }}>Item</div>
              <div style={{ padding: '14px 20px', borderRight: `1px solid ${C.paper}22` }}>Facebook / Nextdoor</div>
              <div style={{ padding: '14px 20px' }}>Pulse</div>
            </div>
            {[
              { f: 'Who can sign up', o: 'Anyone with an email', p: 'Verified residents only' },
              { f: 'Verification', o: 'Email or phone', p: 'Phone + ZIP residency' },
              { f: 'Bot accounts', o: 'Common', p: 'Gated by verification' },
              { f: 'What rises to the top', o: 'Engagement algorithm', p: 'Vote count from real neighbors' },
              { f: 'What comes out the other end', o: 'Rage threads', p: 'Structured signal for city hall' },
              { f: 'How we make money', o: 'Ads, attention, your data', p: 'City partnerships. No ads, ever.' }
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1.2fr',
                borderTop: `1px solid ${C.ink}22`,
                fontSize: 14
              }}>
                <div style={{ padding: '18px 20px', fontWeight: 700, borderRight: `1px solid ${C.ink}11`, color: C.ink }}>{row.f}</div>
                <div style={{ padding: '18px 20px', color: C.inkMute, borderRight: `1px solid ${C.ink}11`, textDecoration: 'line-through', textDecorationColor: `${C.inkMute}55` }}>{row.o}</div>
                <div style={{ padding: '18px 20px', fontWeight: 700, color: C.ink }}>{row.p}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          INSIDE — type-led feature list, no bento, no icon-boxes
         ───────────────────────────────────────────────────────── */}
      <section data-r="inside" style={{
        ...revealStyle('inside'),
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)',
        maxWidth: 1240,
        margin: '0 auto'
      }}>
        <div style={{ ...tag, marginBottom: 18 }}>§ Three — Inside</div>
        <h2 style={{
          fontSize: 'clamp(32px, 4.4vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          margin: 0,
          color: C.ink,
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
          borderTop: `1px solid ${C.ink}`
        }}>
          {[
            {
              kicker: 'Heatmap',
              title: 'Voices stack where the problems are.',
              body: 'The patterns show up that no single complaint ever could on its own.'
            },
            {
              kicker: 'Incognito',
              title: 'One button. Anonymous, still counted.',
              body: "Your votes, posts, and comments go anonymous. You're still verified. Your boss can't tell."
            },
            {
              kicker: 'Evidence',
              title: 'Photos with every Pulse.',
              body: "Up to four. The pothole, the streetlight, the lot — easier for the city to act when there's a picture."
            },
            {
              kicker: 'Proximity',
              title: 'You live here, you vote here.',
              body: 'Outside the radius, you can\'t. Nobody in Madison gets to weigh in on what we do here.'
            }
          ].map((card, i) => (
            <div key={i} style={{
              padding: 'clamp(24px, 3vw, 36px) clamp(20px, 2.5vw, 32px) clamp(28px, 3.5vw, 40px)',
              borderRight: `1px solid ${C.ink}22`,
              borderBottom: `1px solid ${C.ink}22`
            }}>
              <div style={{
                ...tag,
                fontSize: 10,
                marginBottom: 14,
                color: C.accent
              }}>{card.kicker}</div>
              <h3 style={{
                fontSize: 19,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                margin: 0,
                color: C.ink
              }}>{card.title}</h3>
              <p style={{
                fontSize: 14,
                color: C.inkSoft,
                margin: '10px 0 0',
                lineHeight: 1.55
              }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          PRIVACY — two-column editorial spread
         ───────────────────────────────────────────────────────── */}
      <section id="privacy" data-r="privacy" style={{
        ...revealStyle('privacy'),
        borderTop: `2px solid ${C.ink}`,
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
            <div style={{ ...tag, marginBottom: 16 }}>§ Four — Privacy</div>
            <h2 style={{
              fontSize: 'clamp(32px, 4.8vw, 60px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 0.98,
              margin: 0,
              color: C.ink
            }}>
              Verified<br />doesn't mean<br />exposed.
            </h2>
            <p style={{
              fontSize: 17,
              color: C.inkSoft,
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
              {
                title: 'Phone + ZIP. Not government ID.',
                body: "We confirm you're real and you live here. That's it."
              },
              {
                title: 'Incognito if you want it.',
                body: 'One button. Every action anonymous. Still counted.'
              },
              {
                title: 'No ads. No data sale. Ever.',
                body: 'Our customer is the city, not an advertiser.'
              },
              {
                title: 'Your votes are yours.',
                body: 'Who voted what stays private. Even from us.'
              }
            ].map((c, i) => (
              <div key={i} style={{
                borderTop: i === 0 ? `1px solid ${C.ink}` : `1px solid ${C.ink}22`,
                padding: '22px 0'
              }}>
                <strong style={{
                  display: 'block',
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 6,
                  letterSpacing: '-0.005em'
                }}>{c.title}</strong>
                <p style={{ fontSize: 14, color: C.inkSoft, margin: 0, lineHeight: 1.55 }}>{c.body}</p>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${C.ink}22`, height: 0 }} />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FOR CITY HALL — dark inverted spread
         ───────────────────────────────────────────────────────── */}
      <section data-r="city" style={{
        ...revealStyle('city'),
        background: C.ink,
        color: C.paper,
        padding: 'clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)'
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            ...tag,
            color: '#A1A1AA',
            marginBottom: 18
          }}>§ Five — For city hall</div>
          <h2 style={{
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            lineHeight: 0.98,
            margin: 0,
            color: C.paper,
            maxWidth: 900
          }}>
            You can't be at every<br />
            kitchen table.
          </h2>
          <p style={{
            fontSize: 'clamp(17px, 1.6vw, 21px)',
            color: '#D4D4D8',
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
            borderTop: `1px solid ${C.paper}33`
          }}>
            {[
              { label: 'Verified', body: 'Residents only. No anonymous trolling, no astroturf.' },
              { label: 'Ranked', body: 'The community votes. The top issues sort themselves.' },
              { label: 'Live', body: 'Issues surface as they happen, not months later in a survey.' }
            ].map((c, i) => (
              <div key={i} style={{
                padding: '28px clamp(20px, 2.5vw, 32px) 28px 0',
                borderBottom: `1px solid ${C.paper}22`
              }}>
                <div style={{
                  ...tag,
                  color: C.accent,
                  marginBottom: 10
                }}>{c.label}</div>
                <p style={{ fontSize: 14, color: '#D4D4D8', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          FINAL CTA — full-bleed accent strip
         ───────────────────────────────────────────────────────── */}
      <section data-r="cta" style={{
        ...revealStyle('cta'),
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
          color: C.ink
        }}>
          Your city<br />
          is already talking.<br />
          Make sure it's<br />
          <span style={{
            display: 'inline-block',
            background: C.accent,
            color: C.paper,
            padding: '0 18px'
          }}>being heard.</span>
        </h2>
        <p style={{
          fontSize: 17,
          color: C.inkSoft,
          marginTop: 32,
          maxWidth: 540,
          lineHeight: 1.55
        }}>
          Live in Oshkosh today. Coming to the cities that ask for it next.
        </p>
        <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          <button onClick={onLaunchApp} style={primaryBtn}>Open Pulse →</button>
          <a
            href="mailto:tylere.moxon@gmail.com?subject=Bring%20Pulse%20to%20our%20city"
            style={secondaryBtn}
          >Bring Pulse to your city</a>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          COLOPHON — masthead bookend
         ───────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `2px solid ${C.ink}`,
        padding: '28px clamp(20px, 4vw, 40px)',
        fontSize: 11,
        color: C.inkMute,
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

const navLink = {
  fontSize: 12,
  fontWeight: 700,
  color: C.ink,
  textDecoration: 'none',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  borderBottom: '1.5px solid transparent',
  paddingBottom: 2,
  transition: 'border-color 0.2s ease'
}
