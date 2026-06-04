import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing
} from 'remotion'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'

const { fontFamily } = loadInter()

// ─── App palette — matches the actual Pulse PWA ─────────────────────────
const BG = '#0F0F1A'
const BG_CARD = '#1A1A2E'
const BORDER = 'rgba(255, 255, 255, 0.08)'
const BORDER_STRONG = 'rgba(255, 255, 255, 0.16)'
const TEXT = '#F5F5FA'
const TEXT_DIM = '#C4B5FD'
const TEXT_MUTE = '#9CA3AF'
const PINK = '#FF3366'
const PINK_GLOW = 'rgba(255, 51, 102, 0.45)'
const GREEN = '#22C55E'
const PURPLE = '#A855F7'
const INDIGO = '#6366F1'
const AMBER = '#F59E0B'
const BLUE = '#3B82F6'

// ─── Helpers ────────────────────────────────────────────────────────────

const useSlideUp = (startFrame: number) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.6 }
  })
  return {
    opacity: interpolate(t, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(t, [0, 1], [40, 0])}px)`
  }
}

const useFadeIn = (startFrame: number, durationFrames = 18) => {
  const frame = useCurrentFrame()
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
}

const usePop = (startFrame: number) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 10, stiffness: 200, mass: 0.5 }
  })
  return {
    opacity: interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `scale(${interpolate(t, [0, 1], [0.4, 1])})`
  }
}

// Animated number ticker that interpolates between two integer values.
const useTicker = (startFrame: number, fromValue: number, toValue: number, durationFrames = 30) => {
  const frame = useCurrentFrame()
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  )
  return Math.floor(fromValue + (toValue - fromValue) * t)
}

// ─── UI atoms ────────────────────────────────────────────────────────────

const PulseLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill={BG_CARD} />
    <polyline
      points="4,18 9,18 12,10 16,22 20,14 23,18 28,18"
      fill="none"
      stroke={PINK}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// Touch ripple — white dot with a pink ring that scales out + fades.
// Pass a startFrame relative to the parent Sequence. Will auto-self-destruct
// after ~30 frames; just stop rendering it.
const TouchTap: React.FC<{ x: number; y: number; startFrame: number }> = ({ x, y, startFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const localFrame = frame - startFrame

  const dotT = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 250, mass: 0.4 } })
  const ringT = interpolate(localFrame, [0, 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  })
  const dotScale = interpolate(dotT, [0, 0.6, 1], [0, 1.15, 0.85])
  const dotOpacity = interpolate(localFrame, [0, 6, 24, 36], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })
  const ringScale = interpolate(ringT, [0, 1], [0.4, 2.4])
  const ringOpacity = interpolate(ringT, [0, 1], [0.9, 0])

  if (localFrame < 0 || localFrame > 40) return null

  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 0,
      height: 0,
      pointerEvents: 'none'
    }}>
      <div style={{
        position: 'absolute',
        left: -70,
        top: -70,
        width: 140,
        height: 140,
        borderRadius: 70,
        border: `4px solid ${PINK}`,
        transform: `scale(${ringScale})`,
        opacity: ringOpacity
      }} />
      <div style={{
        position: 'absolute',
        left: -42,
        top: -42,
        width: 84,
        height: 84,
        borderRadius: 42,
        background: 'rgba(255, 255, 255, 0.92)',
        boxShadow: `0 0 36px ${PINK_GLOW}`,
        transform: `scale(${dotScale})`,
        opacity: dotOpacity
      }} />
    </div>
  )
}

// App-style top header that anchors every scene.
const AppHeader: React.FC<{ activeTab?: 'feed' | 'explore' | 'activity' }> = ({ activeTab = 'feed' }) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '32px 64px 24px',
    borderBottom: `1px solid ${BORDER}`,
    background: BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <PulseLogo size={36} />
      <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Pulse</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {(['feed', 'explore', 'activity'] as const).map(tab => (
        <div key={tab} style={{
          padding: '10px 22px',
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          color: activeTab === tab ? PINK : TEXT_MUTE,
          background: activeTab === tab ? `${PINK}22` : 'transparent',
          border: activeTab === tab ? `1px solid ${PINK}66` : '1px solid transparent',
          textTransform: 'capitalize'
        }}>{tab}</div>
      ))}
    </div>
  </div>
)

// PostCard mock — laid out close to the in-app component
const PulseCard: React.FC<{
  category: { name: string; color: string }
  title: string
  location: string
  votes: number
  comments: number
  author: string
  voteHighlight?: boolean
  scale?: number
}> = ({ category, title, location, votes, comments, author, voteHighlight = false, scale = 1 }) => (
  <div style={{
    background: BG_CARD,
    borderRadius: 20,
    padding: '32px 36px',
    border: `1px solid ${BORDER}`,
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.35)',
    fontFamily,
    transform: `scale(${scale})`
  }}>
    {/* Category + location row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <span style={{
        padding: '6px 14px',
        borderRadius: 8,
        background: `${category.color}22`,
        border: `1px solid ${category.color}44`,
        color: category.color,
        fontSize: 14,
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>{category.name}</span>
      <span style={{ fontSize: 16, color: TEXT_MUTE }}>· {location}</span>
    </div>

    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      {/* Vote column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: voteHighlight ? PINK : 'rgba(255, 255, 255, 0.05)',
          border: voteHighlight ? `2px solid ${PINK}` : `1px solid ${BORDER_STRONG}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: voteHighlight ? 'white' : TEXT_MUTE,
          fontSize: 38,
          fontWeight: 800,
          boxShadow: voteHighlight ? `0 0 28px ${PINK_GLOW}` : 'none'
        }}>▲</div>
        <span style={{
          fontSize: 30,
          fontWeight: 800,
          color: voteHighlight ? PINK : TEXT,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em'
        }}>{votes}</span>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${BORDER_STRONG}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: TEXT_MUTE,
          fontSize: 38,
          fontWeight: 800
        }}>▼</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: 36,
          fontWeight: 800,
          color: TEXT,
          margin: 0,
          marginBottom: 14,
          letterSpacing: '-0.015em',
          lineHeight: 1.2
        }}>{title}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 18, color: TEXT_MUTE }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>💬</span>
            <span style={{ color: TEXT, fontWeight: 600 }}>{comments}</span>
            <span>replies</span>
          </span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: TEXT, fontWeight: 700 }}>{author}</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 6,
              background: `${GREEN}22`,
              color: GREEN,
              fontSize: 13,
              fontWeight: 700
            }}>
              ✓ Verified
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
)

// Caption strip — sits above the UI scene as a moment of narration
const Caption: React.FC<{ text: string; color?: string; startFrame: number }> = ({
  text,
  color = PINK,
  startFrame
}) => {
  const slide = useSlideUp(startFrame)
  return (
    <div style={{
      ...slide,
      position: 'absolute',
      top: 160,
      left: 64,
      right: 64,
      fontFamily,
      fontSize: 14,
      fontWeight: 800,
      color,
      letterSpacing: '0.24em',
      textTransform: 'uppercase'
    }}>{text}</div>
  )
}

// ─── Scene 1: Tap to vote (0–4s) ────────────────────────────────────────
const Scene1Tap: React.FC = () => {
  const headerFade = useFadeIn(2, 14)
  const cardSlide = useSlideUp(8)
  const tapFrame = 60
  const frame = useCurrentFrame()
  // Vote button hits "highlight" state right after the tap lands
  const highlighted = frame >= tapFrame + 6
  const tickerVotes = useTicker(tapFrame + 6, 142, 143, 6)

  return (
    <AbsoluteFill>
      <div style={{ opacity: headerFade }}>
        <AppHeader activeTab="feed" />
      </div>
      <Caption text="One tap. One vote." startFrame={4} />
      <div style={{
        ...cardSlide,
        position: 'absolute',
        top: 240,
        left: 120,
        right: 120
      }}>
        <PulseCard
          category={{ name: 'Pothole', color: '#FF6B35' }}
          title="Massive potholes on Main & 9th — bent my rim last week"
          location="Main St & 9th Ave"
          votes={tickerVotes}
          comments={18}
          author="Marcus T."
          voteHighlight={highlighted}
        />
      </div>
      {/* Touch indicator sits over the upvote button */}
      <TouchTap x={278} y={398} startFrame={tapFrame} />
    </AbsoluteFill>
  )
}

// ─── Scene 2: Consensus forms — vote count rapidly ticks (4–9s) ─────────
const Scene2Consensus: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = useFadeIn(0, 8)
  const cardFade = useFadeIn(0, 8)
  // Two phases of fast ticking — gives the count a "burst" feel
  const votes1 = useTicker(0, 143, 287, 30)
  const votes2 = useTicker(30, 287, 491, 30)
  const votes3 = useTicker(60, 491, 742, 36)
  const votes = frame < 30 ? votes1 : frame < 60 ? votes2 : votes3

  // Trending badge appears at frame 60
  const trendingPop = usePop(60)

  return (
    <AbsoluteFill>
      <div style={{ opacity: headerFade }}>
        <AppHeader activeTab="feed" />
      </div>
      <Caption text="Watch consensus form." startFrame={0} />
      <div style={{
        opacity: cardFade,
        position: 'absolute',
        top: 240,
        left: 120,
        right: 120
      }}>
        <PulseCard
          category={{ name: 'Pothole', color: '#FF6B35' }}
          title="Massive potholes on Main & 9th — bent my rim last week"
          location="Main St & 9th Ave"
          votes={votes}
          comments={18}
          author="Marcus T."
          voteHighlight
        />
      </div>
      {/* Trending badge pops in */}
      <div style={{
        ...trendingPop,
        position: 'absolute',
        top: 260,
        right: 100,
        padding: '12px 22px',
        borderRadius: 14,
        background: PINK,
        color: 'white',
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: `0 4px 28px ${PINK_GLOW}`,
        fontFamily,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8
      }}>
        🔥 Trending
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 3: A real comment lands (9–14s) ───────────────────────────────
const Scene3Comment: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const headerFade = useFadeIn(0, 8)
  const titleSlide = useSlideUp(0)
  const commentSlide = useSlideUp(20)
  const verifiedPop = usePop(60)
  const tapFrame = 100
  const ticker = useTicker(tapFrame + 6, 12, 13, 6)

  // Typewriter — reveal one character at a time
  const fullText = 'This corner is dangerous for kids walking to school. My daughter crosses here every morning.'
  const charsPerFrame = 1.3
  const charsRevealed = Math.min(
    fullText.length,
    Math.floor(Math.max(0, frame - 30) * charsPerFrame)
  )
  const typedText = fullText.slice(0, charsRevealed)

  return (
    <AbsoluteFill>
      <div style={{ opacity: headerFade }}>
        <AppHeader activeTab="feed" />
      </div>
      <Caption text="With real neighbors." startFrame={0} />

      {/* Post title (smaller, condensed) */}
      <div style={{
        ...titleSlide,
        position: 'absolute',
        top: 230,
        left: 120,
        right: 120
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: '#FF6B3522',
            border: '1px solid #FF6B3544',
            color: '#FF6B35',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily
          }}>Pothole</span>
          <span style={{ fontSize: 16, color: TEXT_MUTE, fontFamily }}>· Main St & 9th Ave</span>
        </div>
        <div style={{
          fontSize: 32,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.015em',
          lineHeight: 1.25,
          fontFamily
        }}>Massive potholes on Main & 9th — bent my rim last week</div>
      </div>

      {/* Comment card */}
      <div style={{
        ...commentSlide,
        position: 'absolute',
        top: 460,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 18,
        padding: '28px 32px',
        border: `1px solid ${BORDER}`,
        fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            background: `linear-gradient(135deg, ${PINK}, ${PURPLE})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 24,
            fontWeight: 800
          }}>D</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Desiree W.</span>
              <span style={{
                ...verifiedPop,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 8,
                background: `${GREEN}22`,
                color: GREEN,
                fontSize: 13,
                fontWeight: 700
              }}>✓ Verified resident</span>
            </div>
            <span style={{ fontSize: 14, color: TEXT_MUTE }}>2 minutes ago</span>
          </div>
        </div>

        <p style={{
          fontSize: 22,
          color: TEXT_DIM,
          margin: 0,
          marginBottom: 18,
          lineHeight: 1.45,
          minHeight: 100
        }}>{typedText}<span style={{ opacity: (frame % 16) > 8 ? 1 : 0 }}>|</span></p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 12,
            background: frame >= tapFrame + 6 ? `${PINK}22` : 'rgba(255, 255, 255, 0.05)',
            border: frame >= tapFrame + 6 ? `1px solid ${PINK}` : `1px solid ${BORDER}`,
            color: frame >= tapFrame + 6 ? PINK : TEXT_MUTE,
            fontSize: 18,
            fontWeight: 700
          }}>▲ {ticker}</div>
        </div>
      </div>

      <TouchTap x={250} y={700} startFrame={tapFrame} />
    </AbsoluteFill>
  )
}

// ─── Scene 4: Verification flow (14–21s) ─────────────────────────────────
const Scene4Verify: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = useFadeIn(0, 8)
  const modalSlide = useSlideUp(12)

  // Typewriter ZIP
  const zip = '54901'
  const zipChars = Math.min(zip.length, Math.max(0, Math.floor((frame - 50) / 6)))
  const typedZip = zip.slice(0, zipChars)

  // Typewriter phone
  const phone = '(920) 555-0124'
  const phoneChars = Math.min(phone.length, Math.max(0, Math.floor((frame - 90) / 4)))
  const typedPhone = phone.slice(0, phoneChars)

  // Submit button tap → verified badge
  const submitTapFrame = 150
  const badgePop = usePop(submitTapFrame + 8)
  const badgeSpin = interpolate(
    frame,
    [submitTapFrame + 8, submitTapFrame + 32],
    [0, 720],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  )

  const showVerifiedOverlay = frame >= submitTapFrame + 8

  return (
    <AbsoluteFill>
      <div style={{ opacity: headerFade }}>
        <AppHeader activeTab="feed" />
      </div>
      <Caption text="Verified residents only." startFrame={0} />

      {/* Modal */}
      <div style={{
        ...modalSlide,
        position: 'absolute',
        top: 220,
        left: 360,
        right: 360,
        background: BG_CARD,
        borderRadius: 24,
        border: `1px solid ${BORDER}`,
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
        fontFamily
      }}>
        {/* Modal hero */}
        <div style={{
          background: `linear-gradient(135deg, ${PINK} 0%, #C2185B 100%)`,
          padding: '32px 36px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 28,
            margin: '0 auto 12px'
          }}>✓</div>
          <h2 style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em'
          }}>Get verified</h2>
          <p style={{
            margin: '6px 0 0',
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.9)'
          }}>Phone + ZIP. Confirm you live here.</p>
        </div>

        {/* Form */}
        <div style={{ padding: '32px 36px 36px' }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT_DIM,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>ZIP code</div>
            <div style={{
              height: 64,
              borderRadius: 14,
              border: typedZip.length === 5 ? `1.5px solid ${PINK}` : `1px solid ${BORDER_STRONG}`,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0 22px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: '0.08em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {typedZip}<span style={{ opacity: (frame % 16) > 8 && typedZip.length < 5 ? 1 : 0, color: PINK }}>|</span>
              {typedZip.length === 5 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 14,
                  color: GREEN,
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}>✓ Confirmed resident</span>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 26 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT_DIM,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>Phone</div>
            <div style={{
              height: 64,
              borderRadius: 14,
              border: typedPhone.length === phone.length ? `1.5px solid ${PINK}` : `1px solid ${BORDER_STRONG}`,
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0 22px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: TEXT,
              fontVariantNumeric: 'tabular-nums'
            }}>
              {typedPhone}<span style={{ opacity: (frame % 16) > 8 && typedPhone.length < phone.length ? 1 : 0, color: PINK }}>|</span>
            </div>
          </div>

          <div style={{
            height: 68,
            borderRadius: 14,
            background: PINK,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: `0 8px 28px ${PINK_GLOW}`
          }}>Verify and continue →</div>
        </div>
      </div>

      <TouchTap x={960} y={780} startFrame={submitTapFrame} />

      {/* Verified celebration overlay */}
      {showVerifiedOverlay && (
        <AbsoluteFill style={{
          background: 'rgba(15, 15, 26, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            ...badgePop,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
            fontFamily
          }}>
            <div style={{
              width: 200,
              height: 200,
              borderRadius: 50,
              background: GREEN,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 110,
              fontWeight: 800,
              boxShadow: `0 0 80px ${GREEN}66`,
              transform: `rotate(${badgeSpin}deg)`
            }}>✓</div>
            <div style={{
              fontSize: 56,
              fontWeight: 800,
              color: TEXT,
              letterSpacing: '-0.02em'
            }}>You're verified.</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}

// ─── Scene 5: Question Pulse → Verdict (21–26s) ─────────────────────────
const Scene5Verdict: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = useFadeIn(0, 8)
  const cardSlide = useSlideUp(8)
  const answer1Slide = useSlideUp(36)
  const answer2Slide = useSlideUp(52)
  const answer3Slide = useSlideUp(68)
  const verdictTap = 110
  const verdictPop = usePop(verdictTap + 6)

  const topVotes = useTicker(verdictTap + 6, 287, 412, 24)
  const showVerdict = frame >= verdictTap + 6

  return (
    <AbsoluteFill>
      <div style={{ opacity: headerFade }}>
        <AppHeader activeTab="feed" />
      </div>
      <Caption text="Verdicts decided by the community." startFrame={0} color={INDIGO} />

      {/* Question Pulse card */}
      <div style={{
        ...cardSlide,
        position: 'absolute',
        top: 230,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 20,
        padding: '32px 36px',
        border: `1px solid ${INDIGO}55`,
        boxShadow: `0 8px 40px ${INDIGO}22`,
        fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: `${INDIGO}22`,
            border: `1px solid ${INDIGO}55`,
            color: INDIGO,
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>? Question</span>
        </div>
        <div style={{
          fontSize: 32,
          fontWeight: 800,
          color: TEXT,
          margin: 0,
          letterSpacing: '-0.015em',
          lineHeight: 1.25
        }}>Where should the next dog park go — north side or south?</div>
      </div>

      {/* Answers */}
      <div style={{
        position: 'absolute',
        top: 460,
        left: 120,
        right: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}>
        <AnswerRow
          style={answer1Slide}
          rank={1}
          text="North side. The west cluster doesn't have a single off-leash area."
          author="DeShawn R."
          votes={topVotes}
          highlighted={showVerdict}
          showVerdict={showVerdict}
          verdictPopStyle={verdictPop}
        />
        <AnswerRow
          style={answer2Slide}
          rank={2}
          text="South side — Quincy Park is half empty, easy retrofit."
          author="Jamie L."
          votes={184}
          highlighted={false}
        />
        <AnswerRow
          style={answer3Slide}
          rank={3}
          text="Both? Split the budget. The city is bigger than one park."
          author="Natalie K."
          votes={97}
          highlighted={false}
        />
      </div>

      <TouchTap x={960} y={620} startFrame={verdictTap} />
    </AbsoluteFill>
  )
}

const AnswerRow: React.FC<{
  style: React.CSSProperties
  rank: number
  text: string
  author: string
  votes: number
  highlighted: boolean
  showVerdict?: boolean
  verdictPopStyle?: React.CSSProperties
}> = ({ style, rank, text, author, votes, highlighted, showVerdict, verdictPopStyle }) => (
  <div style={{
    ...style,
    background: highlighted ? `${INDIGO}1A` : BG_CARD,
    borderRadius: 16,
    padding: '20px 26px',
    border: highlighted ? `1.5px solid ${INDIGO}` : `1px solid ${BORDER}`,
    display: 'flex',
    alignItems: 'center',
    gap: 22,
    fontFamily,
    position: 'relative'
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      background: highlighted ? INDIGO : 'rgba(255, 255, 255, 0.05)',
      color: highlighted ? 'white' : TEXT_MUTE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      fontWeight: 800,
      flexShrink: 0
    }}>{rank}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 20,
        color: TEXT,
        marginBottom: 6,
        lineHeight: 1.35
      }}>"{text}"</div>
      <div style={{ fontSize: 14, color: TEXT_MUTE, fontWeight: 600 }}>
        — {author} <span style={{ color: GREEN }}>✓</span>
      </div>
    </div>
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '12px 18px',
      borderRadius: 12,
      background: highlighted ? INDIGO : 'rgba(255, 255, 255, 0.05)',
      color: highlighted ? 'white' : TEXT,
      fontWeight: 800,
      flexShrink: 0,
      minWidth: 86
    }}>
      <span style={{ fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{votes}</span>
      <span style={{ fontSize: 11, opacity: 0.85, letterSpacing: '0.08em' }}>VOTES</span>
    </div>
    {showVerdict && rank === 1 && (
      <div style={{
        ...verdictPopStyle,
        position: 'absolute',
        top: -18,
        right: 28,
        padding: '6px 14px',
        borderRadius: 10,
        background: INDIGO,
        color: 'white',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        boxShadow: `0 8px 24px ${INDIGO}66`
      }}>★ Verdict</div>
    )}
  </div>
)

// ─── End card (26–30s) ───────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const brandPop = usePop(0)
  const titleSlide = useSlideUp(14)
  const urlSlide = useSlideUp(24)
  const ctaSlide = useSlideUp(34)
  // Continuous pulse on the brand mark
  const pulseScale = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.06, 1],
    { easing: Easing.inOut(Easing.cubic) }
  )

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      padding: '120px 140px',
      fontFamily,
      background: BG
    }}>
      <div style={{
        ...brandPop,
        marginBottom: 36
      }}>
        <div style={{ transform: `scale(${pulseScale})` }}>
          <PulseLogo size={220} />
        </div>
      </div>
      <div style={{
        ...titleSlide,
        fontSize: 84,
        fontWeight: 800,
        color: TEXT,
        letterSpacing: '-0.03em',
        textAlign: 'center'
      }}>Make sure your<br />city hears you.</div>
      <div style={{
        ...urlSlide,
        marginTop: 28,
        fontSize: 30,
        fontWeight: 700,
        color: TEXT_DIM,
        letterSpacing: '0.04em'
      }}>pulse-civic.vercel.app</div>
      <div style={{
        ...ctaSlide,
        marginTop: 32,
        background: PINK,
        color: 'white',
        padding: '22px 44px',
        borderRadius: 18,
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        boxShadow: `0 12px 40px ${PINK_GLOW}`
      }}>Open Pulse →</div>
    </AbsoluteFill>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────
export const PulsePromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily }}>
      <Sequence from={0}   durationInFrames={120}><Scene1Tap /></Sequence>
      <Sequence from={120} durationInFrames={150}><Scene2Consensus /></Sequence>
      <Sequence from={270} durationInFrames={150}><Scene3Comment /></Sequence>
      <Sequence from={420} durationInFrames={210}><Scene4Verify /></Sequence>
      <Sequence from={630} durationInFrames={150}><Scene5Verdict /></Sequence>
      <Sequence from={780} durationInFrames={120}><EndCard /></Sequence>
    </AbsoluteFill>
  )
}
